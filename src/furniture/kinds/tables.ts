import type { FloorItem } from '../../model/types'
import type { FloorDef } from '../catalog'
import { b, box, cyl, ell, legs4, line, shade, type Box } from './kit'

type C = CanvasRenderingContext2D

const round = (it: FloorItem) => Math.abs(it.w - it.d) < 1

// ---------- Writing desk: slim desk with one drawer ----------

function drawWritingDesk(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#9c6b43'
  box(c, 0, 0, w, d, color, px, 2)
  box(c, w * 0.3, d - 4, w * 0.4, 4, shade(color, -0.12), px, 1)
  // an open notebook and a pen
  box(c, w * 0.2, d * 0.2, w * 0.3, d * 0.45, '#fbfaf5', px, 1)
  line(c, w * 0.35, d * 0.2, w * 0.35, d * 0.65, px, 0.8, '#bdb5a6')
  line(c, w * 0.6, d * 0.3, w * 0.72, d * 0.55, px, 1.6, '#2e4057')
}

function buildWritingDesk(it: FloorItem): Box[] {
  const color = it.color ?? '#9c6b43'
  const top = 3
  const apron = 10
  return [
    ...legs4(it.w, it.d, it.h - top, 3.5, 2, shade(color, -0.15)),
    b(2, 2, it.h - top - apron, it.w - 4, it.d - 4, apron, color),
    b(it.w * 0.3, it.d - 2, it.h - top - apron + 2, it.w * 0.4, 1.2, apron - 4, shade(color, 0.1)),
    b(0, 0, it.h - top, it.w, it.d, top, color),
    b(it.w * 0.2, it.d * 0.2, it.h, it.w * 0.3, it.d * 0.45, 1, '#fbfaf5', { plain: true }),
  ]
}

// ---------- Console table: long and narrow, with a lower shelf ----------

function drawConsoleTable(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#6f5641'
  box(c, 0, 0, w, d, color, px, 2)
  ell(c, w * 0.15, d * 0.5, 5, 5, '#e9e2d6', px)
  box(c, w * 0.45, d * 0.25, w * 0.18, d * 0.5, '#2e4057', px, 1)
  box(c, w * 0.47, d * 0.3, w * 0.14, d * 0.4, '#c0504d', px, 1)
  ell(c, w * 0.85, d * 0.5, 6, 6, '#c8a46e', px)
}

function buildConsoleTable(it: FloorItem): Box[] {
  const color = it.color ?? '#6f5641'
  return [
    ...legs4(it.w, it.d, it.h - 3, 3, 1, shade(color, -0.2)),
    b(0, 0, it.h - 3, it.w, it.d, 3, color),
    b(2, 2, 18, it.w - 4, it.d - 4, 2, color),
    cyl(it.w * 0.15, it.d / 2, it.h, 10, 10, 26, '#e9e2d6', { taper: 0.6 }),
    b(it.w * 0.45, it.d * 0.25, it.h, it.w * 0.18, it.d * 0.5, 3, '#2e4057'),
    b(it.w * 0.47, it.d * 0.3, it.h + 3, it.w * 0.14, it.d * 0.4, 2.5, '#c0504d'),
    { x: it.w * 0.85, y: it.d / 2, z: it.h + 4, w: 14, d: 14, h: 8, color: '#c8a46e', ellipsoid: true },
    b(it.w * 0.2, 4, 20, 22, it.d - 8, 14, '#c8a46e'),
  ]
}

// ---------- Coffee table: low, round when square ----------

function drawCoffeeTable(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#b98a5e'
  if (round(it)) ell(c, w / 2, d / 2, w / 2, d / 2, color, px)
  else box(c, 0, 0, w, d, color, px, Math.min(w, d) * 0.2)
  // a magazine and a mug
  c.save()
  c.translate(w * 0.38, d * 0.5)
  c.rotate(-0.2)
  box(c, -9, -6, 18, 13, '#f2c14e', px, 0.8)
  c.restore()
  ell(c, w * 0.68, d * 0.45, 3.5, 3.5, '#ffffff', px)
}

function buildCoffeeTable(it: FloorItem): Box[] {
  const color = it.color ?? '#b98a5e'
  const top = 4
  if (round(it))
    return [
      cyl(it.w / 2, it.d / 2, 0, it.w * 0.5, it.d * 0.5, 4, shade(color, -0.2)),
      cyl(it.w / 2, it.d / 2, 4, 10, 10, it.h - top - 4, shade(color, -0.2)),
      cyl(it.w / 2, it.d / 2, it.h - top, it.w, it.d, top, color),
      cyl(it.w * 0.68, it.d * 0.45, it.h, 7, 7, 8, '#ffffff'),
    ]
  return [
    ...legs4(it.w, it.d, it.h - top, 4, 5, shade(color, -0.2)),
    b(5, 5, 10, it.w - 10, it.d - 10, 2, shade(color, -0.05)),
    b(0, 0, it.h - top, it.w, it.d, top, color),
    b(it.w * 0.3, it.d * 0.4, it.h, 18, 13, 1, '#f2c14e', { turn: -12, plain: true }),
    cyl(it.w * 0.68, it.d * 0.45, it.h, 7, 7, 8, '#ffffff'),
  ]
}

