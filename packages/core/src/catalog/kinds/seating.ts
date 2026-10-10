// SPDX-License-Identifier: AGPL-3.0-or-later

import type { FloorItem } from '../../model/types'
import type { FloorDef } from '../catalog'
import { b, blob, box, ell, legs4, line, shade, type Box } from './kit'

type C = CanvasRenderingContext2D

// ---------- Accent chair: rounded, upholstered armchair ----------

function drawAccentChair(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#c9785d'
  const arm = w * 0.14
  box(c, 0, 0, w, d, shade(color, -0.12), px, w * 0.3)
  box(c, arm, d * 0.25, w - 2 * arm, d * 0.7, shade(color, 0.1), px, w * 0.15)
  c.beginPath()
  c.arc(w / 2, d * 0.6, w * 0.5, Math.PI * 1.1, Math.PI * 1.9)
  c.lineWidth = d * 0.16
  c.strokeStyle = color
  c.stroke()
}

function buildAccentChair(it: FloorItem): Box[] {
  const color = it.color ?? '#c9785d'
  const seat = Math.min(44, it.h * 0.5)
  const arm = it.w * 0.14
  return [
    ...legs4(it.w, it.d, 12, 3, 6, '#5b4636'),
    b(0, 2, 12, it.w, it.d - 4, seat - 20, shade(color, -0.12)),
    blob(it.w / 2, it.d * 0.58, seat - 2, it.w - 2 * arm, it.d * 0.75, 14, shade(color, 0.1)),
    b(0, 0, 12, it.w, it.d * 0.22, it.h - 12, color),
    b(0, it.d * 0.15, 12, arm, it.d * 0.8, it.h * 0.62 - 12, color),
    b(it.w - arm, it.d * 0.15, 12, arm, it.d * 0.8, it.h * 0.62 - 12, color),
  ]
}

// ---------- Lounge chair: low and wide, with a reclined back ----------

function drawLoungeChair(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#5c4033'
  const leather = '#2b2522'
  box(c, w * 0.1, d * 0.05, w * 0.8, d * 0.9, color, px, 8)
  box(c, w * 0.15, d * 0.08, w * 0.7, d * 0.35, leather, px, 8)
  box(c, w * 0.15, d * 0.46, w * 0.7, d * 0.45, leather, px, 8)
  box(c, 0, d * 0.3, w * 0.12, d * 0.45, color, px, 4)
  box(c, w * 0.88, d * 0.3, w * 0.12, d * 0.45, color, px, 4)
  line(c, w * 0.2, d * 0.25, w * 0.8, d * 0.25, px, 0.8, shade(leather, 0.25))
}

function buildLoungeChair(it: FloorItem): Box[] {
  const color = it.color ?? '#5c4033'
  const leather = '#2b2522'
  const seat = Math.min(38, it.h * 0.45)
  return [
    b(it.w / 2 - 3, it.d / 2 - 3, 0, 6, 6, seat - 10, '#444'),
    b(it.w * 0.2, it.d * 0.3, 0, it.w * 0.6, it.d * 0.4, 3, '#444'),
    b(it.w * 0.1, it.d * 0.4, seat - 10, it.w * 0.8, it.d * 0.55, 6, color),
    b(it.w * 0.15, it.d * 0.42, seat - 4, it.w * 0.7, it.d * 0.5, 9, leather),
    // reclined back built from three steps leaning back
    b(it.w * 0.1, it.d * 0.22, seat - 4, it.w * 0.8, 10, 22, color),
    b(it.w * 0.1, it.d * 0.12, seat + 14, it.w * 0.8, 10, 20, color),
    b(it.w * 0.1, it.d * 0.03, seat + 30, it.w * 0.8, 10, it.h - seat - 30, color),
    b(it.w * 0.15, it.d * 0.06, seat + 4, it.w * 0.7, 6, it.h - seat - 6, leather),
    b(0, it.d * 0.3, seat - 6, it.w * 0.12, it.d * 0.45, 14, color),
    b(it.w * 0.88, it.d * 0.3, seat - 6, it.w * 0.12, it.d * 0.45, 14, color),
  ]
}

// ---------- Rocking chair: wooden, on curved runners ----------

function drawRockingChair(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#a8784f'
  // runners run past the seat at front and back
  for (const x of [w * 0.12, w * 0.88]) line(c, x, 0, x, d, px, 3, shade(color, -0.25))
  box(c, w * 0.08, d * 0.2, w * 0.84, d * 0.55, color, px, 4)
  box(c, w * 0.18, d * 0.28, w * 0.64, d * 0.4, '#e8dcc8', px, 4)
  box(c, w * 0.08, d * 0.12, w * 0.84, d * 0.09, shade(color, -0.1), px, 2)
  for (let i = 1; i < 5; i++) line(c, w * 0.08 + (w * 0.84 * i) / 5, d * 0.12, w * 0.08 + (w * 0.84 * i) / 5, d * 0.21, px, 1, shade(color, -0.3))
}

