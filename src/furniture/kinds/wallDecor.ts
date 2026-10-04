// Wall decor. Wall items use local x along the wall (0..w), y into the room, and absolute heights in 3D.

import type { WallItem } from '../../model/types'
import type { WallDef } from '../catalog'
import { seededRandom } from '../../lib/random'
import { b, blob, box, dot, line, shade, type Box } from './kit'

type C = CanvasRenderingContext2D
const FRAME = '#2b2522'
const ART = ['#d98f6f', '#e9c46a', '#8ab17d', '#6d8ea0', '#b5838d', '#f4a261', '#264653', '#e5989b']

/** Flat frame seen from above: a thin bar against the wall with the art colour inside. */
function frameBar(c: C, x: number, w: number, depth: number, art: string, px: number, frame = FRAME) {
  box(c, x, 0, w, depth, frame, px, 0.4)
  if (w > 3) box(c, x + 1, depth * 0.3, w - 2, depth * 0.4, art, px, 0.2, frame)
}

/** A framed picture in 3D: four frame bars, a mat and the art. */
function framed3D(x: number, z: number, w: number, h: number, art: Box[], frame = FRAME, f = 2, mat = '#f7f4ec'): Box[] {
  return [
    b(x, 0, z, w, 2.5, f, frame),
    b(x, 0, z + h - f, w, 2.5, f, frame),
    b(x, 0, z + f, f, 2.5, h - 2 * f, frame),
    b(x + w - f, 0, z + f, f, 2.5, h - 2 * f, frame),
    b(x + f, 0, z + f, w - 2 * f, 1, h - 2 * f, mat, { plain: true }),
    ...art,
  ]
}

// ---------- Gallery wall: several frames of different sizes ----------

type Slot = { x: number; z: number; w: number; h: number; art: string }

/** Deterministic layout of frames inside the item's w×h area. */
function gallerySlots(it: WallItem): Slot[] {
  const rand = seededRandom(it.id)
  const cols = Math.max(2, Math.round(it.w / 45))
  const colW = it.w / cols
  const slots: Slot[] = []
  for (let i = 0; i < cols; i++) {
    const two = rand() < 0.6
    const gap = 4
    const rows = two ? 2 : 1
    for (let r = 0; r < rows; r++) {
      const h = (it.h - gap * (rows + 1)) / rows - rand() * 8
      const w = colW - gap * 2 - rand() * 8
      slots.push({ x: i * colW + (colW - w) / 2, z: gap + r * ((it.h - gap) / rows) + rand() * 4, w, h, art: ART[Math.floor(rand() * ART.length)] })
    }
  }
  return slots
}

function drawGalleryWall(c: C, it: WallItem, px: number) {
  const seen = new Set<number>()
  for (const s of gallerySlots(it)) {
    if (seen.has(Math.round(s.x))) continue
    seen.add(Math.round(s.x))
    frameBar(c, s.x, s.w, 3, s.art, px)
  }
}

function buildGalleryWall(it: WallItem): Box[] {
  return gallerySlots(it).flatMap((s) =>
    framed3D(s.x, it.elevation + s.z, s.w, s.h, [
      b(s.x + s.w * 0.2, 1, it.elevation + s.z + s.h * 0.2, s.w * 0.6, 0.4, s.h * 0.6, s.art, { plain: true }),
    ]),
  )
}

// ---------- Framed poster with minimalist typography ----------

function drawFramedPoster(c: C, it: WallItem, px: number) {
  frameBar(c, 0, it.w, 3, it.color ?? '#efe6d8', px)
}

function buildFramedPoster(it: WallItem): Box[] {
  const z = it.elevation
  const bg = it.color ?? '#efe6d8'
  const ink = '#2b2522'
  const art: Box[] = [b(3, 1, z + 3, it.w - 6, 0.4, it.h - 6, bg, { plain: true })]
  // a big title and a few lines of small text
  art.push(b(it.w * 0.15, 1.3, z + it.h * 0.62, it.w * 0.7, 0.3, it.h * 0.12, ink, { plain: true }))
  for (let i = 0; i < 3; i++) art.push(b(it.w * 0.15, 1.3, z + it.h * (0.42 - i * 0.07), it.w * (0.55 - i * 0.1), 0.3, it.h * 0.02, ink, { plain: true }))
  art.push({ x: it.w / 2, y: 1.3, z: z + it.h * 0.2, w: it.w * 0.25, d: 0.3, h: it.w * 0.25, color: '#d98f6f', cylinder: 'y', plain: true })
  return framed3D(0, z, it.w, it.h, art, FRAME, 1.5, bg)
}

// ---------- Canvas art: frameless abstract canvas ----------

function drawCanvasArt(c: C, it: WallItem, px: number) {
  box(c, 0, 0, it.w, 4, it.color ?? '#e9c46a', px, 0.3)
  for (let x = it.w * 0.2; x < it.w; x += it.w * 0.3) line(c, x, 0.5, x, 3.5, px, 1.2, '#264653')
}

