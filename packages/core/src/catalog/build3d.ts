// 3D shapes for the iso preview, built from the same sizes as the 2D drawings.
// Local frame: x along w, y along d (0 = back, d = front / into the room), z up.
// Boxes are given by their centre; `tilt` rotates a box around the local y axis (degrees).
// A cylinder or ellipsoid fits inside its box. A cylinder's axis runs along z (upright) or y (facing front);
// `taper` makes an upright cylinder narrower at the bottom (bottom radius = top radius × taper).

import type { FloorItem, WallItem } from '../model/types'
import { seededRandom } from '../geometry/random'

export type Box = {
  x: number
  y: number
  z: number
  w: number
  d: number
  h: number
  color: string
  tilt?: number
  opacity?: number
  cylinder?: 'z' | 'y'
  taper?: number
  ellipsoid?: boolean
  /** Rotation around the vertical axis (degrees, clockwise on the plan). */
  turn?: number
  /** Skip outlines, for many tiny parts such as holes. */
  plain?: boolean
  /** Also show a highlight where furniture hides this part (small but important things like outlets). */
  xray?: boolean
  /** Light-emitting parts glow in their own colour. */
  glow?: boolean
}

export const b = (x0: number, y0: number, z0: number, w: number, d: number, h: number, color: string, extra?: Partial<Box>): Box => ({
  x: x0 + w / 2,
  y: y0 + d / 2,
  z: z0 + h / 2,
  w,
  d,
  h,
  color,
  ...extra,
})

export function buildWardrobe(it: FloorItem): Box[] {
  const c = it.color ?? '#c89b6d'
  const doors = Math.max(1, Math.round(it.w / 50))
  const dw = it.w / doors
  const boxes = [b(0, 0, 0, it.w, it.d - 1, it.h, c)]
  for (let i = 0; i < doors; i++) boxes.push(b(i * dw + 0.5, it.d - 1.5, 4, dw - 1, 1.5, it.h - 8, '#d6ad80'))
  return boxes
}

export function buildDesk(it: FloorItem): Box[] {
  const c = it.color ?? '#e3c79f'
  const top = 3
  const leg = Math.min(5, it.w / 6, it.d / 6)
  const lh = it.h - top
  return [
    b(0, 0, lh, it.w, it.d, top, c),
    b(2, 2, 0, leg, leg, lh, '#8b6b4a'),
    b(it.w - 2 - leg, 2, 0, leg, leg, lh, '#8b6b4a'),
    b(2, it.d - 2 - leg, 0, leg, leg, lh, '#8b6b4a'),
    b(it.w - 2 - leg, it.d - 2 - leg, 0, leg, leg, lh, '#8b6b4a'),
  ]
}

export function buildBookshelf(it: FloorItem): Box[] {
  const c = it.color ?? '#a9744f'
  const rand = seededRandom(it.id)
  const t = 2
  const boxes = [
    b(0, 0, 0, it.w, 1, it.h, c), // back
    b(0, 0, 0, t, it.d, it.h, c),
    b(it.w - t, 0, 0, t, it.d, it.h, c),
  ]
  const shelves = Math.max(2, Math.round(it.h / 35))
  const gap = it.h / shelves
  for (let i = 0; i <= shelves; i++) boxes.push(b(t, 0, Math.min(i * gap, it.h - t), it.w - 2 * t, it.d, t, c))
  const colors = ['#c0504d', '#4f81bd', '#9bbb59', '#f2c14e', '#8064a2', '#4bacc6']
  for (let i = 0; i < shelves; i++) {
    let x = t + 1
    while (x < it.w - t - 4) {
      const bw = 2 + rand() * 3
      const bh = gap * (0.55 + rand() * 0.3)
      boxes.push(b(x, 2, i * gap + t, bw, it.d * 0.7, bh, colors[Math.floor(rand() * colors.length)]))
      x += bw + 0.4 + (rand() < 0.1 ? 6 : 0)
    }
  }
  return boxes
}