function buildRockingChair(it: FloorItem): Box[] {
  const color = it.color ?? '#a8784f'
  const seat = Math.min(45, it.h * 0.45)
  const boxes: Box[] = []
  // runners as flattened ellipse slices sitting on the floor
  for (const x of [it.w * 0.12, it.w * 0.88]) boxes.push(blob(x, it.d / 2, 4, 3, it.d, 8, shade(color, -0.25)))
  for (const [x, y] of [
    [it.w * 0.12, it.d * 0.3],
    [it.w * 0.88, it.d * 0.3],
    [it.w * 0.12, it.d * 0.7],
    [it.w * 0.88, it.d * 0.7],
  ])
    boxes.push(b(x - 1.5, y - 1.5, 4, 3, 3, seat - 4, color))
  boxes.push(b(it.w * 0.08, it.d * 0.2, seat, it.w * 0.84, it.d * 0.55, 3, color))
  boxes.push(b(it.w * 0.18, it.d * 0.28, seat + 3, it.w * 0.64, it.d * 0.4, 4, '#e8dcc8'))
  // slatted back
  for (let i = 0; i <= 5; i++) boxes.push(b(it.w * 0.08 + ((it.w * 0.84 - 3) * i) / 5, it.d * 0.16, seat, 3, 3, it.h - seat, color))
  boxes.push(b(it.w * 0.08, it.d * 0.16, it.h - 6, it.w * 0.84, 3, 6, color))
  for (const x of [it.w * 0.08, it.w * 0.84]) boxes.push(b(x, it.d * 0.16, seat + 20, it.w * 0.08, it.d * 0.6, 3, color))
  return boxes
}

// ---------- Bean bag ----------

function drawBeanBag(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#7a9e9f'
  ell(c, w / 2, d / 2, w / 2, d / 2, color, px)
  ell(c, w * 0.52, d * 0.58, w * 0.28, d * 0.26, shade(color, 0.12), px, shade(color, -0.25), 0.8)
  c.beginPath()
  c.moveTo(w * 0.2, d * 0.25)
  c.quadraticCurveTo(w * 0.5, d * 0.1, w * 0.8, d * 0.25)
  c.lineWidth = px
  c.strokeStyle = shade(color, -0.3)
  c.stroke()
}

function buildBeanBag(it: FloorItem): Box[] {
  const color = it.color ?? '#7a9e9f'
  return [
    blob(it.w / 2, it.d / 2, it.h * 0.32, it.w, it.d, it.h * 0.65, color),
    blob(it.w / 2, it.d * 0.32, it.h * 0.62, it.w * 0.75, it.d * 0.4, it.h * 0.6, shade(color, -0.05)),
    blob(it.w * 0.52, it.d * 0.6, it.h * 0.58, it.w * 0.5, it.d * 0.45, it.h * 0.18, shade(color, 0.12)),
  ]
}

// ---------- Reading chair: wingback armchair ----------

function drawReadingChair(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#556b4e'
  const arm = w * 0.15
  box(c, 0, 0, w, d, shade(color, -0.1), px, 6)
  box(c, 0, 0, w, d * 0.2, color, px, 6)
  // wings flaring forward from the back
  box(c, 0, 0, arm, d * 0.45, shade(color, 0.05), px, 4)
  box(c, w - arm, 0, arm, d * 0.45, shade(color, 0.05), px, 4)
  box(c, arm, d * 0.22, w - 2 * arm, d * 0.72, shade(color, 0.15), px, 6)
  box(c, arm * 1.6, d * 0.24, w - 3.2 * arm, d * 0.15, '#e8c07d', px, 5)
}

function buildReadingChair(it: FloorItem): Box[] {
  const color = it.color ?? '#556b4e'
  const seat = Math.min(45, it.h * 0.43)
  const arm = it.w * 0.15
  return [
    ...legs4(it.w, it.d, 10, 4, 4, '#4a3426'),
    b(0, 0, 10, it.w, it.d, seat - 22, shade(color, -0.1)),
    b(arm, it.d * 0.22, seat - 12, it.w - 2 * arm, it.d * 0.75, 12, shade(color, 0.15)),
    b(0, 0, 10, it.w, it.d * 0.2, it.h - 10, color),
    b(0, 0, seat + 5, arm, it.d * 0.42, it.h - seat - 15, shade(color, 0.05)),
    b(it.w - arm, 0, seat + 5, arm, it.d * 0.42, it.h - seat - 15, shade(color, 0.05)),
    b(0, it.d * 0.2, 10, arm, it.d * 0.75, seat + 10, color),
    b(it.w - arm, it.d * 0.2, 10, arm, it.d * 0.75, seat + 10, color),
    blob(it.w / 2, it.d * 0.27, seat + 18, it.w - 3.2 * arm, 10, 28, '#e8c07d'),
  ]
}

const chair = (label: string, en: string, color: string, defaults: FloorDef['defaults'], draw2D: FloorDef['draw2D'], build3D: FloorDef['build3D']): FloorDef => ({
  mount: 'floor',
  label,
  en,
  category: 'seating',
  color,
  defaults,
  min: { w: 40, d: 40, h: 40 },
  max: { w: 130, d: 140, h: 130 },
  draw2D,
  build3D,
})

export const SEATING_DEFS = {
  accentChair: { ...chair('Ghế điểm nhấn', 'Accent chair armchair', '#c9785d', { w: 75, d: 75, h: 80 }, drawAccentChair, buildAccentChair), min: { w: 50, d: 50, h: 60 } },
  loungeChair: { ...chair('Ghế thư giãn', 'Lounge chair', '#5c4033', { w: 85, d: 90, h: 85 }, drawLoungeChair, buildLoungeChair), min: { w: 60, d: 60, h: 70 } },
  rockingChair: chair('Ghế bập bênh', 'Rocking chair', '#a8784f', { w: 60, d: 90, h: 100 }, drawRockingChair, buildRockingChair),
  beanBag: chair('Ghế lười', 'Bean bag', '#7a9e9f', { w: 90, d: 90, h: 70 }, drawBeanBag, buildBeanBag),
  readingChair: { ...chair('Ghế đọc sách', 'Reading chair wingback', '#556b4e', { w: 80, d: 85, h: 105 }, drawReadingChair, buildReadingChair), min: { w: 55, d: 55, h: 80 } },
} satisfies Record<string, FloorDef>
