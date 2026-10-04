import type { FloorItem } from '../../model/types'
import type { FloorDef } from '../catalog'
import { seededRandom } from '../../lib/random'
import { b, blob, box, ceilingOutline, cyl, dot, ell, leaf, legs4, line, shade, type Box } from './kit'

type C = CanvasRenderingContext2D
const GREENS = ['#2f7a43', '#3f8f4f', '#4fa35e', '#5cb46b']

// ---------- pots ----------

function pot2D(c: C, it: FloorItem, px: number, color: string, k = 0.62) {
  const r = Math.min(it.w, it.d) / 2
  ell(c, it.w / 2, it.d / 2, r * k, r * k, color, px)
  ell(c, it.w / 2, it.d / 2, r * k * 0.8, r * k * 0.8, '#5b4636', px, null)
}

/** A tapered pot with a rim and soil; returns the boxes and the soil height. */
function pot3D(it: FloorItem, color: string, height: number, k = 0.62): Box[] {
  const s = Math.min(it.w, it.d)
  return [
    cyl(it.w / 2, it.d / 2, 0, s * k, s * k, height, color, { taper: 0.75 }),
    cyl(it.w / 2, it.d / 2, height - 2, s * k * 1.06, s * k * 1.06, 2, shade(color, -0.12)),
    cyl(it.w / 2, it.d / 2, height - 1.5, s * k * 0.9, s * k * 0.9, 0.5, '#5b4636', { plain: true }),
  ]
}

// ---------- Monstera: big split leaves on long stems ----------

function drawMonstera(c: C, it: FloorItem, px: number) {
  const rand = seededRandom(it.id)
  pot2D(c, it, px, '#e9e2d6', 0.45)
  const r = Math.min(it.w, it.d) / 2
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rand() * 0.4
    const len = r * (0.85 + rand() * 0.2)
    leaf(c, it.w / 2, it.d / 2, len, len * 0.42, a, GREENS[i % 4], px)
    // the characteristic slits
    c.save()
    c.translate(it.w / 2, it.d / 2)
    c.rotate(a)
    for (let k = 0.45; k < 0.9; k += 0.15) {
      line(c, len * k, -len * 0.05, len * (k + 0.05), -len * 0.3, px, 1.2, '#f4ede1')
      line(c, len * k, len * 0.05, len * (k + 0.05), len * 0.3, px, 1.2, '#f4ede1')
    }
    c.restore()
  }
}

function buildMonstera(it: FloorItem): Box[] {
  const rand = seededRandom(it.id)
  const pot = it.h * 0.25
  const s = Math.min(it.w, it.d)
  const boxes = pot3D(it, '#e9e2d6', pot, 0.45)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.4
    const reach = s * (0.18 + rand() * 0.18)
    const z = pot + (it.h - pot) * (0.35 + rand() * 0.55)
    const lx = it.w / 2 + Math.cos(a) * reach
    const ly = it.d / 2 + Math.sin(a) * reach
    boxes.push({ x: (it.w / 2 + lx) / 2, y: (it.d / 2 + ly) / 2, z: (pot + z) / 2, w: 0.8, d: 0.8, h: z - pot, color: '#3f6b3a', cylinder: 'z', plain: true })
    boxes.push(blob(lx, ly, z, s * 0.42, s * 0.34, 1.5, GREENS[i % 4], { turn: (a * 180) / Math.PI, tilt: 15 + rand() * 25 }))
  }
  return boxes
}

// ---------- Fiddle leaf fig: a trunk with large leaves near the top ----------

function drawFiddleLeafFig(c: C, it: FloorItem, px: number) {
  const rand = seededRandom(it.id)
  pot2D(c, it, px, '#c8a46e')
  const r = Math.min(it.w, it.d) / 2
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2
    const off = r * 0.25 * rand()
    leaf(c, it.w / 2 + Math.cos(a) * off, it.d / 2 + Math.sin(a) * off, r * (0.5 + rand() * 0.3), r * 0.28, a, GREENS[i % 4], px)
  }
}

