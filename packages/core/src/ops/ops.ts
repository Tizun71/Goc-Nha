// SPDX-License-Identifier: AGPL-3.0-or-later

// Pure editing operations used by the AI bridge. They take a RoomDoc and return a new one,
// so a whole batch of AI changes becomes a single undo step. No DOM or store access here.

import type { FloorItem, Item, Kind, Room, RoomDoc, Wall, WallItem } from '../model/types'
import { FLOOR_DEFS, WALL_DEFS, defOf, isWallKind } from '../catalog/catalog'
import { WALLS, boundsOf, clampNum, clampWallItem, doorSwingPolygon, floorCorners, rotate, wallFrame, type Rect, type Vec } from '../geometry/geometry'
import { findIssues, polygonsOverlap } from '../layout/collision'
import { backBearing, directionName, frontBearing, northOf, wallBearing } from '../orientation/compass'
import { newId } from '../geometry/random'
import { isSolid, layerOf, supportOf } from '../model/layers'

export type Placement =
  | { type: 'wall'; wall: Wall; align?: 'start' | 'center' | 'end'; offset?: number; gap?: number }
  | { type: 'next_to'; target: string; side: 'left' | 'right' | 'front' | 'back'; gap?: number; face?: 'same' | 'toward' | 'away' }
  | { type: 'free' }

export type ItemFields = {
  x?: number
  y?: number
  w?: number
  d?: number
  h?: number
  rotation?: number
  color?: string | null
  wall?: Wall
  offset?: number
  elevation?: number
  hinge?: 'left' | 'right'
  opening?: 'in' | 'out'
  place?: Placement
}

export type Op =
  | ({ op: 'add'; kind: string } & ItemFields)
  | ({ op: 'update'; id: string } & ItemFields)
  | { op: 'remove'; id: string }

export type OpsResult = { doc: RoomDoc; touched: string[]; removed: string[]; notes: string[] }

const norm = (deg: number) => ((Math.round(deg) % 360) + 360) % 360

function clampSize(kind: Kind, field: 'w' | 'd' | 'h', value: number, notes: string[]) {
  const def = defOf(kind)
  const min = def.min[field]
  const max = def.max[field]
  if (def.mount === 'wall' && field === 'd') return 0
  const v = clampNum(Math.round(value), min, max)
  if (v !== Math.round(value)) notes.push(`${def.label}: ${field} ${Math.round(value)} cm is outside ${min}–${max}, used ${v} cm`)
  return v
}

/** Footprint size along the room axes for a floor item with the given rotation. */
function extent(w: number, d: number, rotation: number) {
  const b = boundsOf(floorCorners({ x: 0, y: 0, w, d, rotation }))
  return { ex: b.maxX - b.minX, ey: b.maxY - b.minY }
}

/** Search the floor for a spot where a footprint fits without overlapping anything. Prefers spots against a wall. */
export function findFreeSpot(doc: RoomDoc, w: number, d: number, rotation: number, ignoreId?: string): Vec | null {
  const { room } = doc
  const obstacles = doc.items
    .filter((it) => it.id !== ignoreId)
    .flatMap((it) => {
      if (it.mount === 'floor') return isSolid(it) ? [floorCorners(it)] : []
      const swing = doorSwingPolygon(room, it)
      return swing ? [swing] : []
    })
  const { ex, ey } = extent(w, d, rotation)
  let best: { p: Vec; score: number } | null = null
  const step = 5
  for (let y = ey / 2; y <= room.width - ey / 2 + 0.01; y += step)
    for (let x = ex / 2; x <= room.length - ex / 2 + 0.01; x += step) {
      const poly = floorCorners({ x, y, w, d, rotation })
      if (obstacles.some((o) => polygonsOverlap(poly, o))) continue
      const wallDist = Math.min(x - ex / 2, room.length - x - ex / 2, y - ey / 2, room.width - y - ey / 2)
      const centreDist = Math.hypot(x - room.length / 2, y - room.width / 2) / 1000
      const score = wallDist + centreDist
      if (!best || score < best.score) best = { p: { x: Math.round(x), y: Math.round(y) }, score }
    }
  return best?.p ?? null
}

