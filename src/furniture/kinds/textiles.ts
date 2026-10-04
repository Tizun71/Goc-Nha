import type { FloorItem } from '../../model/types'
import type { FloorDef } from '../catalog'
import { seededRandom } from '../../lib/random'
import { b, blob, box, cyl, dot, ell, line, shade, type Box } from './kit'

type C = CanvasRenderingContext2D

// ---------- Throw blanket: striped, with fringes and a folded corner ----------

function drawThrowBlanket(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#c98b6b'
  for (let x = 2; x < w - 1; x += 3) {
    line(c, x, -3, x, 0, px, 0.8, shade(color, 0.2))
    line(c, x, d, x, d + 3, px, 0.8, shade(color, 0.2))
  }
  box(c, 0, 0, w, d, color, px, 2)
  for (let y = d * 0.12; y < d; y += d * 0.22) {
    c.fillStyle = shade(color, 0.25)
    c.fillRect(1, y, w - 2, d * 0.04)
  }
  // folded corner
  c.beginPath()
  c.moveTo(w, d - 25)
  c.lineTo(w - 25, d)
  c.lineTo(w, d)
  c.closePath()
  c.fillStyle = shade(color, -0.15)
  c.fill()
}

function buildThrowBlanket(it: FloorItem): Box[] {
  const color = it.color ?? '#c98b6b'
  const boxes: Box[] = [b(0, 0, 0, it.w, it.d, it.h, color)]
  for (let y = it.d * 0.12; y < it.d; y += it.d * 0.22) boxes.push(b(0, y, it.h, it.w, it.d * 0.04, 0.2, shade(color, 0.25), { plain: true }))
  return boxes
}

// ---------- Knitted blanket: chunky cable knit ----------

function drawKnittedBlanket(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#e8dcc8'
  box(c, 0, 0, w, d, color, px, 4)
  // rows of chunky loops
  const step = 7
  for (let y = step / 2; y < d; y += step)
    for (let x = step / 2 + ((y / step) % 2) * (step / 2); x < w; x += step) ell(c, x, y, step * 0.42, step * 0.3, shade(color, -0.05), px, shade(color, -0.2), 0.6)
}

function buildKnittedBlanket(it: FloorItem): Box[] {
  const color = it.color ?? '#e8dcc8'
  const boxes: Box[] = [b(0, 0, 0, it.w, it.d, it.h * 0.6, color)]
  const step = 14
  for (let y = step / 2; y < it.d; y += step)
    for (let x = step / 2; x < it.w; x += step) boxes.push(blob(x, y, it.h * 0.6, step * 0.9, step * 0.7, it.h * 0.8, shade(color, -0.04), { plain: true }))
  return boxes
}

// ---------- Duvet: quilted, with the top folded back ----------

function drawDuvet(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#a7b8c9'
  box(c, 0, 0, w, d, color, px, 6)
  c.setLineDash([2 * px, 2 * px])
  for (let x = 20; x < w - 5; x += 20) line(c, x, 18, x, d - 3, px, 0.8, shade(color, -0.2))
  for (let y = 38; y < d - 5; y += 20) line(c, 3, y, w - 3, y, px, 0.8, shade(color, -0.2))
  c.setLineDash([])
  box(c, 0, 0, w, 16, '#f7f4ec', px, 6)
}

function buildDuvet(it: FloorItem): Box[] {
  const color = it.color ?? '#a7b8c9'
  return [b(0, 16, 0, it.w, it.d - 16, it.h, color), b(0, 0, 0, it.w, 16, it.h * 1.3, '#f7f4ec')]
}

// ---------- Pillow cushion ----------

function drawPillowCushion(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#d9a441'
  box(c, 0, 0, w, d, color, px, Math.min(w, d) * 0.3)
  box(c, w * 0.12, d * 0.12, w * 0.76, d * 0.76, shade(color, 0.1), px, Math.min(w, d) * 0.25, shade(color, -0.2))
  dot(c, w / 2, d / 2, Math.min(w, d) * 0.06, shade(color, -0.3))
}

function buildPillowCushion(it: FloorItem): Box[] {
  return [blob(it.w / 2, it.d / 2, it.h / 2, it.w, it.d, it.h, it.color ?? '#d9a441')]
}

// ---------- Floor cushion: a round tufted pouf to sit on ----------

function drawFloorCushion(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#b56576'
  ell(c, w / 2, d / 2, w / 2, d / 2, color, px)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    line(c, w / 2, d / 2, w / 2 + (Math.cos(a) * w) / 2.2, d / 2 + (Math.sin(a) * d) / 2.2, px, 0.8, shade(color, -0.2))
  }
  dot(c, w / 2, d / 2, Math.min(w, d) * 0.06, shade(color, -0.35))
}

