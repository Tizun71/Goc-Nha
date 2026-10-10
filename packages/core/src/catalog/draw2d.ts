// SPDX-License-Identifier: AGPL-3.0-or-later

// Procedural top-down drawings. Each function draws in the item's local frame:
// floor items fill (0,0)-(w,d) with the back edge at y=0 and the front at y=d;
// wall items run along x in [0,w], the wall occupies y in [-T,0] and +y points into the room.
// `px` is the size of one screen pixel in centimetres, used for crisp line widths.

import type { FloorItem, WallItem } from '../model/types'
import { WALL_THICKNESS } from '../geometry/geometry'
import { seededRandom } from '../geometry/random'

type C = CanvasRenderingContext2D

export const INK = '#3b2f2a'
export const FLOOR_COLOR = '#f4ede1'
export const BOOK_COLORS = ['#c0504d', '#4f81bd', '#9bbb59', '#f2c14e', '#8064a2', '#4bacc6', '#e07b39', '#2e4057']

export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (s: number) => Math.max(0, Math.min(255, ((n >> s) & 255) + Math.round(255 * amount)))
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`
}

/** "#rrggbb" with an alpha, for glows and gradients. */
export function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

export function box(c: C, x: number, y: number, w: number, h: number, fill: string, px: number, r = 0, stroke = INK) {
  c.beginPath()
  c.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2))
  c.fillStyle = fill
  c.fill()
  c.lineWidth = 1.2 * px
  c.strokeStyle = stroke
  c.stroke()
}

export function line(c: C, x1: number, y1: number, x2: number, y2: number, px: number, width = 1, color = INK) {
  c.beginPath()
  c.moveTo(x1, y1)
  c.lineTo(x2, y2)
  c.lineWidth = width * px
  c.strokeStyle = color
  c.stroke()
}

export function dot(c: C, x: number, y: number, r: number, fill: string) {
  c.beginPath()
  c.arc(x, y, r, 0, Math.PI * 2)
  c.fillStyle = fill
  c.fill()
}

// ---------- floor items ----------

export function drawWardrobe(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#c89b6d'
  box(c, 0, 0, w, d, color, px, 1.5)
  // back panel
  line(c, 2, 2, w - 2, 2, px, 2, shade(color, -0.25))
  // hanging rail with hangers
  c.setLineDash([3 * px, 3 * px])
  line(c, 4, d * 0.45, w - 4, d * 0.45, px, 1.2, shade(color, -0.35))
  c.setLineDash([])
  for (let x = 8; x < w - 6; x += 7) line(c, x, d * 0.45 - 9, x + 1.5, d * 0.45 + 9, px, 1, shade(color, -0.2))
  // doors: one per ~50 cm, drawn at the front edge
  const doors = Math.max(1, Math.round(w / 50))
  const dw = w / doors
  box(c, 0, d - 4, w, 4, shade(color, -0.08), px)
  for (let i = 1; i < doors; i++) line(c, i * dw, d - 6, i * dw, d, px, 1.4)
  for (let i = 0; i < doors; i++) {
    const hx = i % 2 === 0 ? (i + 1) * dw - 5 : i * dw + 5
    box(c, hx - 1, d - 1, 2, 3.5, '#8a8a8a', px, 0.6)
  }
}

export function drawDesk(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#e3c79f'
  // legs peek out under the top as darker corners
  const leg = Math.min(5, w / 6, d / 6)
  box(c, 0, 0, w, d, color, px, 3)
  for (const [x, y] of [
    [3, 3],
    [w - 3 - leg, 3],
    [3, d - 3 - leg],
    [w - 3 - leg, d - 3 - leg],
  ])
    box(c, x, y, leg, leg, shade(color, -0.2), px, 1)
  // a laptop and a mug make it read as a desk
  if (w >= 60 && d >= 40) {
    const lw = Math.min(34, w * 0.4)
    const lx = (w - lw) / 2
    box(c, lx, d * 0.25, lw, lw * 0.65, '#cfd4da', px, 1.5)
    box(c, lx + 2, d * 0.25 + 2, lw - 4, lw * 0.65 - 6, '#9aa4ae', px, 1)
    dot(c, w - 12, d * 0.3, 4, '#ffffff')
    c.beginPath()
    c.arc(w - 12, d * 0.3, 4, 0, Math.PI * 2)
    c.lineWidth = 1.2 * px
    c.strokeStyle = INK
    c.stroke()
  }
}

export function drawBookshelf(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#a9744f'
  const rand = seededRandom(it.id)
  box(c, 0, 0, w, d, color, px, 1)
  const t = 2 // board thickness
  const bays = Math.max(1, Math.round(w / 40))
  const bw = (w - t) / bays
  for (let b = 0; b < bays; b++) {
    const x0 = t + b * bw
    box(c, x0, t, bw - t, d - 2 * t, shade(color, 0.18), px, 0, shade(color, -0.2))
    // book tops lined up against the back
    let x = x0 + 0.5
    while (x < x0 + bw - t - 2) {
      const bwid = 1.6 + rand() * 2.8
      if (x + bwid > x0 + bw - t - 0.5) break
      const depth = (d - 2 * t) * (0.6 + rand() * 0.3)
      c.fillStyle = BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)]
      c.fillRect(x, t, bwid, depth)
      x += bwid + 0.3
      if (rand() < 0.08) x += 4 // gap
    }
  }
}

export function drawBed(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#7a5a43'
  box(c, 0, 0, w, d, color, px, 3)
  const head = Math.min(8, d * 0.06)
  box(c, 0, 0, w, head, shade(color, -0.15), px, 2)
  const m = 3
  box(c, m, head + 1, w - 2 * m, d - head - 1 - m, '#fbfaf7', px, 4)
  // pillows
  const pillows = w >= 120 ? 2 : 1
  const gap = 5
  const pw = (w - 2 * m - gap * (pillows + 1)) / pillows
  const ph = Math.min(22, d * 0.12)
  for (let i = 0; i < pillows; i++) box(c, m + gap + i * (pw + gap), head + 5, pw, ph, '#ffffff', px, 6)
  // blanket with a folded edge
  const by = head + 5 + ph + 8
  const blanket = it.color ? shade(it.color, 0.35) : '#6b8fb8'
  box(c, m, by, w - 2 * m, d - by - m, blanket, px, 4)
  box(c, m, by, w - 2 * m, Math.min(14, (d - by) * 0.15), shade(blanket, 0.15), px, 4)
}

export function drawChair(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#5a7d9a'
  const back = Math.max(4, d * 0.18)
  box(c, w * 0.04, back * 0.6, w * 0.92, d - back * 0.6, shade(color, 0.15), px, Math.min(w, d) * 0.15)
  box(c, 0, 0, w, back, color, px, back / 2)
  // legs at the front corners
  dot(c, w * 0.12, d - 3, 1.5, INK)
  dot(c, w * 0.88, d - 3, 1.5, INK)
}

export function drawFishboneShelf(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#b07d4f'
  const rand = seededRandom(it.id)
  // from above: a central spine with slanted ribs on both sides, drawn as chevrons
  const spine = Math.min(6, w * 0.08)
  const sx = (w - spine) / 2
  box(c, 0, 0, sx, d, shade(color, 0.12), px, 1.5)
  box(c, sx + spine, 0, sx, d, shade(color, 0.12), px, 1.5)
  const ribs = Math.max(2, Math.round(sx / 12))
  for (let i = 1; i < ribs; i++) {
    const off = (sx * i) / ribs
    line(c, sx - off, 1, sx - off + sx / ribs / 2, d - 1, px, 1, shade(color, -0.25))
    line(c, sx + spine + off, 1, sx + spine + off - sx / ribs / 2, d - 1, px, 1, shade(color, -0.25))
  }
  // a few books leaning on the ribs
  for (const side of [0, 1]) {
    let x = side === 0 ? 3 : sx + spine + 3
    const end = side === 0 ? sx - 3 : w - 3
    while (x < end - 3) {
      const bw = 1.6 + rand() * 2.4
      if (rand() < 0.55) {
        c.fillStyle = BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)]
        c.fillRect(x, d * 0.2, bw, d * 0.6)
      }
      x += bw + 1.5
    }
  }
  box(c, sx, 0, spine, d, shade(color, -0.15), px, 1)
}

export function drawSafe(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#5f6b73'
  // heavy steel body seen from above, with a bevelled top
  box(c, 0, 0, w, d, shade(color, -0.12), px, 2)
  const bevel = Math.min(4, w * 0.08, d * 0.08)
  box(c, bevel, bevel, w - 2 * bevel, d - 2 * bevel - 4, color, px, 1.5, shade(color, -0.3))
  // thick door at the front, hinges on the left
  const door = Math.min(6, d * 0.14)
  box(c, 0, d - door, w, door, shade(color, 0.1), px, 1)
  box(c, -1, d - door + door * 0.2, 2, door * 0.6, '#3a3f44', px, 0.5)
  // combination dial and handle on the door edge
  const r = Math.min(w, d) * 0.16
  const cx = w * 0.42
  const cy = (d - door) / 2
  dot(c, cx, cy, r, '#d4d8db')
  c.beginPath()
  c.arc(cx, cy, r, 0, Math.PI * 2)
  c.lineWidth = 1.2 * px
  c.strokeStyle = INK
  c.stroke()
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    line(c, cx + Math.cos(a) * r * 0.65, cy + Math.sin(a) * r * 0.65, cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9, px, 1)
  }
  dot(c, cx, cy, r * 0.3, '#8a9096')
  line(c, w * 0.72, cy - r * 0.8, w * 0.72, cy + r * 0.8, px, 3, '#c9a227')
}

export function drawFan(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#e8eef2'
  const r = Math.min(w, d) / 2
  const cx = w / 2
  const cy = d / 2
  // round base
  dot(c, cx, cy, r, '#cfd6db')
  c.beginPath()
  c.arc(cx, cy, r, 0, Math.PI * 2)
  c.lineWidth = 1.2 * px
  c.strokeStyle = INK
  c.stroke()
  // head seen from above: guard on the front, motor behind it
  const hw = Math.min(w * 0.9, r * 1.8)
  box(c, cx - hw * 0.15, cy - r * 0.55, hw * 0.3, r * 0.5, '#c9d1d6', px, 3)
  box(c, cx - hw / 2, cy, hw, Math.max(4, r * 0.28), color, px, 3)
  for (let i = 1; i < 8; i++) line(c, cx - hw / 2 + (hw * i) / 8, cy, cx - hw / 2 + (hw * i) / 8, cy + Math.max(4, r * 0.28), px, 0.8, '#9aa5ad')
  // airflow to the front
  c.setLineDash([3 * px, 3 * px])
  for (const k of [-1, 0, 1]) line(c, cx + k * hw * 0.25, cy + r * 0.45, cx + k * hw * 0.45, cy + r * 1.4, px, 1, '#38bdf8')
  c.setLineDash([])
}

/** A soft, crumpled piece of clothing: a wobbly blob with a couple of creases. */
export function cloth(c: C, cx: number, cy: number, rx: number, ry: number, color: string, rand: () => number, px: number) {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2
    const k = 0.75 + rand() * 0.35
    return { x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k }
  })
  c.beginPath()
  const mid = (i: number) => ({ x: (pts[i % 9].x + pts[(i + 1) % 9].x) / 2, y: (pts[i % 9].y + pts[(i + 1) % 9].y) / 2 })
  c.moveTo(mid(0).x, mid(0).y)
  for (let i = 1; i <= 9; i++) c.quadraticCurveTo(pts[i % 9].x, pts[i % 9].y, mid(i).x, mid(i).y)
  c.closePath()
  c.fillStyle = color
  c.fill()
  c.lineWidth = px
  c.strokeStyle = shade(color, -0.35)
  c.stroke()
  for (let i = 0; i < 2; i++) {
    const a = rand() * Math.PI * 2
    const x = cx + Math.cos(a) * rx * 0.45
    const y = cy + Math.sin(a) * ry * 0.45
    const t = a + Math.PI / 2
    c.beginPath()
    c.moveTo(x - Math.cos(t) * rx * 0.25, y - Math.sin(t) * ry * 0.25)
    c.quadraticCurveTo(x - Math.cos(a) * rx * 0.12, y - Math.sin(a) * ry * 0.12, x + Math.cos(t) * rx * 0.25, y + Math.sin(t) * ry * 0.25)
    c.lineWidth = px
    c.strokeStyle = shade(color, -0.2)
    c.stroke()
  }
}

export function drawLaundryBasket(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#3f9fe0'
  const rand = seededRandom(it.id)
  const s = Math.min(w, d)
  const r = s * 0.3
  const rim = s * 0.09
  const wall = s * 0.1 // the walls taper inwards, so from above they show as a band
  const hole = '#1f3b57'
  // rim
  box(c, 0, 0, w, d, shade(color, 0.15), px, r, shade(color, -0.45))
  // inner walls with rows of slots on their straight parts
  const x0 = rim
  const y0 = rim
  const iw = w - 2 * rim
  const id = d - 2 * rim
  box(c, x0, y0, iw, id, color, px, Math.max(0, r - rim), shade(color, -0.35))
  c.fillStyle = hole
  const slot = (x: number, y: number, sw: number, sh: number) => {
    c.beginPath()
    c.roundRect(x, y, sw, sh, Math.min(sw, sh) / 2)
    c.fill()
  }
  const corner = Math.max(r - rim, wall)
  for (let x = x0 + corner; x < x0 + iw - corner - 1.5; x += 3.5) {
    slot(x, y0 + wall * 0.2, 1.6, wall * 0.6)
    slot(x, y0 + id - wall * 0.8, 1.6, wall * 0.6)
  }
  for (let y = y0 + corner; y < y0 + id - corner - 1.5; y += 3.5) {
    slot(x0 + wall * 0.2, y, wall * 0.6, 1.6)
    slot(x0 + iw - wall * 0.8, y, wall * 0.6, 1.6)
  }
  // bottom with a grid of round holes
  const bx = x0 + wall
  const by = y0 + wall
  const bw = iw - 2 * wall
  const bd = id - 2 * wall
  box(c, bx, by, bw, bd, shade(color, -0.12), px, Math.max(0, r - rim - wall), shade(color, -0.35))
  for (let x = bx + 3; x < bx + bw - 2; x += 4)
    for (let y = by + 3; y < by + bd - 2; y += 4) dot(c, x, y, 0.8, hole)
  // hand slots in the rim on the short sides
  const longX = w >= d
  for (const side of [0, 1]) {
    if (longX) box(c, side === 0 ? rim * 0.25 : w - rim * 0.75, d / 2 - d * 0.14, rim * 0.5, d * 0.28, hole, px, rim * 0.25)
    else box(c, w / 2 - w * 0.14, side === 0 ? rim * 0.25 : d - rim * 0.75, w * 0.28, rim * 0.5, hole, px, rim * 0.25)
  }
  // a few clothes inside, leaving some of the bottom visible
  const clothes = ['#e57373', '#f5f5f5', '#81c784', '#ffd54f', '#ba68c8', '#ff8a65']
  const start = Math.floor(rand() * clothes.length)
  ;[
    [-0.12, -0.06, 0.2, 0.2],
    [0.12, 0.02, 0.18, 0.2],
    [-0.02, 0.12, 0.18, 0.15],
  ].forEach(([ox, oy, rx, ry], i) => cloth(c, w / 2 + ox * w, d / 2 + oy * d, rx * w, ry * d, clothes[(start + i) % clothes.length], rand, px))
}

export function drawNightstand(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#a0714f'
  box(c, 0, 0, w, d, color, px, 2)
  box(c, 2, 2, w - 4, d - 8, shade(color, 0.08), px, 1.5, shade(color, -0.2))
  // drawer front with a knob
  box(c, 1, d - 5, w - 2, 5, shade(color, -0.1), px, 1)
  dot(c, w / 2, d - 1.5, Math.min(1.6, w * 0.05), '#d4b483')
}

export function drawRug(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#b5533c'
  const cream = '#f3e3c3'
  // fringe on the short ends
  for (let x = 2; x < w - 1; x += 3) {
    line(c, x, -3, x, 0, px, 1, cream)
    line(c, x, d, x, d + 3, px, 1, cream)
  }
  box(c, 0, 0, w, d, color, px, 1, shade(color, -0.3))
  const m = Math.min(w, d) * 0.07
  c.strokeStyle = cream
  c.lineWidth = m * 0.35
  c.strokeRect(m, m, w - 2 * m, d - 2 * m)
  c.lineWidth = Math.max(px, m * 0.08)
  c.strokeRect(m * 1.8, m * 1.8, w - 3.6 * m, d - 3.6 * m)
  // centre medallion and corner diamonds
  const diamond = (x: number, y: number, r: number, fill: string) => {
    c.beginPath()
    c.moveTo(x, y - r)
    c.lineTo(x + r * 0.7, y)
    c.lineTo(x, y + r)
    c.lineTo(x - r * 0.7, y)
    c.closePath()
    c.fillStyle = fill
    c.fill()
    c.lineWidth = Math.max(px, m * 0.1)
    c.strokeStyle = cream
    c.stroke()
  }
  const r = Math.min(w, d) * 0.2
  diamond(w / 2, d / 2, r, shade(color, 0.12))
  diamond(w / 2, d / 2, r * 0.45, cream)
  for (const [x, y] of [
    [m * 2.6, m * 2.6],
    [w - m * 2.6, m * 2.6],
    [m * 2.6, d - m * 2.6],
    [w - m * 2.6, d - m * 2.6],
  ])
    diamond(x, y, m * 0.6, shade(color, -0.15))
}

/** Warm pool of light drawn on the plan. */
export function lightPool(c: C, x: number, y: number, r: number, strength: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, `rgba(255,200,90,${strength})`)
  g.addColorStop(1, 'rgba(255,200,90,0)')
  c.fillStyle = g
  c.beginPath()
  c.arc(x, y, r, 0, Math.PI * 2)
  c.fill()
}

export function drawCeilingLight(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#ffd27a'
  const cx = w / 2
  const cy = d / 2
  lightPool(c, cx, cy, Math.max(w, d) * 1.8, 0.3)
  c.beginPath()
  c.ellipse(cx, cy, w / 2, d / 2, 0, 0, Math.PI * 2)
  c.fillStyle = 'rgba(255,248,230,0.9)'
  c.fill()
  // dashed outline: the usual plan symbol for things on the ceiling
  c.setLineDash([4 * px, 3 * px])
  c.lineWidth = 1.2 * px
  c.strokeStyle = INK
  c.stroke()
  c.setLineDash([])
  c.beginPath()
  c.ellipse(cx, cy, w * 0.32, d * 0.32, 0, 0, Math.PI * 2)
  c.fillStyle = color
  c.fill()
}

export function drawTableLamp(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const r = Math.min(w, d) / 2
  const cx = w / 2
  const cy = d / 2
  lightPool(c, cx, cy, r * 2.4, 0.4)
  dot(c, cx, cy, r * 0.55, '#57534e')
  c.beginPath()
  c.arc(cx, cy, r, 0, Math.PI * 2)
  c.fillStyle = it.color ?? '#f6e7c8'
  c.fill()
  c.lineWidth = 1.2 * px
  c.strokeStyle = INK
  c.stroke()
  c.beginPath()
  c.arc(cx, cy, r * 0.62, 0, Math.PI * 2)
  c.lineWidth = px
  c.strokeStyle = shade(it.color ?? '#f6e7c8', -0.25)
  c.stroke()
  dot(c, cx, cy, r * 0.22, '#ffd36b')
}

export function drawPlant(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const r = Math.min(w, d) / 2
  const cx = w / 2
  const cy = d / 2
  const rand = seededRandom(it.id)
  // pot rim and soil
  dot(c, cx, cy, r * 0.62, '#c46b43')
  dot(c, cx, cy, r * 0.5, '#5b4636')
  // leaves fanning out from the centre
  const leaves = 9
  const greens = ['#3f8f4f', '#4fa35e', '#2f7a43', '#5cb46b']
  for (let i = 0; i < leaves; i++) {
    const a = (i / leaves) * Math.PI * 2 + rand() * 0.4
    const len = r * (0.85 + rand() * 0.3)
    c.save()
    c.translate(cx, cy)
    c.rotate(a)
    c.beginPath()
    c.ellipse(len / 2, 0, len / 2, len * 0.18, 0, 0, Math.PI * 2)
    c.fillStyle = greens[i % greens.length]
    c.fill()
    c.lineWidth = 0.8 * px
    c.strokeStyle = '#1f5130'
    c.stroke()
    line(c, 2, 0, len * 0.9, 0, px, 0.6, '#9fd5a8')
    c.restore()
  }
  dot(c, cx, cy, r * 0.12, '#2f7a43')
}

// ---------- wall items ----------

const T = WALL_THICKNESS

export function drawDoor(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#9c6b43'
  // opening in the wall
  c.fillStyle = FLOOR_COLOR
  c.fillRect(0, -T - 0.5, w, T + 1)
  line(c, 0, -T, 0, 0, px, 2)
  line(c, w, -T, w, 0, px, 2)
  const right = it.hinge === 'right'
  const out = it.opening === 'out'
  const hx = right ? w : 0
  const sy = out ? -T : 0
  const dir = out ? -1 : 1
  // door leaf in the open position
  const leaf = 3.5
  box(c, right ? hx - leaf : hx, out ? sy - w : sy, leaf, w, color, px)
  // swing arc
  // swing arc from the closed position (along the wall) to the open one
  const a0 = right ? Math.PI : 0
  const a1 = (Math.PI / 2) * dir
  c.beginPath()
  c.setLineDash([4 * px, 3 * px])
  c.arc(hx, sy, w, a0, right && out ? (3 * Math.PI) / 2 : a1, right !== out)
  c.lineWidth = px
  c.strokeStyle = INK
  c.stroke()
  c.setLineDash([])
}

export function drawWindow(c: C, it: WallItem, px: number) {
  const { w } = it
  c.fillStyle = '#ffffff'
  c.fillRect(0, -T - 0.5, w, T + 1)
  box(c, 0, -T, w, T, '#cfe8f5', px)
  line(c, 0, -T * 0.66, w, -T * 0.66, px, 1)
  line(c, 0, -T * 0.33, w, -T * 0.33, px, 1)
  // sill
  box(c, -3, 0, w + 6, 3, '#ffffff', px)
}

export function drawCurtain(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#d9826a'
  line(c, -4, 3, w + 4, 3, px, 2, '#7d7d7d')
  // pleated fabric: straight top edge, wavy bottom edge
  const period = 10
  c.beginPath()
  c.moveTo(0, 4)
  c.lineTo(0, 8)
  for (let x = 0, k = 0; x < w; x += period, k++) {
    const end = Math.min(x + period, w)
    c.quadraticCurveTo((x + end) / 2, k % 2 === 0 ? 12 : 5, end, 8)
  }
  c.lineTo(w, 4)
  c.closePath()
  c.fillStyle = color
  c.globalAlpha = 0.85
  c.fill()
  c.globalAlpha = 1
  c.lineWidth = 1.2 * px
  c.strokeStyle = shade(color, -0.3)
  c.stroke()
}

export function drawAirConditioner(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#f7f8fa'
  const d = 22
  box(c, 0, 0, w, d, color, px, 4)
  // outlet louvre and display
  box(c, 3, d - 6, w - 6, 4, '#b8c2ca', px, 2)
  dot(c, w - 10, 6, 1.5, '#38bdf8')
  // cold air blowing into the room
  c.setLineDash([4 * px, 4 * px])
  for (let i = 1; i <= 3; i++) {
    const x = (w * i) / 4
    line(c, x, d + 3, x + (x - w / 2) * 0.4, d + 55, px, 1, '#38bdf8')
  }
  c.setLineDash([])
}

export function drawWallLamp(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#f3e3c3'
  const reach = 18
  // warm light pool on the plan
  const glow = c.createRadialGradient(w / 2, reach * 0.6, 1, w / 2, reach * 0.6, reach * 2.6)
  glow.addColorStop(0, 'rgba(255,214,120,0.55)')
  glow.addColorStop(1, 'rgba(255,214,120,0)')
  c.fillStyle = glow
  c.beginPath()
  c.arc(w / 2, reach * 0.6, reach * 2.6, 0, Math.PI)
  c.fill()
  // wall plate, arm and shade
  box(c, w / 2 - 4, 0, 8, 2.5, '#6b6b6b', px, 1)
  line(c, w / 2, 2.5, w / 2, reach * 0.45, px, 2, '#6b6b6b')
  c.beginPath()
  c.moveTo(w * 0.15, reach)
  c.lineTo(w * 0.85, reach)
  c.lineTo(w * 0.68, reach * 0.4)
  c.lineTo(w * 0.32, reach * 0.4)
  c.closePath()
  c.fillStyle = color
  c.fill()
  c.lineWidth = 1.2 * px
  c.strokeStyle = INK
  c.stroke()
  dot(c, w / 2, reach * 0.72, Math.min(2.5, w * 0.1), '#ffd36b')
}

export function drawLedStrip(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#fde68a'
  // glow spreading into the room from the strip
  const glow = c.createLinearGradient(0, 0, 0, 30)
  glow.addColorStop(0, alpha(color, 0.6))
  glow.addColorStop(1, alpha(color, 0))
  c.fillStyle = glow
  c.fillRect(0, 0, w, 30)
  box(c, 0, 0, w, 2, color, px, 1, shade(color, -0.35))
  for (let x = 2.5; x < w; x += 5) dot(c, x, 1, 0.6, '#ffffff')
}

export function drawFluorescentLamp(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#e0f2fe'
  // cool white light spreading into the room
  const glow = c.createLinearGradient(0, 0, 0, 45)
  glow.addColorStop(0, alpha(color, 0.75))
  glow.addColorStop(1, alpha(color, 0))
  c.fillStyle = glow
  c.fillRect(-6, 0, w + 12, 45)
  // fixture with the tube held between two end caps
  box(c, 0, 0, w, 7, '#f4f4f5', px, 1.5)
  box(c, 4, 2.5, w - 8, 3, color, px, 1.5, '#94a3b8')
  box(c, 2, 1.5, 3, 5, '#9ca3af', px, 0.5)
  box(c, w - 5, 1.5, 3, 5, '#9ca3af', px, 0.5)
}

/** Number of sockets on an outlet plate: about one per 6 cm. */
function outletSockets(w: number) {
  return Math.max(1, Math.round(w / 6))
}

export function drawPowerOutlet(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#f5f5f4'
  // plate sticking out slightly from the wall, sockets drawn as hole pairs
  box(c, 0, 0, w, 3, color, px, 0.8)
  const n = outletSockets(w)
  const step = w / n
  for (let i = 0; i < n; i++) {
    const x = step * (i + 0.5)
    dot(c, x - 0.9, 1.5, 0.45, '#44403c')
    dot(c, x + 0.9, 1.5, 0.45, '#44403c')
  }
  // small lightning badge so outlets stay visible on the plan
  const bx = w / 2
  const r = 3.2
  dot(c, bx, 3 + r + 0.5, r, '#facc15')
  c.beginPath()
  c.moveTo(bx + 0.6, 3 + 1.4)
  c.lineTo(bx - 1.2, 3 + r + 0.9)
  c.lineTo(bx + 0.1, 3 + r + 0.9)
  c.lineTo(bx - 0.6, 3 + 2 * r - 0.4)
  c.lineTo(bx + 1.2, 3 + r - 0.1)
  c.lineTo(bx - 0.1, 3 + r - 0.1)
  c.closePath()
  c.fillStyle = INK
  c.fill()
  c.lineWidth = 0.6 * px
  c.strokeStyle = INK
  c.stroke()
}

export function drawWallPainting(c: C, it: WallItem, px: number) {
  const { w } = it
  box(c, 0, 0, w, 3, '#3b2f2a', px, 0.5)
  box(c, 1.5, 0.8, w - 3, 1.4, it.color ?? '#5b8fb9', px, 0.3, '#3b2f2a')
}

export function drawWallFan(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#e5e7eb'
  // bracket and arm from the wall to the fan head
  box(c, w / 2 - 4, 0, 8, 2.5, '#9ca3af', px, 1)
  line(c, w / 2, 2.5, w / 2, 10, px, 2.5, '#9ca3af')
  box(c, w / 2 - 6, 10, 12, 8, '#d1d5db', px, 3)
  // fan guard seen edge-on from above
  box(c, 0, 18, w, 6, color, px, 3)
  for (let i = 1; i < 10; i++) line(c, (w * i) / 10, 18, (w * i) / 10, 24, px, 0.8, '#9aa5ad')
  // airflow into the room
  c.setLineDash([3 * px, 3 * px])
  for (const k of [-1, 0, 1]) line(c, w / 2 + k * w * 0.25, 27, w / 2 + k * w * 0.5, 80, px, 1, '#38bdf8')
  c.setLineDash([])
}

export function drawWallHook(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#a9744f'
  box(c, 0, 0, w, 3, color, px, 1)
  const hooks = Math.max(1, Math.floor(w / 10))
  const step = w / hooks
  for (let i = 0; i < hooks; i++) {
    const x = step * (i + 0.5)
    line(c, x, 3, x, 6, px, 1.5, '#555')
    dot(c, x, 6.5, 1.4, '#555')
  }
}