function placeFloor(doc: RoomDoc, item: FloorItem, place: Placement, notes: string[]): FloorItem {
  const { room } = doc
  if (place.type === 'free') {
    // a rug or a ceiling light goes in the middle; nothing blocks it
    if (layerOf(item) === 'rug' || layerOf(item) === 'ceiling') return { ...item, x: Math.round(room.length / 2), y: Math.round(room.width / 2) }
    const spot = findFreeSpot(doc, item.w, item.d, item.rotation, item.id)
    if (!spot) {
      notes.push(`No free spot large enough for ${defOf(item.kind).label} (${item.w}×${item.d}); left at its current position`)
      return item
    }
    return { ...item, ...spot }
  }
  if (place.type === 'wall') {
    // back of the item against the wall, front facing into the room
    const f = wallFrame(room, place.wall)
    const gap = place.gap ?? 0
    const along =
      place.offset !== undefined
        ? place.offset + item.w / 2
        : place.align === 'start'
          ? item.w / 2
          : place.align === 'end'
            ? f.length - item.w / 2
            : f.length / 2
    const into = gap + item.d / 2
    return {
      ...item,
      rotation: f.rotation,
      x: Math.round(f.start.x + f.dir.x * along + f.inward.x * into),
      y: Math.round(f.start.y + f.dir.y * along + f.inward.y * into),
    }
  }
  const target = doc.items.find((it) => it.id === place.target)
  if (!target) throw new Error(`next_to target "${place.target}" not found`)
  if (target.mount !== 'floor') throw new Error('next_to target must be a floor item; use type "wall" to place along a wall')
  const face = place.face ?? 'same'
  const rotation = norm(target.rotation + (face === 'toward' ? (place.side === 'front' ? 180 : place.side === 'back' ? 0 : place.side === 'left' ? 90 : 270) : face === 'away' ? (place.side === 'front' ? 0 : place.side === 'back' ? 180 : place.side === 'left' ? 270 : 90) : 0))
  // size of the item measured along the target's own axes
  const rel = norm(rotation - target.rotation)
  const sideways = rel === 90 || rel === 270
  const alongX = sideways ? item.d : item.w
  const alongY = sideways ? item.w : item.d
  const gap = place.gap ?? 0
  const local =
    place.side === 'left'
      ? { x: -(target.w / 2 + gap + alongX / 2), y: 0 }
      : place.side === 'right'
        ? { x: target.w / 2 + gap + alongX / 2, y: 0 }
        : place.side === 'front'
          ? { x: 0, y: target.d / 2 + gap + alongY / 2 }
          : { x: 0, y: -(target.d / 2 + gap + alongY / 2) }
  const p = rotate(local, target.rotation)
  return { ...item, rotation, x: Math.round(target.x + p.x), y: Math.round(target.y + p.y) }
}

function placeWall(doc: RoomDoc, item: WallItem, place: Placement): WallItem {
  if (place.type !== 'wall') throw new Error(`${defOf(item.kind).label} hangs on a wall; use place type "wall"`)
  const len = wallFrame(doc.room, place.wall).length
  const offset =
    place.offset !== undefined ? place.offset : place.align === 'start' ? 0 : place.align === 'end' ? len - item.w : (len - item.w) / 2
  return { ...item, wall: place.wall, offset: Math.round(offset) }
}

function applyFields(doc: RoomDoc, item: Item, f: ItemFields, notes: string[]): Item {
  const { room } = doc
  if (item.mount === 'floor') {
    let next: FloorItem = { ...item }
    if (f.w !== undefined) next.w = clampSize(item.kind, 'w', f.w, notes)
    if (f.d !== undefined) next.d = clampSize(item.kind, 'd', f.d, notes)
    if (f.h !== undefined) next.h = clampSize(item.kind, 'h', f.h, notes)
    if (f.rotation !== undefined) next.rotation = norm(f.rotation)
    if (f.x !== undefined) next.x = Math.round(f.x)
    if (f.y !== undefined) next.y = Math.round(f.y)
    if (f.color !== undefined) next.color = f.color ?? undefined
    if (f.wall !== undefined || f.offset !== undefined || f.elevation !== undefined)
      notes.push(`${defOf(item.kind).label} stands on the floor; wall/offset/elevation ignored`)
    if (f.place) next = placeFloor(doc, next, f.place, notes)
    return next
  }
  let next: WallItem = { ...item }
  if (f.w !== undefined) next.w = clampSize(item.kind, 'w', f.w, notes)
  if (f.h !== undefined) next.h = clampSize(item.kind, 'h', f.h, notes)
  if (f.wall !== undefined) next.wall = f.wall
  if (f.offset !== undefined) next.offset = Math.round(f.offset)
  if (f.elevation !== undefined) next.elevation = Math.round(f.elevation)
  if (f.color !== undefined) next.color = f.color ?? undefined
  if (item.kind === 'door') {
    if (f.hinge) next.hinge = f.hinge
    if (f.opening) next.opening = f.opening
  }
  if (f.x !== undefined || f.y !== undefined || f.rotation !== undefined)
    notes.push(`${defOf(item.kind).label} hangs on a wall; position it with wall + offset, x/y/rotation ignored`)
  if (f.place) next = placeWall(doc, next, f.place)
  const maxElevation = Math.max(0, room.height - next.h)
  if (next.elevation > maxElevation) {
    notes.push(`${defOf(item.kind).label}: elevation lowered to ${maxElevation} cm so it stays below the ceiling`)
    next.elevation = maxElevation
  }
  next.elevation = Math.max(0, next.elevation)
  const clamped = clampWallItem(room, next)
  if (clamped.offset !== next.offset) notes.push(`${defOf(item.kind).label}: offset adjusted to ${clamped.offset} cm to stay on the wall`)
  return clamped
}