// ---------- Side table: small round pedestal table ----------

function drawSideTable(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#d8c4a5'
  ell(c, w / 2, d / 2, w / 2, d / 2, color, px)
  ell(c, w / 2, d / 2, w * 0.36, d * 0.36, shade(color, 0.06), px, shade(color, -0.2), 0.8)
  ell(c, w * 0.62, d * 0.42, 3.5, 3.5, '#ffffff', px)
}

function buildSideTable(it: FloorItem): Box[] {
  const color = it.color ?? '#d8c4a5'
  return [
    cyl(it.w / 2, it.d / 2, 0, it.w * 0.6, it.d * 0.6, 3, shade(color, -0.25)),
    cyl(it.w / 2, it.d / 2, 3, 5, 5, it.h - 6, shade(color, -0.25)),
    cyl(it.w / 2, it.d / 2, it.h - 3, it.w, it.d, 3, color),
    cyl(it.w * 0.62, it.d * 0.42, it.h, 7, 7, 9, '#ffffff'),
  ]
}

// ---------- Dining table: places set for every seat ----------

function seats(it: FloorItem) {
  const perSide = Math.max(1, Math.floor(it.w / 60))
  return { perSide, step: it.w / perSide }
}

function drawDiningTable(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#8b6a4a'
  box(c, 0, 0, w, d, color, px, 3)
  const { perSide, step } = seats(it)
  for (let i = 0; i < perSide; i++) {
    const x = step * (i + 0.5)
    for (const y of [12, d - 12]) {
      box(c, x - 15, y - 9, 30, 18, '#efe6d8', px, 2, shade(color, -0.3))
      ell(c, x, y, 7, 7, '#ffffff', px)
    }
  }
  ell(c, w / 2, d / 2, 8, 5, '#6f8f7d', px)
}

function buildDiningTable(it: FloorItem): Box[] {
  const color = it.color ?? '#8b6a4a'
  const top = 4
  const boxes: Box[] = [...legs4(it.w, it.d, it.h - top, 6, 6, shade(color, -0.2)), b(0, 0, it.h - top, it.w, it.d, top, color)]
  const { perSide, step } = seats(it)
  for (let i = 0; i < perSide; i++)
    for (const y of [12, it.d - 12]) {
      const x = step * (i + 0.5)
      boxes.push(b(x - 15, y - 9, it.h, 30, 18, 0.4, '#efe6d8', { plain: true }))
      boxes.push(cyl(x, y, it.h + 0.4, 14, 14, 1.2, '#ffffff'))
    }
  boxes.push(cyl(it.w / 2, it.d / 2, it.h, 10, 10, 18, '#6f8f7d', { taper: 0.7 }))
  return boxes
}

const table = (label: string, en: string, color: string, defaults: FloorDef['defaults'], min: FloorDef['min'], max: FloorDef['max'], draw2D: FloorDef['draw2D'], build3D: FloorDef['build3D']): FloorDef => ({
  mount: 'floor',
  label,
  en,
  category: 'table',
  color,
  defaults,
  min,
  max,
  draw2D,
  build3D,
})

export const TABLE_DEFS = {
  writingDesk: table('Bàn viết nhỏ', 'Writing desk', '#9c6b43', { w: 100, d: 50, h: 75 }, { w: 60, d: 35, h: 60 }, { w: 160, d: 80, h: 90 }, drawWritingDesk, buildWritingDesk),
  consoleTable: table('Bàn console sát tường', 'Console table', '#6f5641', { w: 120, d: 35, h: 80 }, { w: 60, d: 20, h: 60 }, { w: 240, d: 50, h: 100 }, drawConsoleTable, buildConsoleTable),
  coffeeTable: table('Bàn trà', 'Coffee table', '#b98a5e', { w: 100, d: 60, h: 42 }, { w: 40, d: 40, h: 25 }, { w: 180, d: 120, h: 55 }, drawCoffeeTable, buildCoffeeTable),
  sideTable: table('Bàn cạnh sofa', 'Side table end table', '#d8c4a5', { w: 45, d: 45, h: 55 }, { w: 30, d: 30, h: 35 }, { w: 70, d: 70, h: 75 }, drawSideTable, buildSideTable),
  diningTable: table('Bàn ăn', 'Dining table', '#8b6a4a', { w: 160, d: 90, h: 75 }, { w: 70, d: 60, h: 65 }, { w: 300, d: 140, h: 85 }, drawDiningTable, buildDiningTable),
} satisfies Record<string, FloorDef>