export function buildBed(it: FloorItem): Box[] {
  const c = it.color ?? '#7a5a43'
  const frame = Math.min(25, it.h * 0.55)
  const pillows = it.w >= 120 ? 2 : 1
  const pw = (it.w - 6 - 5 * (pillows + 1)) / pillows
  const boxes = [
    b(0, 0, 0, it.w, it.d, frame, c),
    b(0, 0, 0, it.w, 8, it.h + 45, c), // headboard
    b(3, 9, frame, it.w - 6, it.d - 12, it.h - frame, '#fbfaf7'),
    b(3, it.d * 0.3, it.h, it.w - 6, it.d * 0.7 - 3, 3, it.color ? '#c7b299' : '#6b8fb8'),
  ]
  for (let i = 0; i < pillows; i++) boxes.push(b(3 + 5 + i * (pw + 5), 13, it.h, pw, 20, 8, '#ffffff'))
  return boxes
}

export function buildChair(it: FloorItem): Box[] {
  const c = it.color ?? '#5a7d9a'
  const seat = Math.min(46, it.h * 0.5)
  const leg = 3
  return [
    b(0, 0, seat - 5, it.w, it.d, 5, c),
    b(0, 0, seat, it.w, 5, it.h - seat, c),
    b(1, 1, 0, leg, leg, seat - 5, '#444'),
    b(it.w - 1 - leg, 1, 0, leg, leg, seat - 5, '#444'),
    b(1, it.d - 1 - leg, 0, leg, leg, seat - 5, '#444'),
    b(it.w - 1 - leg, it.d - 1 - leg, 0, leg, leg, seat - 5, '#444'),
  ]
}

export function buildFishboneShelf(it: FloorItem): Box[] {
  const c = it.color ?? '#b07d4f'
  const rand = seededRandom(it.id)
  const colors = ['#c0504d', '#4f81bd', '#9bbb59', '#f2c14e', '#8064a2', '#4bacc6']
  const spine = Math.min(6, it.w * 0.08)
  const cx = it.w / 2
  const span = (it.w - spine) / 2 // horizontal reach of one rib
  const angle = 22
  const rad = (angle * Math.PI) / 180
  const rib = span / Math.cos(rad)
  const rise = span * Math.tan(rad)
  const t = 2
  const boxes: Box[] = [
    b(cx - spine / 2, 0, 0, spine, it.d, it.h, shade3(c)),
    b(0, 0, 0, it.w, it.d, t, c), // base
  ]
  const levels = Math.max(2, Math.floor((it.h - rise - 10) / 32))
  const gap = (it.h - rise - t) / levels
  for (let i = 0; i < levels; i++) {
    const z = t + i * gap + gap * 0.25 + rise / 2
    // ribs rise towards the outside, forming a V around the spine like a fish bone
    for (const side of [-1, 1]) {
      const x = cx + side * (spine / 2 + span / 2)
      boxes.push({ x, y: it.d / 2, z, w: rib, d: it.d, h: t, color: c, tilt: side * angle })
      // books standing on the slanted rib, leaning with it
      let along = 4
      while (along < rib - 5) {
        const bw = 2 + rand() * 2.5
        const bh = gap * (0.45 + rand() * 0.25)
        if (rand() < 0.7) {
          const k = (along - rib / 2) * side
          const bx = x + k * Math.cos(rad)
          const bz = z + k * Math.sin(rad) + t / 2 + (bh / 2) * Math.cos(rad)
          boxes.push({ x: bx - side * (bh / 2) * Math.sin(rad), y: it.d / 2, z: bz, w: bw, d: it.d * 0.75, h: bh, color: colors[Math.floor(rand() * colors.length)], tilt: side * angle })
        }
        along += bw + 0.5
      }
    }
  }
  return boxes
}

