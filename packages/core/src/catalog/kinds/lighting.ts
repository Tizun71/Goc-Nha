// SPDX-License-Identifier: AGPL-3.0-or-later

import type { FloorItem, WallItem } from '../../model/types'
import type { FloorDef, WallDef } from '../catalog'
import { blob, ceilingOutline, cyl, dot, ell, lightPool, shade, type Box } from './kit'

type C = CanvasRenderingContext2D
const WARM = '#ffd36b'

// ---------- Floor lamp: weighted base, pole and drum shade ----------

function drawFloorLamp(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const r = Math.min(w, d) / 2
  lightPool(c, w / 2, d / 2, r * 3, 0.35)
  ell(c, w / 2, d / 2, r * 0.7, r * 0.7, '#44403c', px)
  ell(c, w / 2, d / 2, r, r, it.color ?? '#efe3c8', px)
  ell(c, w / 2, d / 2, r * 0.6, r * 0.6, shade(it.color ?? '#efe3c8', 0.1), px, shade(it.color ?? '#efe3c8', -0.25), 0.8)
  dot(c, w / 2, d / 2, r * 0.2, WARM)
}

function buildFloorLamp(it: FloorItem): Box[] {
  const shadeH = Math.min(35, it.h * 0.22)
  const s = Math.min(it.w, it.d)
  return [
    cyl(it.w / 2, it.d / 2, 0, s * 0.7, s * 0.7, 3, '#44403c'),
    cyl(it.w / 2, it.d / 2, 3, 2.2, 2.2, it.h - shadeH - 3, '#78716c'),
    blob(it.w / 2, it.d / 2, it.h - shadeH * 0.8, s * 0.3, s * 0.3, s * 0.3, WARM, { glow: true }),
    cyl(it.w / 2, it.d / 2, it.h - shadeH, s, s, shadeH, it.color ?? '#efe3c8', { taper: 1.15, opacity: 0.95 }),
  ]
}

// ---------- Pendant light: dome shade hanging on a cord ----------

function drawPendantLight(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  lightPool(c, w / 2, d / 2, Math.max(w, d) * 2, 0.32)
  ell(c, w / 2, d / 2, w / 2, d / 2, it.color ?? '#2f3e46', px)
  ell(c, w / 2, d / 2, w * 0.3, d * 0.3, WARM, px, null)
  ceilingOutline(c, w / 2, d / 2, w / 2 + 3, d / 2 + 3, px)
  dot(c, w / 2, d / 2, 1.5, '#1f2937')
}

/** Built from z=0 (bottom of the shade) up to h (the ceiling); the iso view lifts it to the ceiling. */
function buildPendantLight(it: FloorItem): Box[] {
  const shadeH = Math.min(25, it.h * 0.4)
  return [
    cyl(it.w / 2, it.d / 2, it.h - 2, 12, 12, 2, '#1f2937'),
    cyl(it.w / 2, it.d / 2, shadeH, 0.8, 0.8, it.h - shadeH - 2, '#1f2937'),
    // narrow at the top, as wide as the item at the bottom
    cyl(it.w / 2, it.d / 2, 0, it.w * 0.45, it.d * 0.45, shadeH, it.color ?? '#2f3e46', { taper: 1 / 0.45 }),
    blob(it.w / 2, it.d / 2, 2, it.w * 0.35, it.d * 0.35, 6, WARM, { glow: true }),
  ]
}

// ---------- Candle holder: a tray with three candles ----------

function drawCandleHolder(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  lightPool(c, w / 2, d / 2, Math.max(w, d) * 2.2, 0.35)
  ell(c, w / 2, d / 2, w / 2, d / 2, it.color ?? '#c8a46e', px)
  for (const [x, y, r] of [
    [0.35, 0.4, 0.17],
    [0.65, 0.42, 0.14],
    [0.5, 0.68, 0.12],
  ]) {
    ell(c, w * x, d * y, w * r, d * r, '#f8f1e3', px, '#cbbfa8', 0.8)
    dot(c, w * x, d * y, Math.min(w, d) * 0.05, '#ffb347')
  }
}

