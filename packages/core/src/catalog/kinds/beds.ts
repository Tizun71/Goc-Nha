// SPDX-License-Identifier: AGPL-3.0-or-later

import type { FloorItem } from '../../model/types'
import type { FloorDef } from '../catalog'
import { b, bedding2D, bedding3D, box, dot, legs4, line, shade, type Box } from './kit'

type C = CanvasRenderingContext2D

// ---------- Platform bed: low base sticking out around the mattress ----------

function drawPlatformBed(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#c8a27a'
  box(c, 0, 0, w, d, color, px, 2)
  box(c, 0, 0, w, 6, shade(color, -0.15), px, 2)
  const ledge = Math.min(10, w * 0.06)
  bedding2D(c, ledge, 9, w - 2 * ledge, d - 9 - ledge, px, '#d8cbb5')
}

function buildPlatformBed(it: FloorItem): Box[] {
  const color = it.color ?? '#c8a27a'
  const base = Math.min(18, it.h * 0.6)
  const ledge = Math.min(10, it.w * 0.06)
  return [
    b(0, 0, 0, it.w, it.d, base, color),
    b(0, 0, 0, it.w, 6, base + 35, shade(color, -0.15)),
    ...bedding3D(ledge, 9, it.w - 2 * ledge, it.d - 9 - ledge, base, it.h - base, '#d8cbb5'),
  ]
}

// ---------- Canopy bed: four posts, a top frame and sheer drapes ----------

function drawCanopyBed(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#3f3a36'
  box(c, 0, 0, w, d, shade(color, 0.55), px, 2)
  bedding2D(c, 5, 8, w - 10, d - 13, px, '#e9e2d6')
  // the canopy frame overhead, drawn dashed like other things above eye level
  c.setLineDash([5 * px, 4 * px])
  c.lineWidth = 1.5 * px
  c.strokeStyle = color
  c.strokeRect(2, 2, w - 4, d - 4)
  c.setLineDash([])
  // sheer drapes gathered at the four posts
  c.fillStyle = 'rgba(255,255,255,0.55)'
  for (const [x, y] of [
    [0, 0],
    [w - 14, 0],
    [0, d - 14],
    [w - 14, d - 14],
  ])
    c.fillRect(x, y, 14, 14)
  for (const [x, y] of [
    [3, 3],
    [w - 3, 3],
    [3, d - 3],
    [w - 3, d - 3],
  ])
    dot(c, x, y, 3, color)
}

function buildCanopyBed(it: FloorItem): Box[] {
  const color = it.color ?? '#3f3a36'
  const top = 210
  const frame = Math.min(25, it.h * 0.55)
  const post = 5
  const boxes: Box[] = [
    b(0, 0, 0, it.w, it.d, frame, shade(color, 0.45)),
    b(0, 0, 0, it.w, 5, it.h + 40, shade(color, 0.3)),
    ...bedding3D(5, 8, it.w - 10, it.d - 13, frame, it.h - frame, '#e9e2d6'),
    ...legs4(it.w, it.d, top, post, 0, color),
    // top rails
    b(0, 0, top - 4, it.w, post, 4, color),
    b(0, it.d - post, top - 4, it.w, post, 4, color),
    b(0, 0, top - 4, post, it.d, 4, color),
    b(it.w - post, 0, top - 4, post, it.d, 4, color),
  ]
  // sheer drapes hanging from the head corners and tied at the foot posts
  for (const x of [post, it.w - post - 18]) boxes.push(b(x, post, 40, 18, 2, top - 44, '#ffffff', { opacity: 0.45 }))
  for (const x of [post, it.w - post - 10]) boxes.push(b(x, it.d - post - 2, 60, 10, 2, top - 64, '#ffffff', { opacity: 0.45 }))
  return boxes
}

// ---------- Upholstered bed: padded, button-tufted headboard ----------

function drawUpholsteredBed(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#8e9aaf'
  box(c, 0, 0, w, d, color, px, 6)
  box(c, -2, 0, w + 4, 12, shade(color, -0.12), px, 6)
  for (let x = 10; x < w - 6; x += 14) dot(c, x, 6, 1.2, shade(color, -0.4))
  bedding2D(c, 6, 14, w - 12, d - 20, px, '#f0e6da')
}