export function shade3(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (s: number) => Math.round(((n >> s) & 255) * 0.8)
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`
}

export function buildSafe(it: FloorItem): Box[] {
  const c = it.color ?? '#5f6b73'
  const door = Math.min(6, it.d * 0.14)
  const inset = Math.min(3, it.w * 0.06)
  const dial = Math.min(it.w, it.h) * 0.22
  const midZ = it.h * 0.6
  return [
    b(0, 0, 0, it.w, it.d - door, it.h, c),
    b(inset, it.d - door, inset, it.w - 2 * inset, door, it.h - 2 * inset, '#6f7b83'),
    // hinges
    b(inset - 1.5, it.d - door, it.h * 0.2, 1.5, door, it.h * 0.12, '#3a3f44'),
    b(inset - 1.5, it.d - door, it.h * 0.68, 1.5, door, it.h * 0.12, '#3a3f44'),
    // combination dial, brass handle and a small keypad
    b(it.w * 0.42 - dial / 2, it.d, midZ - dial / 2, dial, 2, dial, '#d4d8db'),
    b(it.w * 0.42 - dial / 6, it.d + 2, midZ - dial / 6, dial / 3, 1.5, dial / 3, '#8a9096'),
    b(it.w * 0.72 - 1, it.d, midZ - dial * 0.6, 2.5, 4, dial * 1.2, '#c9a227'),
    b(it.w * 0.42 - dial / 2, it.d, midZ - dial * 1.4, dial, 1, dial * 0.5, '#2b3035'),
  ]
}

export function buildFan(it: FloorItem): Box[] {
  const c = it.color ?? '#e8eef2'
  const head = Math.min(it.w, it.h * 0.45)
  const headZ = it.h - head / 2
  const cy = it.d / 2
  const boxes: Box[] = [
    { x: it.w / 2, y: cy, z: 2, w: it.w * 0.75, d: it.d * 0.75, h: 4, color: '#9aa5ad', cylinder: 'z' },
    { x: it.w / 2, y: cy, z: (headZ - head * 0.1) / 2, w: 3, d: 3, h: headZ - head * 0.1, color: '#c9d1d6', cylinder: 'z' },
    // motor behind the blades, then the blades and a see-through guard
    { x: it.w / 2, y: cy - 6, z: headZ, w: head * 0.3, d: 10, h: head * 0.3, color: '#c9d1d6', cylinder: 'y' },
    { x: it.w / 2, y: cy, z: headZ, w: head, d: 6, h: head, color: c, cylinder: 'y', opacity: 0.35 },
    { x: it.w / 2, y: cy + 1, z: headZ, w: head * 0.18, d: 3, h: head * 0.18, color: '#5a7d9a', cylinder: 'y' },
  ]
  for (const tilt of [0, 60, 120]) boxes.push({ x: it.w / 2, y: cy, z: headZ, w: head * 0.85, d: 1, h: head * 0.16, color: '#7fb3d5', tilt })
  return boxes
}

export function buildLaundryBasket(it: FloorItem): Box[] {
  const c = it.color ?? '#3f9fe0'
  const hole = '#1f3b57'
  const rim = 4
  const taper = 0.86 // narrower at the bottom
  const body = it.h - rim
  const cx = it.w / 2
  const cy = it.d / 2
  const boxes: Box[] = [
    { x: cx, y: cy, z: body / 2, w: it.w, d: it.d, h: body, color: c, cylinder: 'z', taper },
    { x: cx, y: cy, z: it.h - rim / 2, w: it.w + 3, d: it.d + 3, h: rim, color: lighten(c), cylinder: 'z' },
    { x: cx, y: cy, z: it.h - rim - 1, w: it.w * 0.9, d: it.d * 0.9, h: 1, color: '#16304a', cylinder: 'z' },
  ]
  // rows of slots around the wall, following the elliptical, tapered shape
  const rows = Math.max(3, Math.floor((body - 10) / 7))
  const perimeter = (Math.PI * (it.w + it.d)) / 2
  const perRow = Math.max(12, Math.round(perimeter / 6))
  for (let row = 0; row < rows; row++) {
    const z = 6 + row * ((body - 12) / Math.max(1, rows - 1))
    const k = taper + (1 - taper) * (z / body)
    const rx = (it.w / 2) * k
    const ry = (it.d / 2) * k
    for (let i = 0; i < perRow; i++) {
      const a = ((i + (row % 2) * 0.5) / perRow) * Math.PI * 2
      const turn = (Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) * 180) / Math.PI
      boxes.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry, z, w: 2.6, d: 1, h: 4.2, color: hole, turn, plain: true })
    }
  }
  // hand slots in the rim on the long axis ends
  const longX = it.w >= it.d
  for (const side of [-1, 1]) {
    boxes.push(
      longX
        ? { x: cx + side * (it.w / 2 + 1.2), y: cy, z: it.h - rim / 2, w: 1, d: it.d * 0.3, h: rim * 0.6, color: hole, plain: true }
        : { x: cx, y: cy + side * (it.d / 2 + 1.2), z: it.h - rim / 2, w: it.w * 0.3, d: 1, h: rim * 0.6, color: hole, plain: true },
    )
  }
  // clothes just showing above the rim
  const s = Math.min(it.w, it.d)
  boxes.push({ x: cx - it.w * 0.12, y: cy - it.d * 0.05, z: it.h - 1, w: s * 0.5, d: s * 0.45, h: s * 0.22, color: '#e57373', ellipsoid: true })
  boxes.push({ x: cx + it.w * 0.14, y: cy - it.d * 0.1, z: it.h - 1.5, w: s * 0.4, d: s * 0.4, h: s * 0.2, color: '#f5f5f5', ellipsoid: true })
  boxes.push({ x: cx + it.w * 0.02, y: cy + it.d * 0.16, z: it.h - 2, w: s * 0.45, d: s * 0.35, h: s * 0.18, color: '#ffd54f', ellipsoid: true })
  return boxes
}

export function lighten(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (s: number) => Math.min(255, Math.round(((n >> s) & 255) * 0.8 + 255 * 0.2))
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`
}

