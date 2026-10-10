import type { FloorItem, Room, Wall, WallItem } from '../model/types'

export type Vec = { x: number; y: number }
export type Rect = { minX: number; minY: number; maxX: number; maxY: number }

export const WALL_THICKNESS = 12

export const WALLS: Wall[] = ['top', 'right', 'bottom', 'left']

/**
 * Local frame of a wall: walls run clockwise, local x along the wall,
 * local +y points into the room.
 */
export function wallFrame(room: Room, wall: Wall) {
  const { length: L, width: W } = room
  switch (wall) {
    case 'top':
      return { start: { x: 0, y: 0 }, dir: { x: 1, y: 0 }, inward: { x: 0, y: 1 }, rotation: 0, length: L }
    case 'right':
      return { start: { x: L, y: 0 }, dir: { x: 0, y: 1 }, inward: { x: -1, y: 0 }, rotation: 90, length: W }
    case 'bottom':
      return { start: { x: L, y: W }, dir: { x: -1, y: 0 }, inward: { x: 0, y: -1 }, rotation: 180, length: L }
    case 'left':
      return { start: { x: 0, y: W }, dir: { x: 0, y: -1 }, inward: { x: 1, y: 0 }, rotation: 270, length: W }
  }
}

/** Convert a point in a wall item's local frame to room coordinates. */
export function wallLocalToRoom(room: Room, item: Pick<WallItem, 'wall' | 'offset'>, p: Vec): Vec {
  const f = wallFrame(room, item.wall)
  const along = item.offset + p.x
  return {
    x: f.start.x + f.dir.x * along + f.inward.x * p.y,
    y: f.start.y + f.dir.y * along + f.inward.y * p.y,
  }
}

/** Nearest wall to a point and the distance along it. */
export function nearestWall(room: Room, p: Vec): { wall: Wall; along: number } {
  let best: { wall: Wall; along: number; dist: number } | null = null
  for (const wall of WALLS) {
    const f = wallFrame(room, wall)
    const rx = p.x - f.start.x
    const ry = p.y - f.start.y
    const along = clampNum(rx * f.dir.x + ry * f.dir.y, 0, f.length)
    const dist = Math.abs(rx * f.inward.x + ry * f.inward.y)
    if (!best || dist < best.dist) best = { wall, along, dist }
  }
  return { wall: best!.wall, along: best!.along }
}

export function clampNum(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function rotate(p: Vec, deg: number): Vec {
  const r = (deg * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }
}

/** Corners of a floor item's footprint, in room coordinates, clockwise. */
export function floorCorners(item: Pick<FloorItem, 'x' | 'y' | 'w' | 'd' | 'rotation'>): Vec[] {
  const hw = item.w / 2
  const hd = item.d / 2
  return [
    { x: -hw, y: -hd },
    { x: hw, y: -hd },
    { x: hw, y: hd },
    { x: -hw, y: hd },
  ].map((p) => {
    const r = rotate(p, item.rotation)
    return { x: r.x + item.x, y: r.y + item.y }
  })
}

export function boundsOf(points: Vec[]): Rect {
  return {
    minX: Math.min(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxX: Math.max(...points.map((p) => p.x)),
    maxY: Math.max(...points.map((p) => p.y)),
  }
}

/** Polygon of the area a door leaf sweeps when opening into the room. Null if it opens outward. */
export function doorSwingPolygon(room: Room, door: WallItem, segments = 8): Vec[] | null {
  if (door.kind !== 'door' || door.opening === 'out') return null
  const hingeX = door.hinge === 'right' ? door.w : 0
  const sign = door.hinge === 'right' ? -1 : 1
  const local: Vec[] = [{ x: hingeX, y: 0 }]
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * (Math.PI / 2)
    local.push({ x: hingeX + sign * door.w * Math.cos(a), y: door.w * Math.sin(a) })
  }
  return local.map((p) => wallLocalToRoom(room, door, p))
}

/** Keep a wall item on its wall: within the wall length and shorter than it. */
export function clampWallItem(room: Room, item: WallItem): WallItem {
  const len = wallFrame(room, item.wall).length
  const w = Math.min(item.w, len)
  return { ...item, w, offset: clampNum(item.offset, 0, len - w) }
}