function buildFiddleLeafFig(it: FloorItem): Box[] {
  const rand = seededRandom(it.id)
  const pot = Math.min(35, it.h * 0.2)
  const s = Math.min(it.w, it.d)
  const boxes = pot3D(it, '#c8a46e', pot)
  boxes.push(cyl(it.w / 2, it.d / 2, pot, 3, 3, it.h * 0.75 - pot, '#7a5a3c'))
  for (let i = 0; i < 18; i++) {
    const a = rand() * Math.PI * 2
    const r = s * 0.28 * rand()
    const z = it.h * (0.45 + rand() * 0.52)
    boxes.push(blob(it.w / 2 + Math.cos(a) * r, it.d / 2 + Math.sin(a) * r, z, s * 0.3, s * 0.18, 1.6, GREENS[i % 4], { turn: (a * 180) / Math.PI, tilt: 20 + rand() * 40 }))
  }
  return boxes
}

// ---------- Snake plant: upright sword-shaped leaves ----------

function drawSnakePlant(c: C, it: FloorItem, px: number) {
  const rand = seededRandom(it.id)
  pot2D(c, it, px, '#f2f2f2', 0.75)
  const r = Math.min(it.w, it.d) / 2
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand()
    const off = r * 0.2
    const x = it.w / 2 + Math.cos(a) * off
    const y = it.d / 2 + Math.sin(a) * off
    ell(c, x, y, r * 0.22, r * 0.08, '#3d6b45', px, '#c9c25a', 1.2)
  }
}

function buildSnakePlant(it: FloorItem): Box[] {
  const rand = seededRandom(it.id)
  const pot = it.h * 0.3
  const s = Math.min(it.w, it.d)
  const boxes = pot3D(it, '#f2f2f2', pot, 0.75)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand()
    const off = s * 0.1
    const h = (it.h - pot) * (0.6 + rand() * 0.4) * 2
    boxes.push(blob(it.w / 2 + Math.cos(a) * off, it.d / 2 + Math.sin(a) * off, pot, s * 0.14, s * 0.05, h, i % 3 ? '#3d6b45' : '#4f7f4f', { turn: (a * 180) / Math.PI, tilt: (rand() - 0.5) * 12 }))
  }
  return boxes
}

// ---------- Pothos: heart-shaped leaves trailing over the pot ----------

function drawPothos(c: C, it: FloorItem, px: number) {
  const rand = seededRandom(it.id)
  pot2D(c, it, px, '#d97757', 0.7)
  const r = Math.min(it.w, it.d) / 2
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2
    const off = r * (0.2 + rand() * 0.9)
    ell(c, it.w / 2 + Math.cos(a) * off, it.d / 2 + Math.sin(a) * off, r * 0.16, r * 0.13, i % 3 ? '#5cb46b' : '#a8c95b', px, '#2f7a43', 0.8)
  }
}

function buildPothos(it: FloorItem): Box[] {
  const rand = seededRandom(it.id)
  const pot = it.h * 0.55
  const s = Math.min(it.w, it.d)
  const boxes = pot3D(it, '#d97757', pot, 0.7)
  boxes.push(blob(it.w / 2, it.d / 2, pot + s * 0.12, s * 0.75, s * 0.75, s * 0.35, '#4fa35e'))
  // vines hanging over the rim
  for (let v = 0; v < 5; v++) {
    const a = (v / 5) * Math.PI * 2 + rand()
    const r = s * 0.38
    for (let k = 0; k < 5; k++)
      boxes.push(blob(it.w / 2 + Math.cos(a) * (r + k * 0.6), it.d / 2 + Math.sin(a) * (r + k * 0.6), pot - k * (it.h * 0.12), s * 0.14, s * 0.14, s * 0.1, k % 2 ? '#5cb46b' : '#a8c95b'))
  }
  return boxes
}

// ---------- Olive tree: slim trunk and an airy grey-green crown ----------

function drawOliveTree(c: C, it: FloorItem, px: number) {
  const rand = seededRandom(it.id)
  pot2D(c, it, px, '#b8b1a6')
  const r = Math.min(it.w, it.d) / 2
  for (let i = 0; i < 40; i++) {
    const a = rand() * Math.PI * 2
    const off = r * rand()
    leaf(c, it.w / 2 + Math.cos(a) * off, it.d / 2 + Math.sin(a) * off, r * 0.22, r * 0.05, rand() * Math.PI * 2, i % 2 ? '#8a9a6b' : '#a3b18a', px)
  }
}