function createItem(doc: RoomDoc, kindName: string, f: ItemFields, notes: string[]): Item {
  if (!(kindName in FLOOR_DEFS) && !(kindName in WALL_DEFS))
    throw new Error(`Unknown kind "${kindName}". Valid kinds: ${[...Object.keys(FLOOR_DEFS), ...Object.keys(WALL_DEFS)].join(', ')}`)
  const kind = kindName as Kind
  const { room } = doc
  if (isWallKind(kind)) {
    const def = WALL_DEFS[kind]
    const base: WallItem = {
      id: newId(),
      mount: 'wall',
      kind,
      wall: f.wall ?? (kind === 'door' ? 'bottom' : 'top'),
      offset: 0,
      w: def.defaults.w,
      h: def.defaults.h,
      elevation: def.defaults.elevation,
      ...(kind === 'door' ? { hinge: 'left' as const, opening: 'in' as const } : {}),
    }
    const fields = { ...f }
    // centre on the wall unless told otherwise
    if (fields.offset === undefined && !fields.place) {
      const w = fields.w !== undefined ? clampSize(kind, 'w', fields.w, []) : base.w
      fields.offset = (wallFrame(room, base.wall).length - w) / 2
    }
    return applyFields(doc, base, fields, notes)
  }
  const def = FLOOR_DEFS[kind]
  const base: FloorItem = { id: newId(), mount: 'floor', kind, x: room.length / 2, y: room.width / 2, ...def.defaults, rotation: 0 }
  const placed = f.x === undefined && f.y === undefined && !f.place ? { ...f, place: { type: 'free' } as Placement } : f
  return applyFields(doc, base, placed, notes)
}

export function applyOps(doc: RoomDoc, ops: Op[]): OpsResult {
  let items = [...doc.items]
  const touched: string[] = []
  const removed: string[] = []
  const notes: string[] = []
  ops.forEach((op, i) => {
    const current: RoomDoc = { room: doc.room, items }
    try {
      if (op.op === 'add') {
        const item = createItem(current, op.kind, op, notes)
        items = [...items, item]
        touched.push(item.id)
      } else if (op.op === 'update') {
        const idx = items.findIndex((it) => it.id === op.id)
        if (idx < 0) throw new Error(`item "${op.id}" not found`)
        const next = applyFields(current, items[idx], op, notes)
        items = items.map((it, j) => (j === idx ? next : it))
        if (!touched.includes(op.id)) touched.push(op.id)
      } else if (op.op === 'remove') {
        if (!items.some((it) => it.id === op.id)) throw new Error(`item "${op.id}" not found`)
        items = items.filter((it) => it.id !== op.id)
        removed.push(op.id)
      } else {
        throw new Error(`unknown op "${(op as { op: string }).op}"`)
      }
    } catch (e) {
      throw new Error(`change #${i + 1} (${op.op}): ${(e as Error).message}`)
    }
  })
  return { doc: { room: doc.room, items }, touched: touched.filter((id) => !removed.includes(id)), removed, notes }
}

export function validateRoom(room: Room, patch: Partial<Room>): Room {
  const next = { ...room }
  const dim = (v: number | undefined, min: number, max: number, name: string) => {
    if (v === undefined) return undefined
    if (!Number.isFinite(v) || v < min || v > max) throw new Error(`${name} must be between ${min} and ${max} cm`)
    return Math.round(v)
  }
  next.length = dim(patch.length, 100, 2000, 'length') ?? next.length
  next.width = dim(patch.width, 100, 2000, 'width') ?? next.width
  next.height = dim(patch.height, 200, 500, 'height') ?? next.height
  if (patch.north !== undefined) next.north = norm(patch.north)
  return next
}

// ---------- descriptions for the AI ----------