function buildFloorCushion(it: FloorItem): Box[] {
  const color = it.color ?? '#b56576'
  return [cyl(it.w / 2, it.d / 2, 0, it.w, it.d, it.h * 0.7, color), blob(it.w / 2, it.d / 2, it.h * 0.7, it.w * 0.95, it.d * 0.95, it.h * 0.6, shade(color, 0.05))]
}

// ---------- Rugs ----------

function fringe(c: C, w: number, d: number, px: number, color: string) {
  for (let x = 2; x < w - 1; x += 3) {
    line(c, x, -3, x, 0, px, 1, color)
    line(c, x, d, x, d + 3, px, 1, color)
  }
}

function drawShagRug(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#d6c4a8'
  const rand = seededRandom(it.id)
  box(c, 0, 0, w, d, color, px, 6)
  // long fluffy pile as short random strokes
  const count = Math.min(1500, Math.round((w * d) / 25))
  for (let i = 0; i < count; i++) {
    const x = 2 + rand() * (w - 4)
    const y = 2 + rand() * (d - 4)
    const a = rand() * Math.PI * 2
    line(c, x, y, x + Math.cos(a) * 2.5, y + Math.sin(a) * 2.5, px, 0.8, rand() < 0.5 ? shade(color, -0.08) : shade(color, 0.06))
  }
}

function buildShagRug(it: FloorItem): Box[] {
  const color = it.color ?? '#d6c4a8'
  return [b(0, 0, 0, it.w, it.d, it.h * 0.5, shade(color, -0.05)), b(1, 1, it.h * 0.5, it.w - 2, it.d - 2, it.h * 0.5, color, { plain: true })]
}

function drawJuteRug(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#c8a46e'
  ell(c, w / 2, d / 2, w / 2, d / 2, color, px, shade(color, -0.35))
  // braided rings
  for (let k = 0.92; k > 0.05; k -= 0.08) ell(c, w / 2, d / 2, (w / 2) * k, (d / 2) * k, 'transparent', px, shade(color, -0.18), 0.9)
}

function buildJuteRug(it: FloorItem): Box[] {
  const color = it.color ?? '#c8a46e'
  const boxes: Box[] = [cyl(it.w / 2, it.d / 2, 0, it.w, it.d, it.h, color)]
  // braided rings: each smaller disc sits a little higher so they nest instead of overlapping
  for (let i = 0, k = 0.85; k > 0.1; i++, k -= 0.15)
    boxes.push(cyl(it.w / 2, it.d / 2, it.h + i * 0.15, it.w * k, it.d * k, 0.15, i % 2 ? shade(color, 0.08) : shade(color, -0.12), { plain: true }))
  return boxes
}

function drawPersianRug(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const field = it.color ?? '#8c2f39'
  const navy = '#22304a'
  const gold = '#d9b26f'
  fringe(c, w, d, px, '#efe3c8')
  box(c, 0, 0, w, d, navy, px, 1)
  const m = Math.min(w, d) * 0.08
  box(c, m, m, w - 2 * m, d - 2 * m, field, px, 0, gold)
  // repeating motifs in the border
  for (let x = m; x < w - m; x += m)
    for (const y of [m / 2, d - m / 2]) {
      c.beginPath()
      c.arc(x, y, m * 0.25, 0, Math.PI * 2)
      c.fillStyle = gold
      c.fill()
    }
  for (let y = m * 1.5; y < d - m; y += m)
    for (const x of [m / 2, w - m / 2]) {
      c.beginPath()
      c.arc(x, y, m * 0.25, 0, Math.PI * 2)
      c.fillStyle = gold
      c.fill()
    }
  // central medallion with corner pieces
  const mx = w / 2
  const my = d / 2
  const r = Math.min(w, d) * 0.22
  ell(c, mx, my, r * 1.1, r * 1.4, navy, px, gold)
  ell(c, mx, my, r * 0.6, r * 0.8, gold, px, null)
  ell(c, mx, my, r * 0.25, r * 0.35, field, px, null)
  for (const [x, y] of [
    [m, m],
    [w - m, m],
    [m, d - m],
    [w - m, d - m],
  ])
    ell(c, x, y, r * 0.6, r * 0.6, navy, px, gold)
}

function buildPersianRug(it: FloorItem): Box[] {
  const field = it.color ?? '#8c2f39'
  const m = Math.min(it.w, it.d) * 0.08
  const r = Math.min(it.w, it.d) * 0.22
  return [
    b(0, 0, 0, it.w, it.d, it.h, '#22304a'),
    b(m, m, it.h, it.w - 2 * m, it.d - 2 * m, 0.2, field, { plain: true }),
    cyl(it.w / 2, it.d / 2, it.h + 0.2, r * 2.2, r * 2.8, 0.2, '#22304a', { plain: true }),
    cyl(it.w / 2, it.d / 2, it.h + 0.4, r * 1.2, r * 1.6, 0.2, '#d9b26f', { plain: true }),
  ]
}