function buildOliveTree(it: FloorItem): Box[] {
  const rand = seededRandom(it.id)
  const pot = Math.min(35, it.h * 0.2)
  const s = Math.min(it.w, it.d)
  const boxes = pot3D(it, '#b8b1a6', pot)
  boxes.push(cyl(it.w / 2, it.d / 2, pot, 2.5, 2.5, it.h * 0.7 - pot, '#6b5a48'))
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2
    const r = s * 0.3 * rand()
    const z = it.h * (0.55 + rand() * 0.4)
    const k = s * (0.2 + rand() * 0.15)
    boxes.push(blob(it.w / 2 + Math.cos(a) * r, it.d / 2 + Math.sin(a) * r, z, k, k, k * 0.7, i % 2 ? '#8a9a6b' : '#a3b18a'))
  }
  return boxes
}

// ---------- Bonsai: shallow tray pot, twisted trunk and flat foliage pads ----------

function drawBonsai(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  box(c, w * 0.05, d * 0.15, w * 0.9, d * 0.7, '#4a5a6a', px, 2)
  box(c, w * 0.1, d * 0.22, w * 0.8, d * 0.56, '#7a6a52', px, 1, '#7a6a52')
  for (const [x, y, r] of [
    [0.3, 0.4, 0.22],
    [0.62, 0.35, 0.18],
    [0.5, 0.65, 0.2],
  ])
    ell(c, w * x, d * y, w * r, d * r * 0.9, '#3f7a4a', px)
  line(c, w * 0.45, d * 0.55, w * 0.3, d * 0.4, px, 2.5, '#5a4632')
}

function buildBonsai(it: FloorItem): Box[] {
  const tray = Math.min(6, it.h * 0.2)
  const s = Math.min(it.w, it.d)
  return [
    b(it.w * 0.05, it.d * 0.15, 0, it.w * 0.9, it.d * 0.7, tray, '#4a5a6a'),
    { x: it.w * 0.45, y: it.d / 2, z: tray + it.h * 0.2, w: 2.5, d: 2.5, h: it.h * 0.4, color: '#5a4632', tilt: 20 },
    { x: it.w * 0.38, y: it.d / 2, z: tray + it.h * 0.5, w: 2, d: 2, h: it.h * 0.3, color: '#5a4632', tilt: -35 },
    blob(it.w * 0.28, it.d * 0.45, it.h * 0.72, s * 0.55, s * 0.5, it.h * 0.14, '#3f7a4a'),
    blob(it.w * 0.62, it.d * 0.4, it.h * 0.6, s * 0.45, s * 0.4, it.h * 0.12, '#4a8a55'),
    blob(it.w * 0.45, it.d * 0.55, it.h * 0.88, s * 0.4, s * 0.38, it.h * 0.12, '#3f7a4a'),
  ]
}

// ---------- Dried pampas grass in a tall vase ----------

function drawPampasGrass(c: C, it: FloorItem, px: number) {
  const rand = seededRandom(it.id)
  const r = Math.min(it.w, it.d) / 2
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + rand() * 0.5
    leaf(c, it.w / 2, it.d / 2, r * (0.8 + rand() * 0.3), r * 0.22, a, i % 2 ? '#e8d9b8' : '#f1e6cc', px)
  }
  ell(c, it.w / 2, it.d / 2, r * 0.35, r * 0.35, '#f2efe9', px)
  dot(c, it.w / 2, it.d / 2, r * 0.2, '#8a7a60')
}

function buildPampasGrass(it: FloorItem): Box[] {
  const rand = seededRandom(it.id)
  const vase = it.h * 0.35
  const s = Math.min(it.w, it.d)
  const boxes: Box[] = [
    cyl(it.w / 2, it.d / 2, 0, s * 0.4, s * 0.4, vase * 0.7, '#f2efe9', { taper: 0.8 }),
    cyl(it.w / 2, it.d / 2, vase * 0.7, s * 0.22, s * 0.22, vase * 0.3, '#f2efe9', { taper: 1.8 }),
  ]
  for (let i = 0; i < 8; i++) {
    const tilt = (rand() - 0.5) * 40
    const stem = it.h * (0.55 + rand() * 0.25)
    const a = (i / 8) * Math.PI * 2
    boxes.push({ x: it.w / 2, y: it.d / 2, z: vase + stem / 2 - 10, w: 0.6, d: 0.6, h: stem, color: '#bfa98a', tilt, turn: (a * 180) / Math.PI, plain: true })
    const lean = Math.sin((tilt * Math.PI) / 180) * stem
    boxes.push(blob(it.w / 2 - lean * Math.cos(a) * 0.5, it.d / 2 - lean * Math.sin(a) * 0.5, vase + stem - 14, s * 0.18, s * 0.18, it.h * 0.25, i % 2 ? '#e8d9b8' : '#f1e6cc', { turn: (a * 180) / Math.PI, tilt }))
  }
  return boxes
}