function buildCandleHolder(it: FloorItem): Box[] {
  const boxes: Box[] = [cyl(it.w / 2, it.d / 2, 0, it.w, it.d, 2, it.color ?? '#c8a46e')]
  for (const [x, y, r, hf] of [
    [0.35, 0.4, 0.34, 0.75],
    [0.65, 0.42, 0.28, 0.55],
    [0.5, 0.68, 0.24, 0.4],
  ]) {
    const ch = (it.h - 4) * hf
    boxes.push(cyl(it.w * x, it.d * y, 2, it.w * r, it.d * r, ch, '#f8f1e3'))
    boxes.push(blob(it.w * x, it.d * y, 2 + ch + 1.5, 1.2, 1.2, 3, '#ffb347', { glow: true }))
  }
  return boxes
}

// ---------- String lights (wall): a sagging wire of warm bulbs ----------

/** Height of the wire below its top at a point t (0..1) along it: one or two gentle sags. */
function sag(it: WallItem, t: number) {
  const loops = it.w > 160 ? 2 : 1
  return it.h * Math.abs(Math.sin(t * Math.PI * loops))
}

function drawStringLights(c: C, it: WallItem, px: number) {
  const { w } = it
  const n = Math.max(4, Math.round(w / 18))
  c.beginPath()
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    const y = 2 + (sag(it, t) / it.h) * 8
    if (i === 0) c.moveTo(t * w, y)
    else c.lineTo(t * w, y)
  }
  c.lineWidth = px
  c.strokeStyle = '#44403c'
  c.stroke()
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n
    const y = 2 + (sag(it, t) / it.h) * 8
    lightPool(c, t * w, y + 2, 9, 0.5)
    dot(c, t * w, y + 1.5, 1.6, it.color ?? '#ffd08a')
  }
}

function buildStringLights(it: WallItem): Box[] {
  const n = Math.max(4, Math.round(it.w / 18))
  const top = it.elevation + it.h
  const boxes: Box[] = []
  const steps = 16
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps
    const t1 = (i + 1) / steps
    const z0 = top - sag(it, t0)
    const z1 = top - sag(it, t1)
    const len = Math.hypot((t1 - t0) * it.w, z1 - z0)
    const tilt = (Math.atan2(z1 - z0, (t1 - t0) * it.w) * 180) / Math.PI
    boxes.push({ x: ((t0 + t1) / 2) * it.w, y: 2, z: (z0 + z1) / 2, w: len, d: 0.5, h: 0.5, color: '#44403c', tilt, plain: true })
  }
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n
    boxes.push(blob(t * it.w, 2.5, top - sag(it, t) - 2, 2.4, 2.4, 3.2, it.color ?? '#ffd08a', { glow: true }))
  }
  return boxes
}

export const LIGHTING_DEFS = {
  floorLamp: {
    mount: 'floor',
    label: 'Đèn cây',
    en: 'Floor lamp',
    category: 'lighting',
    color: '#efe3c8',
    defaults: { w: 40, d: 40, h: 160 },
    min: { w: 25, d: 25, h: 100 },
    max: { w: 70, d: 70, h: 200 },
    draw2D: drawFloorLamp,
    build3D: buildFloorLamp,
  },
  pendantLight: {
    mount: 'floor',
    layer: 'ceiling',
    label: 'Đèn thả trần',
    en: 'Pendant light',
    category: 'lighting',
    color: '#2f3e46',
    defaults: { w: 35, d: 35, h: 80 },
    min: { w: 15, d: 15, h: 30 },
    max: { w: 80, d: 80, h: 150 },
    draw2D: drawPendantLight,
    build3D: buildPendantLight,
  },
  candleHolder: {
    mount: 'floor',
    layer: 'decor',
    label: 'Chân nến',
    en: 'Candle holder',
    category: 'lighting',
    color: '#c8a46e',
    defaults: { w: 18, d: 18, h: 18 },
    min: { w: 8, d: 8, h: 8 },
    max: { w: 50, d: 50, h: 50 },
    draw2D: drawCandleHolder,
    build3D: buildCandleHolder,
  },
} satisfies Record<string, FloorDef>

export const LIGHTING_WALL_DEFS = {
  stringLights: {
    mount: 'wall',
    label: 'Đèn dây (fairy lights)',
    en: 'String lights fairy lights',
    category: 'lighting',
    color: '#ffd08a',
    defaults: { w: 200, d: 0, h: 25, elevation: 170 },
    min: { w: 40, d: 0, h: 5 },
    max: { w: 1000, d: 0, h: 60 },
    depth: () => 12,
    draw2D: drawStringLights,
    build3D: buildStringLights,
  },
} satisfies Record<string, WallDef>