function buildCanvasArt(it: WallItem): Box[] {
  const z = it.elevation
  const rand = seededRandom(it.id)
  const boxes: Box[] = [b(0, 0, z, it.w, 4, it.h, '#f4efe6')]
  // abstract colour blocks and a circle
  for (let i = 0; i < 4; i++) {
    const w = it.w * (0.25 + rand() * 0.3)
    const h = it.h * (0.2 + rand() * 0.35)
    boxes.push(b(rand() * (it.w - w), 4, z + rand() * (it.h - h), w, 0.3, h, ART[(i * 3 + Math.floor(rand() * 8)) % ART.length], { plain: true }))
  }
  boxes.push({ x: it.w * 0.65, y: 4.5, z: z + it.h * 0.6, w: it.h * 0.35, d: 0.3, h: it.h * 0.35, color: it.color ?? '#e9c46a', cylinder: 'y', plain: true })
  return boxes
}

// ---------- Mirrors ----------

function drawMirror(c: C, it: WallItem, px: number) {
  box(c, 0, 0, it.w, 3, it.color ?? '#c9a227', px, 1)
  box(c, 2, 1, it.w - 4, 1, '#d8e7ec', px, 0.3, '#9fb4bb')
}

/** Arched mirror: a rectangle topped by a half ellipse, with a thin gold frame. */
function buildWallMirror(it: WallItem): Box[] {
  const z = it.elevation
  const frame = it.color ?? '#c9a227'
  const arch = Math.min(it.w / 2, it.h / 2)
  const body = it.h - arch
  const glass = '#d8e7ec'
  return [
    b(0, 0, z, it.w, 1.5, body, frame),
    { x: it.w / 2, y: 0.75, z: z + body, w: it.w, d: 1.5, h: arch * 2, color: frame, cylinder: 'y' },
    b(1.5, 1.5, z + 1.5, it.w - 3, 0.4, body - 1.5, glass, { plain: true }),
    { x: it.w / 2, y: 1.7, z: z + body, w: it.w - 3, d: 0.4, h: arch * 2 - 3, color: glass, cylinder: 'y', plain: true },
    b(it.w * 0.2, 2, z + it.h * 0.25, it.w * 0.06, 0.2, it.h * 0.45, '#ffffff', { plain: true, opacity: 0.6 }),
  ]
}

function buildFullLengthMirror(it: WallItem): Box[] {
  const z = it.elevation
  const frame = it.color ?? '#2b2522'
  const f = 2.5
  return [
    b(0, 0, z, it.w, 3, f, frame),
    b(0, 0, z + it.h - f, it.w, 3, f, frame),
    b(0, 0, z, f, 3, it.h, frame),
    b(it.w - f, 0, z, f, 3, it.h, frame),
    b(f, 1, z + f, it.w - 2 * f, 0.5, it.h - 2 * f, '#d8e7ec', { plain: true }),
    b(it.w * 0.25, 1.6, z + it.h * 0.2, it.w * 0.07, 0.2, it.h * 0.6, '#ffffff', { plain: true, opacity: 0.6 }),
  ]
}

// ---------- Wood panel wall: vertical slats ----------

function drawWoodPanel(c: C, it: WallItem, px: number) {
  const color = it.color ?? '#a87b55'
  box(c, 0, 0, it.w, 2.5, '#3b2f2a', px, 0)
  for (let x = 0; x < it.w - 1; x += 6) box(c, x, 0, 4, 2.5, color, px, 0, shade(color, -0.3))
}

function buildWoodPanel(it: WallItem): Box[] {
  const color = it.color ?? '#a87b55'
  const boxes: Box[] = [b(0, 0, it.elevation, it.w, 1, it.h, '#3b2f2a', { plain: true })]
  for (let x = 0; x < it.w - 1; x += 6) boxes.push(b(x, 1, it.elevation, Math.min(4, it.w - x), 1.8, it.h, x % 12 ? color : shade(color, 0.04), { plain: true }))
  return boxes
}

// ---------- Floating frame: glass with a pressed leaf ----------

function drawFloatingFrame(c: C, it: WallItem, px: number) {
  box(c, 0, 0, it.w, 2.5, it.color ?? '#c8a46e', px, 0.4)
  box(c, 1.5, 0.8, it.w - 3, 1, '#e6f0f2', px, 0.2)
  dot(c, it.w / 2, 1.3, 1.2, '#4fa35e')
}

function buildFloatingFrame(it: WallItem): Box[] {
  const z = it.elevation
  const frame = it.color ?? '#c8a46e'
  const f = 2
  return [
    b(0, 0, z, it.w, 2.5, f, frame),
    b(0, 0, z + it.h - f, it.w, 2.5, f, frame),
    b(0, 0, z + f, f, 2.5, it.h - 2 * f, frame),
    b(it.w - f, 0, z + f, f, 2.5, it.h - 2 * f, frame),
    b(f, 1, z + f, it.w - 2 * f, 0.4, it.h - 2 * f, '#e6f0f2', { opacity: 0.5 }),
    blob(it.w / 2, 1.5, z + it.h / 2, it.w * 0.35, 0.3, it.h * 0.55, '#4fa35e', { tilt: 20, plain: true }),
    b(it.w / 2 - 0.3, 1.4, z + it.h * 0.2, 0.6, 0.3, it.h * 0.5, '#3f6b3a', { tilt: 20, plain: true }),
  ]
}