// ---------- Empty pots ----------

function drawCeramicPot(c: C, it: FloorItem, px: number) {
  const color = it.color ?? '#9fb8ad'
  const r = Math.min(it.w, it.d) / 2
  ell(c, it.w / 2, it.d / 2, r, r, color, px)
  ell(c, it.w / 2, it.d / 2, r * 0.8, r * 0.8, shade(color, 0.15), px, shade(color, -0.2), 0.8)
  ell(c, it.w / 2, it.d / 2, r * 0.7, r * 0.7, '#5b4636', px, null)
}

function buildCeramicPot(it: FloorItem): Box[] {
  const color = it.color ?? '#9fb8ad'
  const s = Math.min(it.w, it.d)
  const boxes: Box[] = [cyl(it.w / 2, it.d / 2, 0, s, s, it.h, color, { taper: 0.7 })]
  // glazed ridges
  for (let z = it.h * 0.2; z < it.h - 2; z += it.h * 0.2) boxes.push(cyl(it.w / 2, it.d / 2, z, s * (0.72 + (0.28 * z) / it.h) + 0.6, s * (0.72 + (0.28 * z) / it.h) + 0.6, 0.8, shade(color, 0.15), { plain: true }))
  boxes.push(cyl(it.w / 2, it.d / 2, it.h - 1.5, s * 0.9, s * 0.9, 0.5, '#5b4636', { plain: true }))
  return boxes
}

function drawTerracottaPot(c: C, it: FloorItem, px: number) {
  const color = it.color ?? '#c46b43'
  const r = Math.min(it.w, it.d) / 2
  ell(c, it.w / 2, it.d / 2, r, r, shade(color, -0.1), px)
  ell(c, it.w / 2, it.d / 2, r * 0.82, r * 0.82, color, px, shade(color, -0.25), 0.8)
  ell(c, it.w / 2, it.d / 2, r * 0.72, r * 0.72, '#5b4636', px, null)
}

function buildTerracottaPot(it: FloorItem): Box[] {
  const color = it.color ?? '#c46b43'
  const s = Math.min(it.w, it.d)
  const rim = it.h * 0.22
  return [
    cyl(it.w / 2, it.d / 2, 0, s * 0.85, s * 0.85, it.h - rim, color, { taper: 0.75 }),
    cyl(it.w / 2, it.d / 2, it.h - rim, s, s, rim, shade(color, -0.08)),
    cyl(it.w / 2, it.d / 2, it.h - 1.5, s * 0.82, s * 0.82, 0.5, '#5b4636', { plain: true }),
  ]
}

// ---------- Plant stand: plants placed on it stand on its top ----------

function drawPlantStand(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#a8784f'
  ell(c, w / 2, d / 2, w / 2, d / 2, color, px)
  ell(c, w / 2, d / 2, w * 0.4, d * 0.4, shade(color, 0.1), px, shade(color, -0.25), 0.8)
  for (const [x, y] of [
    [0.15, 0.15],
    [0.85, 0.15],
    [0.15, 0.85],
    [0.85, 0.85],
  ])
    dot(c, w * x, d * y, 1.8, shade(color, -0.35))
}

function buildPlantStand(it: FloorItem): Box[] {
  const color = it.color ?? '#a8784f'
  return [
    ...legs4(it.w, it.d, it.h - 3, 3, it.w * 0.1, shade(color, -0.2)),
    cyl(it.w / 2, it.d / 2, it.h - 3, it.w, it.d, 3, color),
    cyl(it.w / 2, it.d / 2, it.h * 0.3, it.w * 0.85, it.d * 0.85, 2, color),
  ]
}

// ---------- Hanging planter: macramé hanger from the ceiling ----------

function drawHangingPlanter(c: C, it: FloorItem, px: number) {
  const r = Math.min(it.w, it.d) / 2
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    ell(c, it.w / 2 + Math.cos(a) * r * 0.75, it.d / 2 + Math.sin(a) * r * 0.75, r * 0.2, r * 0.16, i % 2 ? '#5cb46b' : '#a8c95b', px, '#2f7a43', 0.8)
  }
  ell(c, it.w / 2, it.d / 2, r * 0.5, r * 0.5, it.color ?? '#efe6d8', px)
  ceilingOutline(c, it.w / 2, it.d / 2, r, r, px)
}