export function buildNightstand(it: FloorItem): Box[] {
  const c = it.color ?? '#a0714f'
  const leg = Math.min(8, it.h * 0.15)
  const body = it.h - leg
  const drawer = (body - 6) / 2
  return [
    b(2, 2, 0, 3, 3, leg, '#5b4636'),
    b(it.w - 5, 2, 0, 3, 3, leg, '#5b4636'),
    b(2, it.d - 5, 0, 3, 3, leg, '#5b4636'),
    b(it.w - 5, it.d - 5, 0, 3, 3, leg, '#5b4636'),
    b(0, 0, leg, it.w, it.d - 1, body, c),
    b(2, it.d - 1, leg + 2, it.w - 4, 1.2, drawer, '#b8865f'),
    b(2, it.d - 1, leg + 4 + drawer, it.w - 4, 1.2, drawer, '#b8865f'),
    b(it.w / 2 - 2, it.d, leg + 2 + drawer / 2 - 1, 4, 1.5, 2, '#d4b483'),
    b(it.w / 2 - 2, it.d, leg + 4 + drawer * 1.5 - 1, 4, 1.5, 2, '#d4b483'),
  ]
}

export function buildRug(it: FloorItem): Box[] {
  const c = it.color ?? '#b5533c'
  const cream = '#f3e3c3'
  const m = Math.min(it.w, it.d) * 0.07
  const t = m * 0.35
  const top = it.h
  return [
    b(0, 0, 0, it.w, it.d, it.h, c),
    b(m, m, top, it.w - 2 * m, t, 0.2, cream, { plain: true }),
    b(m, it.d - m - t, top, it.w - 2 * m, t, 0.2, cream, { plain: true }),
    b(m, m, top, t, it.d - 2 * m, 0.2, cream, { plain: true }),
    b(it.w - m - t, m, top, t, it.d - 2 * m, 0.2, cream, { plain: true }),
    { x: it.w / 2, y: it.d / 2, z: top + 0.1, w: Math.min(it.w, it.d) * 0.28, d: Math.min(it.w, it.d) * 0.4, h: 0.2, color: cream, cylinder: 'z', plain: true },
  ]
}

/** Built from z=0; the iso view lifts it so its top touches the ceiling. */
export function buildCeilingLight(it: FloorItem): Box[] {
  return [
    { x: it.w / 2, y: it.d / 2, z: it.h * 0.85, w: it.w, d: it.d, h: it.h * 0.3, color: '#f5f5f4', cylinder: 'z' },
    { x: it.w / 2, y: it.d / 2, z: it.h * 0.35, w: it.w * 0.92, d: it.d * 0.92, h: it.h * 0.7, color: it.color ?? '#ffd27a', cylinder: 'z', glow: true },
  ]
}