export function describeItem(doc: RoomDoc, it: Item) {
  const { room } = doc
  const def = defOf(it.kind)
  const north = northOf(room)
  if (it.mount === 'floor') {
    const b = boundsOf(floorCorners(it))
    return {
      id: it.id,
      kind: it.kind,
      label: def.label,
      mount: 'floor' as const,
      x: it.x,
      y: it.y,
      w: it.w,
      d: it.d,
      h: it.h,
      rotation: it.rotation,
      color: it.color ?? def.color,
      layer: layerOf(it),
      ...(layerOf(it) === 'decor' ? { standsOn: supportOf(it, doc.items)?.id ?? 'floor' } : {}),
      bounds: { minX: round1(b.minX), minY: round1(b.minY), maxX: round1(b.maxX), maxY: round1(b.maxY) },
      frontFaces: directionName(frontBearing(it.rotation, north)),
      backFaces: directionName(backBearing(it.rotation, north)),
    }
  }
  return {
    id: it.id,
    kind: it.kind,
    label: def.label,
    mount: 'wall' as const,
    wall: it.wall,
    wallFaces: directionName(wallBearing(it.wall, north)),
    offset: it.offset,
    w: it.w,
    h: it.h,
    elevation: it.elevation,
    color: it.color ?? def.color,
    ...(it.kind === 'door' ? { hinge: it.hinge, opening: it.opening } : {}),
  }
}

const round1 = (v: number) => Math.round(v * 10) / 10

export function describeRoom(room: Room) {
  const north = northOf(room)
  return {
    ...room,
    north,
    areaM2: Math.round((room.length * room.width) / 1000) / 10,
    walls: Object.fromEntries(WALLS.map((w) => [w, { length: wallFrame(room, w).length, faces: directionName(wallBearing(w, north)) }])),
  }
}

/** Issues plus tight passages between furniture and free floor area. */
export function checkLayout(doc: RoomDoc) {
  const issues = [...findIssues(doc.items, doc.room)].map(([id, problems]) => {
    const it = doc.items.find((i) => i.id === id)!
    return { id, label: defOf(it.kind).label, problems }
  })
  const floor = doc.items.filter(isSolid)
  const rects = floor.map((it) => ({ it, r: boundsOf(floorCorners(it)) }))
  const passages: { between: [string, string]; gapCm: number }[] = []
  const MIN_PASSAGE = 60
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++) {
      // a chair tucked in at a desk or table is not a walkway
      if (isSeatAtTable(rects[i].it, rects[j].it)) continue
      const gap = rectGap(rects[i].r, rects[j].r)
      if (gap !== null && gap > 2 && gap < MIN_PASSAGE)
        passages.push({ between: [rects[i].it.id, rects[j].it.id], gapCm: Math.round(gap) })
    }
  const covered = floor.reduce((sum, it) => sum + it.w * it.d, 0)
  const total = doc.room.length * doc.room.width
  return {
    ok: issues.length === 0,
    issues,
    tightPassages: passages.map((p) => ({
      ...p,
      labels: p.between.map((id) => defOf(doc.items.find((it) => it.id === id)!.kind).label),
      note: `only ${p.gapCm} cm between them; ${MIN_PASSAGE} cm is the usual minimum to walk through`,
    })),
    floorCoveredPercent: Math.round((Math.min(covered, total) / total) * 100),
  }
}

function isSeatAtTable(a: FloorItem, b: FloorItem) {
  const cats = [defOf(a.kind).category, defOf(b.kind).category]
  return cats.includes('seating') && cats.includes('table')
}

/** Gap between two rectangles that face each other along one axis, or null if they are diagonal or overlapping. */
function rectGap(a: Rect, b: Rect): number | null {
  const overlapX = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX)
  const overlapY = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY)
  if (overlapY > 10 && overlapX < 0) return -overlapX
  if (overlapX > 10 && overlapY < 0) return -overlapY
  return null
}

export function catalog() {
  return [...Object.entries(FLOOR_DEFS), ...Object.entries(WALL_DEFS)].map(([kind, def]) => ({
    kind,
    label: def.label,
    en: def.en,
    category: def.category,
    mount: def.mount,
    ...(def.mount === 'floor' ? { layer: layerOf({ kind: kind as FloorItem['kind'] }) } : {}),
    defaultColor: def.color,
    defaults: def.mount === 'wall' ? { w: def.defaults.w, h: def.defaults.h, elevation: def.defaults.elevation } : def.defaults,
    min: def.mount === 'wall' ? { w: def.min.w, h: def.min.h } : def.min,
    max: def.mount === 'wall' ? { w: def.max.w, h: def.max.h } : def.max,
  }))
}