function drawLayeredRug(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const base = '#c8a46e'
  box(c, 0, 0, w, d, base, px, 1, shade(base, -0.35))
  for (let y = 3; y < d; y += 3) line(c, 1, y, w - 1, y, px, 0.5, shade(base, -0.12))
  // a smaller patterned rug laid on top at a slight angle
  c.save()
  c.translate(w * 0.55, d * 0.52)
  c.rotate(-0.12)
  const tw = w * 0.62
  const td = d * 0.62
  const top = it.color ?? '#3d5a80'
  box(c, -tw / 2, -td / 2, tw, td, top, px, 1)
  c.strokeStyle = '#efe3c8'
  c.lineWidth = Math.min(tw, td) * 0.04
  c.strokeRect(-tw / 2 + td * 0.08, -td / 2 + td * 0.08, tw - td * 0.16, td * 0.84)
  for (let i = -2; i <= 2; i++) {
    c.beginPath()
    c.moveTo(i * tw * 0.15, -td * 0.25)
    c.lineTo(i * tw * 0.15 + tw * 0.06, 0)
    c.lineTo(i * tw * 0.15, td * 0.25)
    c.lineWidth = Math.min(tw, td) * 0.03
    c.stroke()
  }
  c.restore()
}

function buildLayeredRug(it: FloorItem): Box[] {
  const top = it.color ?? '#3d5a80'
  return [
    b(0, 0, 0, it.w, it.d, it.h * 0.5, '#c8a46e'),
    { x: it.w * 0.55, y: it.d * 0.52, z: it.h * 0.75, w: it.w * 0.62, d: it.d * 0.62, h: it.h * 0.5, color: top, turn: -7 },
  ]
}

const textile = (label: string, en: string, color: string, defaults: FloorDef['defaults'], min: FloorDef['min'], max: FloorDef['max'], draw2D: FloorDef['draw2D'], build3D: FloorDef['build3D']): FloorDef => ({
  mount: 'floor',
  layer: 'decor',
  label,
  en,
  category: 'textile',
  color,
  defaults,
  min,
  max,
  draw2D,
  build3D,
})

const rug = (label: string, en: string, color: string, defaults: FloorDef['defaults'], draw2D: FloorDef['draw2D'], build3D: FloorDef['build3D']): FloorDef => ({
  mount: 'floor',
  layer: 'rug',
  label,
  en,
  category: 'rug',
  color,
  defaults,
  min: { w: 40, d: 40, h: 1 },
  max: { w: 500, d: 500, h: 6 },
  draw2D,
  build3D,
})

export const TEXTILE_DEFS = {
  throwBlanket: textile('Chăn phủ sofa/giường', 'Throw blanket', '#c98b6b', { w: 130, d: 160, h: 2 }, { w: 40, d: 40, h: 1 }, { w: 240, d: 260, h: 6 }, drawThrowBlanket, buildThrowBlanket),
  knittedBlanket: textile('Chăn len dệt', 'Knitted blanket chunky knit', '#e8dcc8', { w: 120, d: 150, h: 4 }, { w: 40, d: 40, h: 2 }, { w: 240, d: 260, h: 8 }, drawKnittedBlanket, buildKnittedBlanket),
  duvet: textile('Chăn ga (duvet)', 'Duvet comforter', '#a7b8c9', { w: 160, d: 190, h: 8 }, { w: 80, d: 100, h: 3 }, { w: 240, d: 240, h: 20 }, drawDuvet, buildDuvet),
  pillowCushion: textile('Gối trang trí', 'Pillow cushion', '#d9a441', { w: 45, d: 45, h: 14 }, { w: 25, d: 25, h: 6 }, { w: 80, d: 80, h: 25 }, drawPillowCushion, buildPillowCushion),
  floorCushion: { ...textile('Đệm ngồi sàn', 'Floor cushion pouf', '#b56576', { w: 60, d: 60, h: 15 }, { w: 30, d: 30, h: 6 }, { w: 120, d: 120, h: 45 }, drawFloorCushion, buildFloorCushion), layer: 'solid' },
} satisfies Record<string, FloorDef>

export const RUG_DEFS = {
  shagRug: rug('Thảm lông dài', 'Shag rug', '#d6c4a8', { w: 200, d: 140, h: 4 }, drawShagRug, buildShagRug),
  juteRug: rug('Thảm cói', 'Jute rug', '#c8a46e', { w: 180, d: 120, h: 1.5 }, drawJuteRug, buildJuteRug),
  persianRug: rug('Thảm Ba Tư', 'Persian rug', '#8c2f39', { w: 200, d: 290, h: 1 }, drawPersianRug, buildPersianRug),
  layeredRug: rug('Thảm phối nhiều lớp', 'Layered rug', '#3d5a80', { w: 220, d: 160, h: 2 }, drawLayeredRug, buildLayeredRug),
} satisfies Record<string, FloorDef>