/** Built from z=0 (bottom of the trailing vines) up to h (the ceiling hook). */
function buildHangingPlanter(it: FloorItem): Box[] {
  const s = Math.min(it.w, it.d)
  const potZ = it.h * 0.25
  const potH = Math.min(18, it.h * 0.2)
  const boxes: Box[] = [
    cyl(it.w / 2, it.d / 2, it.h - 2, 4, 4, 2, '#8a7a60'),
    blob(it.w / 2, it.d / 2, potZ + potH / 2, s * 0.5, s * 0.5, potH, it.color ?? '#efe6d8'),
    blob(it.w / 2, it.d / 2, potZ + potH, s * 0.6, s * 0.6, potH * 0.6, '#4fa35e'),
  ]
  // four ropes meeting at the hook
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const len = it.h - potZ - potH / 2
    const spread = s * 0.22
    const tilt = (Math.atan2(spread, len) * 180) / Math.PI
    boxes.push({ x: it.w / 2 + Math.cos(a) * spread * 0.5, y: it.d / 2 + Math.sin(a) * spread * 0.5, z: potZ + potH / 2 + len / 2, w: 0.6, d: 0.6, h: len, color: '#e8dcc8', turn: (a * 180) / Math.PI, tilt: -tilt, plain: true })
  }
  // trailing vines below the pot
  for (let v = 0; v < 6; v++) {
    const a = (v / 6) * Math.PI * 2
    for (let k = 0; k < 4; k++) boxes.push(blob(it.w / 2 + Math.cos(a) * s * 0.28, it.d / 2 + Math.sin(a) * s * 0.28, potZ - k * (potZ / 4), s * 0.12, s * 0.12, s * 0.09, k % 2 ? '#5cb46b' : '#a8c95b'))
  }
  return boxes
}

const plant = (label: string, en: string, color: string, defaults: FloorDef['defaults'], draw2D: FloorDef['draw2D'], build3D: FloorDef['build3D']): FloorDef => ({
  mount: 'floor',
  layer: 'decor',
  label,
  en,
  category: 'plant',
  color,
  defaults,
  min: { w: 10, d: 10, h: 10 },
  max: { w: 150, d: 150, h: 260 },
  draw2D,
  build3D,
})

export const PLANT_DEFS = {
  monstera: plant('Cây trầu bà lá xẻ (Monstera)', 'Monstera', '#3f8f4f', { w: 75, d: 75, h: 110 }, drawMonstera, buildMonstera),
  fiddleLeafFig: plant('Cây bàng Singapore', 'Fiddle leaf fig', '#3f8f4f', { w: 55, d: 55, h: 170 }, drawFiddleLeafFig, buildFiddleLeafFig),
  snakePlant: plant('Cây lưỡi hổ', 'Snake plant sansevieria', '#3d6b45', { w: 35, d: 35, h: 80 }, drawSnakePlant, buildSnakePlant),
  pothos: plant('Cây trầu bà (Pothos)', 'Pothos', '#5cb46b', { w: 30, d: 30, h: 35 }, drawPothos, buildPothos),
  oliveTree: plant('Cây ô liu', 'Olive tree', '#8a9a6b', { w: 60, d: 60, h: 160 }, drawOliveTree, buildOliveTree),
  bonsai: plant('Cây bonsai', 'Bonsai', '#3f7a4a', { w: 35, d: 22, h: 30 }, drawBonsai, buildBonsai),
  pampasGrass: plant('Cỏ lau khô (Pampas)', 'Dried pampas grass', '#e8d9b8', { w: 40, d: 40, h: 110 }, drawPampasGrass, buildPampasGrass),
  ceramicPot: plant('Chậu gốm', 'Ceramic pot', '#9fb8ad', { w: 30, d: 30, h: 32 }, drawCeramicPot, buildCeramicPot),
  terracottaPot: plant('Chậu đất nung', 'Terracotta pot', '#c46b43', { w: 30, d: 30, h: 28 }, drawTerracottaPot, buildTerracottaPot),
  plantStand: { ...plant('Kệ để cây', 'Plant stand', '#a8784f', { w: 40, d: 40, h: 60 }, drawPlantStand, buildPlantStand), layer: 'solid' },
  hangingPlanter: { ...plant('Chậu cây treo', 'Hanging planter macrame', '#efe6d8', { w: 40, d: 40, h: 90 }, drawHangingPlanter, buildHangingPlanter), layer: 'ceiling' },
} satisfies Record<string, FloorDef>