export function buildTableLamp(it: FloorItem): Box[] {
  const shadeH = it.h * 0.4
  const top = Math.min(it.w, it.d) * 0.6
  return [
    { x: it.w / 2, y: it.d / 2, z: it.h * 0.03, w: it.w * 0.55, d: it.d * 0.55, h: it.h * 0.06, color: '#57534e', cylinder: 'z' },
    { x: it.w / 2, y: it.d / 2, z: it.h * 0.3, w: 1.5, d: 1.5, h: it.h * 0.55, color: '#a8a29e', cylinder: 'z' },
    { x: it.w / 2, y: it.d / 2, z: it.h * 0.52, w: top * 0.4, d: top * 0.4, h: top * 0.4, color: '#ffd36b', ellipsoid: true, glow: true },
    { x: it.w / 2, y: it.d / 2, z: it.h - shadeH / 2, w: top, d: top, h: shadeH, color: it.color ?? '#f6e7c8', cylinder: 'z', taper: 1.6, opacity: 0.95 },
  ]
}

export function buildPlant(it: FloorItem): Box[] {
  const rand = seededRandom(it.id)
  const pot = it.h * 0.3
  const s = Math.min(it.w, it.d)
  const boxes: Box[] = [
    { x: it.w / 2, y: it.d / 2, z: pot / 2, w: s * 0.62, d: s * 0.62, h: pot, color: '#c46b43', cylinder: 'z', taper: 0.75 },
    { x: it.w / 2, y: it.d / 2, z: pot, w: s * 0.66, d: s * 0.66, h: 2, color: '#a85a37', cylinder: 'z' },
    { x: it.w / 2, y: it.d / 2, z: pot + 1.2, w: s * 0.55, d: s * 0.55, h: 0.5, color: '#5b4636', cylinder: 'z' },
  ]
  // a bushy crown from the rim of the pot up to the full height: a stem, rounded clusters, and long leaves arching out
  const greens = ['#3f8f4f', '#4fa35e', '#2f7a43', '#5cb46b']
  const crown = it.h - pot
  const size = Math.min(s * 0.5, crown * 0.55)
  boxes.push({ x: it.w / 2, y: it.d / 2, z: pot + crown * 0.4, w: 2, d: 2, h: crown * 0.8, color: '#5b7f3a', cylinder: 'z' })
  const clusters = Math.max(4, Math.round(crown / (size * 0.5)))
  for (let i = 0; i < clusters; i++) {
    const t = clusters === 1 ? 0.5 : i / (clusters - 1)
    const a = i * 2.4 + rand() * 0.5
    const r = s * 0.2 * (1 - t * 0.4) * (0.6 + rand() * 0.6)
    const k = size * (1 - t * 0.35) * (0.85 + rand() * 0.3)
    boxes.push({
      x: it.w / 2 + Math.cos(a) * r,
      y: it.d / 2 + Math.sin(a) * r,
      z: pot + k * 0.4 + t * (crown - k * 0.9),
      w: k,
      d: k,
      h: k * 0.9,
      color: greens[i % greens.length],
      ellipsoid: true,
    })
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 * 2 + rand() * 0.3
    const len = s * (0.45 + rand() * 0.2)
    const r = len * 0.42
    boxes.push({
      x: it.w / 2 + Math.cos(a) * r,
      y: it.d / 2 + Math.sin(a) * r,
      z: pot + 3 + crown * 0.8 * (i / 16),
      w: len,
      d: len * 0.22,
      h: 1.2,
      color: greens[(i + 1) % greens.length],
      ellipsoid: true,
      turn: (a * 180) / Math.PI,
      tilt: 20 + rand() * 25,
    })
  }
  return boxes
}

// Wall items: y is depth into the room from the wall surface.