function buildUpholsteredBed(it: FloorItem): Box[] {
  const color = it.color ?? '#8e9aaf'
  const frame = Math.min(28, it.h * 0.6)
  const head = it.h + 75
  const boxes: Box[] = [
    ...legs4(it.w, it.d, 6, 5, 4, '#5b4636'),
    b(0, 0, 6, it.w, it.d, frame - 6, color),
    b(-2, 0, 0, it.w + 4, 12, head, shade(color, -0.12)),
    ...bedding3D(6, 14, it.w - 12, it.d - 20, frame, it.h - frame, '#f0e6da'),
  ]
  // tufting buttons on the headboard front
  for (let z = frame + 25; z < head - 8; z += 18)
    for (let x = 12; x < it.w - 8; x += 18) boxes.push(b(x - 1, 12, z, 2, 0.8, 2, shade(color, -0.4), { plain: true }))
  return boxes
}

// ---------- Storage bed: drawers along both long sides ----------

function drawStorageBed(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#e7ddd0'
  box(c, 0, 0, w, d, color, px, 2)
  box(c, 0, 0, w, 8, shade(color, -0.2), px, 2)
  bedding2D(c, 6, 10, w - 12, d - 14, px, '#7c9a8a')
  // drawer fronts and handles on both sides
  const drawers = Math.max(1, Math.round((d - 20) / 60))
  const dh = (d - 20) / drawers
  for (const x of [0, w - 4])
    for (let i = 0; i < drawers; i++) {
      box(c, x, 14 + i * dh, 4, dh - 4, shade(color, -0.08), px, 1)
      line(c, x + 2, 14 + i * dh + dh / 2 - 6, x + 2, 14 + i * dh + dh / 2 + 4, px, 2, '#8a8a8a')
    }
}

function buildStorageBed(it: FloorItem): Box[] {
  const color = it.color ?? '#e7ddd0'
  const base = Math.min(32, it.h * 0.7)
  const drawers = Math.max(1, Math.round((it.d - 20) / 60))
  const dh = (it.d - 20) / drawers
  const boxes: Box[] = [
    b(0, 0, 0, it.w, it.d, base, color),
    b(0, 0, 0, it.w, 8, it.h + 45, shade(color, -0.2)),
    ...bedding3D(6, 10, it.w - 12, it.d - 14, base, it.h - base, '#7c9a8a'),
  ]
  for (const x of [-1, it.w])
    for (let i = 0; i < drawers; i++) {
      boxes.push(b(x, 14 + i * dh, 3, 1, dh - 4, base - 6, shade(color, -0.08)))
      boxes.push(b(x + (x < 0 ? -1 : 1), 14 + i * dh + dh / 2 - 6, base / 2, 1, 12, 2, '#8a8a8a', { plain: true }))
    }
  return boxes
}

// ---------- Tatami bed: low wooden platform with straw mats and a futon ----------

function drawTatamiBed(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#b58a5a'
  const mat = '#d9cf9c'
  box(c, 0, 0, w, d, color, px, 1)
  const m = 6
  // two mats side by side, each with its dark cloth border
  const mw = (w - 2 * m) / 2
  for (let i = 0; i < 2; i++) {
    box(c, m + i * mw, m, mw, d - 2 * m, mat, px, 0, '#3b3a2a')
    for (let y = m + 3; y < d - m; y += 3) line(c, m + i * mw + 1.5, y, m + (i + 1) * mw - 1.5, y, px, 0.5, shade(mat, -0.12))
    box(c, m + i * mw, m, 2, d - 2 * m, '#2f3b2b', px, 0, '#2f3b2b')
  }
  // a thin futon with a pillow
  const fw = Math.min(w - 2 * m - 20, 100)
  const fx = (w - fw) / 2
  box(c, fx, m + 10, fw, d - 2 * m - 20, '#f7f4ec', px, 6)
  box(c, fx + 10, m + 16, fw - 20, 18, '#ffffff', px, 6)
  box(c, fx, m + 50, fw, d - 2 * m - 60, '#a7b8c9', px, 6)
}

function buildTatamiBed(it: FloorItem): Box[] {
  const color = it.color ?? '#b58a5a'
  const base = Math.max(8, it.h - 10)
  const m = 6
  const fw = Math.min(it.w - 2 * m - 20, 100)
  const fx = (it.w - fw) / 2
  return [
    b(0, 0, 0, it.w, it.d, base, color),
    b(m, m, base, it.w - 2 * m, it.d - 2 * m, 2, '#d9cf9c'),
    b(m + (it.w - 2 * m) / 2 - 1, m, base + 2, 2, it.d - 2 * m, 0.4, '#2f3b2b', { plain: true }),
    b(fx, m + 10, base + 2, fw, it.d - 2 * m - 20, 6, '#f7f4ec'),
    { x: fx + fw / 2, y: m + 25, z: base + 11, w: fw - 20, d: 18, h: 7, color: '#ffffff', ellipsoid: true },
    b(fx, m + 50, base + 8, fw, it.d - 2 * m - 60, 3, '#a7b8c9'),
  ]
}

