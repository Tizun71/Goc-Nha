// SPDX-License-Identifier: AGPL-3.0-or-later

// Small drawing helpers shared by the furniture kinds in this folder.
// 2D helpers draw in plan centimetres (px = one screen pixel); 3D helpers return Boxes (see build3d.ts).

import { INK, box, dot, line, shade } from '../draw2d'
import type { Box } from '../build3d'

export { INK, box, dot, line, shade }
export { alpha, cloth, lightPool, BOOK_COLORS } from '../draw2d'
export { b, lighten } from '../build3d'
export type { Box }

type C = CanvasRenderingContext2D

export function ell(c: C, cx: number, cy: number, rx: number, ry: number, fill: string, px: number, stroke: string | null = INK, lw = 1.2) {
  c.beginPath()
  c.ellipse(cx, cy, Math.max(0.01, rx), Math.max(0.01, ry), 0, 0, Math.PI * 2)
  c.fillStyle = fill
  c.fill()
  if (stroke) {
    c.lineWidth = lw * px
    c.strokeStyle = stroke
    c.stroke()
  }
}

/** A leaf drawn as a pointed ellipse from (x, y) outwards at `angle`, with a midrib. */
export function leaf(c: C, x: number, y: number, len: number, wid: number, angle: number, fill: string, px: number) {
  c.save()
  c.translate(x, y)
  c.rotate(angle)
  c.beginPath()
  c.moveTo(0, 0)
  c.quadraticCurveTo(len * 0.45, -wid, len, 0)
  c.quadraticCurveTo(len * 0.45, wid, 0, 0)
  c.closePath()
  c.fillStyle = fill
  c.fill()
  c.lineWidth = 0.8 * px
  c.strokeStyle = shade(fill, -0.35)
  c.stroke()
  line(c, len * 0.05, 0, len * 0.9, 0, px, 0.6, shade(fill, 0.3))
  c.restore()
}

/** Dashed ellipse outline: the plan symbol for things fixed to the ceiling. */
export function ceilingOutline(c: C, cx: number, cy: number, rx: number, ry: number, px: number) {
  c.beginPath()
  c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  c.setLineDash([4 * px, 3 * px])
  c.lineWidth = 1.2 * px
  c.strokeStyle = INK
  c.stroke()
  c.setLineDash([])
}

/** Mattress, pillows and a folded duvet filling (x, y, w, d) with the head at the top. */
export function bedding2D(c: C, x: number, y: number, w: number, d: number, px: number, duvet = '#6b8fb8', sheet = '#fbfaf7') {
  box(c, x, y, w, d, sheet, px, 4)
  const pillows = w >= 120 ? 2 : 1
  const gap = 5
  const pw = (w - gap * (pillows + 1)) / pillows
  const ph = Math.min(22, d * 0.12)
  for (let i = 0; i < pillows; i++) box(c, x + gap + i * (pw + gap), y + 4, pw, ph, '#ffffff', px, 6)
  const by = y + 4 + ph + 8
  box(c, x, by, w, y + d - by, duvet, px, 4)
  box(c, x, by, w, Math.min(14, (y + d - by) * 0.15), shade(duvet, 0.15), px, 4)
}

// ---------- 3D ----------

/** Upright cylinder (elliptical if w ≠ d) standing on z0, centred at (cx, cy). */
export function cyl(cx: number, cy: number, z0: number, w: number, d: number, h: number, color: string, extra?: Partial<Box>): Box {
  return { x: cx, y: cy, z: z0 + h / 2, w, d, h, color, cylinder: 'z', ...extra }
}

export function blob(cx: number, cy: number, zc: number, w: number, d: number, h: number, color: string, extra?: Partial<Box>): Box {
  return { x: cx, y: cy, z: zc, w, d, h, color, ellipsoid: true, ...extra }
}

/** Four square legs at the corners of a w×d footprint, inset from the edges. */
export function legs4(w: number, d: number, h: number, size: number, inset: number, color: string, z0 = 0): Box[] {
  const at = (x: number, y: number): Box => ({ x, y, z: z0 + h / 2, w: size, d: size, h, color })
  const a = inset + size / 2
  return [at(a, a), at(w - a, a), at(a, d - a), at(w - a, d - a)]
}

/** Mattress, pillows and duvet on top of a bed base whose top is at z. */
export function bedding3D(x0: number, y0: number, w: number, d: number, z: number, thick: number, duvet = '#6b8fb8'): Box[] {
  const pillows = w >= 120 ? 2 : 1
  const pw = (w - 5 * (pillows + 1)) / pillows
  const boxes: Box[] = [
    { x: x0 + w / 2, y: y0 + d / 2, z: z + thick / 2, w, d, h: thick, color: '#fbfaf7' },
    { x: x0 + w / 2, y: y0 + d * 0.62, z: z + thick + 1.5, w: w + 1, d: d * 0.72, h: 3, color: duvet },
  ]
  for (let i = 0; i < pillows; i++)
    boxes.push({ x: x0 + 5 + pw / 2 + i * (pw + 5), y: y0 + 14, z: z + thick + 4, w: pw, d: 20, h: 8, color: '#ffffff', ellipsoid: true })
  return boxes
}

/** Seeded pick from a list. */
export const pick = <T,>(rand: () => number, list: T[]) => list[Math.floor(rand() * list.length) % list.length]