/** Border around an opening: sides and top, plus a bottom piece for windows. */
function frame(w: number, z0: number, h: number, t: number, bottom: boolean): Box[] {
  const c = '#f2f2f2'
  const boxes = [b(-t, -1, z0, t, 4, h, c), b(w, -1, z0, t, 4, h, c), b(-t, -1, z0 + h, w + 2 * t, 4, t, c)]
  if (bottom) boxes.push(b(-t, -1, z0 - t, w + 2 * t, 4, t, c))
  return boxes
}

export function buildDoor(it: WallItem): Box[] {
  const c = it.color ?? '#9c6b43'
  return [
    ...frame(it.w, 0, it.h, 4, false),
    b(0, 0, 0, it.w, 3, it.h, c),
    b(it.hinge === 'right' ? 6 : it.w - 10, 3, it.h * 0.45, 4, 3, 2, '#cccccc'),
  ]
}

export function buildWindow(it: WallItem): Box[] {
  return [
    ...frame(it.w, it.elevation, it.h, 3, true),
    b(0, 0, it.elevation, it.w, 2.5, it.h, '#a7d3ec', { opacity: 0.85 }),
    b(it.w / 2 - 1, 0, it.elevation, 2, 3, it.h, '#ffffff'),
    b(-4, 0, it.elevation - 3, it.w + 8, 6, 2, '#ffffff'),
  ]
}

export function buildCurtain(it: WallItem): Box[] {
  const c = it.color ?? '#d9826a'
  const panels = Math.max(2, Math.round(it.w / 12))
  const pw = it.w / panels
  const boxes = [b(-6, 2, it.elevation + it.h, it.w + 12, 2, 2, '#7d7d7d')]
  for (let i = 0; i < panels; i++) boxes.push(b(i * pw, 4 + (i % 2) * 3, it.elevation, pw, 3, it.h, c))
  return boxes
}

export function buildAirConditioner(it: WallItem): Box[] {
  const c = it.color ?? '#f7f8fa'
  const d = 22
  return [
    b(0, 0, it.elevation, it.w, d, it.h, c),
    // air outlet along the bottom front, and a small display
    b(3, d - 8, it.elevation - 0.5, it.w - 6, 8, 3, '#b8c2ca'),
    b(it.w - 14, d, it.elevation + it.h * 0.55, 8, 0.6, 3, '#38bdf8'),
  ]
}

export function buildWallLamp(it: WallItem): Box[] {
  const c = it.color ?? '#f3e3c3'
  const reach = 18
  const z = it.elevation
  const bulb = Math.min(6, it.w * 0.3)
  return [
    b(it.w / 2 - 4, 0, z + it.h * 0.3, 8, 2, it.h * 0.4, '#6b6b6b'),
    b(it.w / 2 - 1, 0, z + it.h * 0.45, 2, reach * 0.7, 2, '#6b6b6b'),
    { x: it.w / 2, y: reach * 0.7, z: z + it.h * 0.55, w: it.w * 0.7, d: it.w * 0.7, h: it.h * 0.55, color: c, cylinder: 'z', opacity: 0.9 },
    { x: it.w / 2, y: reach * 0.7, z: z + it.h * 0.3, w: bulb, d: bulb, h: bulb, color: '#ffd36b', glow: true },
  ]
}

export function buildLedStrip(it: WallItem): Box[] {
  return [b(0, 0, it.elevation, it.w, 1.5, it.h, it.color ?? '#fde68a', { glow: true })]
}

export function buildFluorescentLamp(it: WallItem): Box[] {
  const tube = Math.min(3, it.h * 0.6)
  return [
    b(0, 0, it.elevation, it.w, 4, it.h, '#f4f4f5'),
    b(1, 4, it.elevation + it.h / 2 - 2.5, 3, 3, 5, '#9ca3af'),
    b(it.w - 4, 4, it.elevation + it.h / 2 - 2.5, 3, 3, 5, '#9ca3af'),
    b(4, 4, it.elevation + (it.h - tube) / 2, it.w - 8, tube, tube, it.color ?? '#e0f2fe', { glow: true }),
  ]
}