// ---------- Wall clock ----------

function drawWallClock(c: C, it: WallItem, px: number) {
  box(c, 0, 0, it.w, 4, it.color ?? '#2b2522', px, 2)
  box(c, it.w * 0.15, 1, it.w * 0.7, 2, '#fbfaf5', px, 1)
}

function buildWallClock(it: WallItem): Box[] {
  const d = Math.min(it.w, it.h)
  const cz = it.elevation + it.h / 2
  const x = it.w / 2
  const boxes: Box[] = [
    { x, y: 2, z: cz, w: d, d: 4, h: d, color: it.color ?? '#2b2522', cylinder: 'y' },
    { x, y: 4.2, z: cz, w: d * 0.88, d: 0.4, h: d * 0.88, color: '#fbfaf5', cylinder: 'y', plain: true },
  ]
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r = d * 0.38
    boxes.push(b(x + Math.sin(a) * r - 0.4, 4.4, cz + Math.cos(a) * r - (i % 3 ? 0.6 : 1.2), 0.8, 0.2, i % 3 ? 1.2 : 2.4, '#2b2522', { plain: true }))
  }
  // hands at ten past ten
  boxes.push({ x: x - d * 0.1, y: 4.6, z: cz + d * 0.06, w: d * 0.25, d: 0.3, h: 1, color: '#2b2522', tilt: -30, plain: true })
  boxes.push({ x: x + d * 0.12, y: 4.7, z: cz + d * 0.1, w: d * 0.34, d: 0.3, h: 0.7, color: '#2b2522', tilt: 55, plain: true })
  return boxes
}

const decor = (label: string, en: string, color: string, defaults: WallDef['defaults'], min: WallDef['min'], max: WallDef['max'], depth: number, draw2D: WallDef['draw2D'], build3D: WallDef['build3D']): WallDef => ({
  mount: 'wall',
  label,
  en,
  category: 'wallDecor',
  color,
  defaults,
  min,
  max,
  depth: () => depth,
  draw2D,
  build3D,
})

export const WALL_DECOR_DEFS = {
  galleryWall: decor('Tường tranh nhiều khung', 'Gallery wall', '#2b2522', { w: 160, d: 0, h: 100, elevation: 115 }, { w: 60, d: 0, h: 40 }, { w: 400, d: 0, h: 200 }, 4, drawGalleryWall, buildGalleryWall),
  framedPoster: decor('Poster đóng khung', 'Framed poster typography', '#efe6d8', { w: 50, d: 0, h: 70, elevation: 130 }, { w: 20, d: 0, h: 25 }, { w: 120, d: 0, h: 160 }, 4, drawFramedPoster, buildFramedPoster),
  canvasArt: decor('Tranh canvas trừu tượng', 'Canvas art abstract', '#e9c46a', { w: 80, d: 0, h: 60, elevation: 130 }, { w: 20, d: 0, h: 20 }, { w: 240, d: 0, h: 180 }, 5, drawCanvasArt, buildCanvasArt),
  wallMirror: decor('Gương treo tường', 'Wall mirror arched', '#c9a227', { w: 60, d: 0, h: 90, elevation: 110 }, { w: 25, d: 0, h: 30 }, { w: 150, d: 0, h: 200 }, 4, drawMirror, buildWallMirror),
  fullLengthMirror: decor('Gương soi toàn thân', 'Full-length mirror', '#2b2522', { w: 50, d: 0, h: 165, elevation: 5 }, { w: 30, d: 0, h: 100 }, { w: 120, d: 0, h: 220 }, 4, drawMirror, buildFullLengthMirror),
  woodPanel: decor('Ốp gỗ tường', 'Wood panel wall slats', '#a87b55', { w: 200, d: 0, h: 240, elevation: 0 }, { w: 30, d: 0, h: 30 }, { w: 1000, d: 0, h: 400 }, 4, drawWoodPanel, buildWoodPanel),
  floatingFrame: decor('Khung kính nổi', 'Floating frame pressed leaf', '#c8a46e', { w: 35, d: 0, h: 45, elevation: 140 }, { w: 15, d: 0, h: 15 }, { w: 100, d: 0, h: 120 }, 4, drawFloatingFrame, buildFloatingFrame),
  wallClock: decor('Đồng hồ treo tường', 'Wall clock', '#2b2522', { w: 35, d: 0, h: 35, elevation: 180 }, { w: 15, d: 0, h: 15 }, { w: 90, d: 0, h: 90 }, 6, drawWallClock, buildWallClock),
} satisfies Record<string, WallDef>