// ---------- Daybed: a sofa-like bed with a back along the long side ----------

function drawDaybed(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#d6c7b0'
  box(c, 0, 0, w, d, shade(color, -0.1), px, 4)
  box(c, 0, 0, w, 12, shade(color, -0.25), px, 4) // back
  box(c, 0, 0, 10, d, shade(color, -0.2), px, 4)
  box(c, w - 10, 0, 10, d, shade(color, -0.2), px, 4)
  box(c, 10, 12, w - 20, d - 14, '#f5efe6', px, 4)
  // bolsters and cushions against the back
  box(c, 12, 14, 18, d - 22, '#c9a98a', px, 9)
  box(c, w - 30, 14, 18, d - 22, '#c9a98a', px, 9)
  const n = Math.max(2, Math.round((w - 60) / 45))
  const cw = (w - 64) / n
  for (let i = 0; i < n; i++) box(c, 32 + i * cw, 14, cw - 4, 16, i % 2 ? '#e8b4a0' : '#9fb8ad', px, 5)
}

function buildDaybed(it: FloorItem): Box[] {
  const color = it.color ?? '#d6c7b0'
  const seat = Math.min(42, it.h * 0.5)
  const n = Math.max(2, Math.round((it.w - 60) / 45))
  const cw = (it.w - 64) / n
  const boxes: Box[] = [
    ...legs4(it.w, it.d, 8, 4, 3, '#5b4636'),
    b(0, 0, 8, it.w, it.d, seat - 20, shade(color, -0.1)),
    b(0, 0, 8, it.w, 12, it.h - 8, shade(color, -0.25)),
    b(0, 0, 8, 10, it.d, it.h * 0.7, shade(color, -0.2)),
    b(it.w - 10, 0, 8, 10, it.d, it.h * 0.7, shade(color, -0.2)),
    b(10, 12, seat - 12, it.w - 20, it.d - 14, 12, '#f5efe6'),
    { x: 21, y: it.d / 2 + 5, z: seat + 9, w: 18, d: it.d - 22, h: 18, color: '#c9a98a', cylinder: 'y' },
    { x: it.w - 21, y: it.d / 2 + 5, z: seat + 9, w: 18, d: it.d - 22, h: 18, color: '#c9a98a', cylinder: 'y' },
  ]
  for (let i = 0; i < n; i++) boxes.push({ x: 32 + i * cw + cw / 2 - 2, y: 20, z: seat + 18, w: cw - 4, d: 14, h: 34, color: i % 2 ? '#e8b4a0' : '#9fb8ad', ellipsoid: true })
  return boxes
}

const bed = (label: string, en: string, color: string, defaults: FloorDef['defaults'], draw2D: FloorDef['draw2D'], build3D: FloorDef['build3D']): FloorDef => ({
  mount: 'floor',
  label,
  en,
  category: 'bed',
  color,
  defaults,
  min: { w: 80, d: 150, h: 15 },
  max: { w: 240, d: 240, h: 90 },
  draw2D,
  build3D,
})

export const BED_DEFS = {
  platformBed: bed('Giường bệt', 'Platform bed', '#c8a27a', { w: 180, d: 210, h: 30 }, drawPlatformBed, buildPlatformBed),
  canopyBed: bed('Giường có khung màn', 'Canopy bed', '#3f3a36', { w: 170, d: 215, h: 50 }, drawCanopyBed, buildCanopyBed),
  upholsteredBed: bed('Giường bọc nệm', 'Upholstered bed', '#8e9aaf', { w: 170, d: 215, h: 50 }, drawUpholsteredBed, buildUpholsteredBed),
  storageBed: bed('Giường có ngăn kéo', 'Storage bed', '#e7ddd0', { w: 170, d: 210, h: 50 }, drawStorageBed, buildStorageBed),
  tatamiBed: bed('Giường kiểu Nhật (tatami)', 'Tatami bed', '#b58a5a', { w: 200, d: 220, h: 25 }, drawTatamiBed, buildTatamiBed),
  daybed: { ...bed('Ghế giường thư giãn', 'Daybed', '#d6c7b0', { w: 200, d: 90, h: 80 }, drawDaybed, buildDaybed), min: { w: 150, d: 70, h: 50 }, max: { w: 240, d: 120, h: 100 } },
} satisfies Record<string, FloorDef>