export function buildPowerOutlet(it: WallItem): Box[] {
  const n = Math.max(1, Math.round(it.w / 6))
  const step = it.w / n
  const z = it.elevation
  const boxes: Box[] = [
    // darker back frame so the white plate stands out against the wall
    b(-0.8, 0, z - 0.8, it.w + 1.6, 0.6, it.h + 1.6, '#a8a29e', { xray: true }),
    b(0, 0.6, z, it.w, 1.2, it.h, it.color ?? '#f5f5f4'),
  ]
  for (let i = 0; i < n; i++) {
    const x = step * (i + 0.5)
    const s = Math.min(step * 0.75, it.h * 0.75)
    boxes.push(b(x - s / 2, 1.8, z + (it.h - s) / 2, s, 0.3, s, '#d6d3d1', { plain: true }))
    boxes.push(b(x - 1.3, 2.1, z + it.h / 2 - 0.6, 0.8, 0.2, 1.2, '#292524', { plain: true }))
    boxes.push(b(x + 0.5, 2.1, z + it.h / 2 - 0.6, 0.8, 0.2, 1.2, '#292524', { plain: true }))
  }
  return boxes
}

export function buildWallPainting(it: WallItem): Box[] {
  const z = it.elevation
  const f = Math.min(4, it.w * 0.08, it.h * 0.08)
  const frame = '#3b2f2a'
  const iw = it.w - 2 * f
  const ih = it.h - 2 * f
  return [
    b(0, 0, z, it.w, 3, f, frame),
    b(0, 0, z + it.h - f, it.w, 3, f, frame),
    b(0, 0, z + f, f, 3, ih, frame),
    b(it.w - f, 0, z + f, f, 3, ih, frame),
    // a simple landscape: sky, hills and a sun
    b(f, 0, z + f, iw, 1.5, ih, it.color ?? '#9ec5e8', { plain: true }),
    { x: it.w * 0.35, y: 1.6, z: z + f + ih * 0.15, w: iw * 0.8, d: 0.4, h: ih * 0.6, color: '#6aa36f', ellipsoid: true, plain: true },
    { x: it.w * 0.7, y: 1.8, z: z + f + ih * 0.1, w: iw * 0.7, d: 0.4, h: ih * 0.45, color: '#4f8a55', ellipsoid: true, plain: true },
    b(f, 1.7, z + f, iw, 0.4, ih * 0.18, '#7cb07f', { plain: true }),
    { x: it.w * 0.72, y: 2, z: z + f + ih * 0.72, w: ih * 0.18, d: 0.4, h: ih * 0.18, color: '#f2c14e', cylinder: 'y', plain: true },
  ]
}

export function buildWallFan(it: WallItem): Box[] {
  const c = it.color ?? '#e5e7eb'
  const head = Math.min(it.w, it.h)
  const cz = it.elevation + it.h / 2
  const boxes: Box[] = [
    b(it.w / 2 - 5, 0, cz + head * 0.1, 10, 2, 12, '#9ca3af'),
    b(it.w / 2 - 1.5, 2, cz + head * 0.2, 3, 10, 3, '#9ca3af'),
    { x: it.w / 2, y: 15, z: cz, w: head * 0.3, d: 9, h: head * 0.3, color: '#d1d5db', cylinder: 'y' },
    { x: it.w / 2, y: 22, z: cz, w: head, d: 5, h: head, color: c, cylinder: 'y', opacity: 0.35 },
    { x: it.w / 2, y: 23, z: cz, w: head * 0.18, d: 3, h: head * 0.18, color: '#6b7280', cylinder: 'y' },
  ]
  for (const tilt of [0, 60, 120]) boxes.push({ x: it.w / 2, y: 22, z: cz, w: head * 0.85, d: 1, h: head * 0.16, color: '#93c5fd', tilt })
  return boxes
}

export function buildWallHook(it: WallItem): Box[] {
  const c = it.color ?? '#a9744f'
  const hooks = Math.max(1, Math.floor(it.w / 10))
  const step = it.w / hooks
  const boxes = [b(0, 0, it.elevation, it.w, 2.5, it.h, c)]
  for (let i = 0; i < hooks; i++) boxes.push(b(step * (i + 0.5) - 0.75, 2.5, it.elevation + 1, 1.5, 6, 1.5, '#555'))
  return boxes
}
