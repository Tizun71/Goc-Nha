import type { FloorItem, WallItem } from '../../model/types'
import type { FloorDef, WallDef } from '../catalog'
import { seededRandom } from '../../lib/random'
import { BOOK_COLORS, b, box, cyl, dot, ell, legs4, line, pick, shade, type Box } from './kit'

type C = CanvasRenderingContext2D
const MUGS = ['#ffffff', '#e9c46a', '#8ab17d', '#d98f6f', '#6d8ea0']

// ---------- Book stack ----------

function drawBookStack(c: C, it: FloorItem, px: number) {
  const rand = seededRandom(it.id)
  for (let i = 0; i < 4; i++) {
    c.save()
    c.translate(it.w / 2, it.d / 2)
    c.rotate((rand() - 0.5) * 0.3)
    box(c, -it.w / 2 + i, -it.d / 2 + i, it.w - 2 * i, it.d - 2 * i, pick(rand, BOOK_COLORS), px, 0.5)
    c.restore()
  }
  line(c, it.w * 0.2, it.d / 2, it.w * 0.8, it.d / 2, px, 0.8, '#f4ede1')
}

function buildBookStack(it: FloorItem): Box[] {
  const rand = seededRandom(it.id)
  const n = Math.max(2, Math.round(it.h / 3.5))
  const t = it.h / n
  const boxes: Box[] = []
  for (let i = 0; i < n; i++) {
    const k = 1 - rand() * 0.15
    boxes.push({ x: it.w / 2, y: it.d / 2, z: i * t + t / 2, w: it.w * k, d: it.d * k, h: t * 0.95, color: pick(rand, BOOK_COLORS), turn: (rand() - 0.5) * 16 })
  }
  return boxes
}

// ---------- Coffee station: cabinet with machine, grinder and mugs ----------

function drawCoffeeStation(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#3d405b'
  box(c, 0, 0, w, d, '#d8c4a5', px, 1)
  box(c, w * 0.08, d * 0.15, w * 0.32, d * 0.6, '#c0c0c0', px, 2) // espresso machine
  box(c, w * 0.12, d * 0.2, w * 0.24, d * 0.25, '#2b2b2b', px, 1)
  ell(c, w * 0.5, d * 0.4, w * 0.06, w * 0.06, '#2b2b2b', px) // grinder
  for (let i = 0; i < 3; i++) ell(c, w * (0.65 + i * 0.1), d * 0.5, 3.5, 3.5, MUGS[i], px)
  box(c, 0, d - 3, w, 3, color, px, 0.5)
}

function buildCoffeeStation(it: FloorItem): Box[] {
  const color = it.color ?? '#3d405b'
  const top = it.h
  const boxes: Box[] = [
    b(0, 2, 0, it.w, it.d - 2, top - 3, color),
    b(0, 0, top - 3, it.w, it.d, 3, '#d8c4a5'),
    b(it.w * 0.05, it.d - 1, 8, it.w * 0.42, 1, top - 16, shade(color, 0.08)),
    b(it.w * 0.53, it.d - 1, 8, it.w * 0.42, 1, top - 16, shade(color, 0.08)),
    // machine body, group head and drip tray
    b(it.w * 0.08, it.d * 0.15, top, it.w * 0.32, it.d * 0.6, 32, '#c0c0c0'),
    b(it.w * 0.12, it.d * 0.75, top + 12, it.w * 0.24, 4, 6, '#2b2b2b'),
    b(it.w * 0.1, it.d * 0.75, top, it.w * 0.28, it.d * 0.2, 2, '#2b2b2b'),
    cyl(it.w * 0.5, it.d * 0.4, top, it.w * 0.1, it.w * 0.1, 26, '#2b2b2b', { taper: 1.3 }),
  ]
  for (let i = 0; i < 3; i++) boxes.push(cyl(it.w * (0.65 + i * 0.1), it.d * 0.5, top, 7, 7, 9, MUGS[i]))
  return boxes
}

// ---------- Coffee cart: three-tier rolling cart ----------

function drawCoffeeCart(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#1f2937'
  box(c, 0, 0, w, d, '#e5e7eb', px, 4, color)
  box(c, 2, 2, w - 4, d - 4, '#f3f4f6', px, 3, shade(color, 0.4))
  ell(c, w * 0.3, d * 0.5, 4, 4, '#ffffff', px)
  ell(c, w * 0.55, d * 0.5, 4, 4, '#d98f6f', px)
  box(c, w * 0.7, d * 0.3, w * 0.18, d * 0.4, '#8b5a3c', px, 1)
}

function buildCoffeeCart(it: FloorItem): Box[] {
  const color = it.color ?? '#1f2937'
  const boxes: Box[] = [...legs4(it.w, it.d, it.h - 6, 2, 0, color, 6)]
  for (const [x, y] of [
    [3, 3],
    [it.w - 3, 3],
    [3, it.d - 3],
    [it.w - 3, it.d - 3],
  ])
    boxes.push({ x, y, z: 3, w: 6, d: 2, h: 6, color: '#111827', cylinder: 'y' })
  for (const f of [0.12, 0.5, 0.95]) {
    const z = 6 + (it.h - 9) * f
    boxes.push(b(0, 0, z, it.w, it.d, 1.5, '#e5e7eb'))
    boxes.push(b(0, 0, z + 1.5, it.w, 1, 4, '#d1d5db'))
    boxes.push(b(0, it.d - 1, z + 1.5, it.w, 1, 4, '#d1d5db'))
  }
  const top = 6 + (it.h - 9) * 0.95 + 1.5
  boxes.push(cyl(it.w * 0.3, it.d * 0.5, top, 8, 8, 9, '#ffffff'))
  boxes.push(cyl(it.w * 0.55, it.d * 0.5, top, 8, 8, 9, '#d98f6f'))
  boxes.push(b(it.w * 0.7, it.d * 0.3, top, it.w * 0.18, it.d * 0.4, 14, '#8b5a3c'))
  return boxes
}

// ---------- Mug shelf (wall): a plank with mugs on top and hanging below ----------

function drawMugShelf(c: C, it: WallItem, px: number) {
  box(c, 0, 0, it.w, 15, it.color ?? '#b98a5e', px, 1)
  const n = Math.max(2, Math.floor(it.w / 12))
  for (let i = 0; i < n; i++) ell(c, (it.w * (i + 0.5)) / n, 8, 3.5, 3.5, MUGS[i % MUGS.length], px)
}

function buildMugShelf(it: WallItem): Box[] {
  const z = it.elevation + it.h - 3
  const n = Math.max(2, Math.floor(it.w / 12))
  const boxes: Box[] = [b(0, 0, z, it.w, 15, 3, it.color ?? '#b98a5e')]
  for (let i = 0; i < n; i++) {
    const x = (it.w * (i + 0.5)) / n
    boxes.push(cyl(x, 8, z + 3, 8, 8, 9, MUGS[i % MUGS.length]))
    // hooks and hanging mugs under the shelf
    boxes.push(b(x - 0.4, 10, z - 4, 0.8, 0.8, 4, '#6b6b6b', { plain: true }))
    boxes.push(cyl(x, 10, z - 13, 8, 8, 9, MUGS[(i + 2) % MUGS.length]))
  }
  return boxes
}

// ---------- Espresso machine (stands on a counter) ----------

function drawEspressoMachine(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  box(c, 0, 0, w, d, it.color ?? '#c0c0c0', px, 2)
  box(c, w * 0.15, d * 0.1, w * 0.7, d * 0.35, '#2b2b2b', px, 1)
  ell(c, w * 0.5, d * 0.75, w * 0.12, w * 0.12, '#ffffff', px)
}

function buildEspressoMachine(it: FloorItem): Box[] {
  const color = it.color ?? '#c0c0c0'
  return [
    b(0, 0, 0, it.w, it.d * 0.7, it.h, color),
    b(it.w * 0.1, it.d * 0.7, it.h * 0.55, it.w * 0.8, it.d * 0.25, it.h * 0.25, color),
    b(it.w * 0.15, it.d * 0.7, 0, it.w * 0.7, it.d * 0.3, 2, '#2b2b2b'),
    cyl(it.w * 0.5, it.d * 0.82, it.h * 0.45, it.w * 0.18, it.w * 0.18, it.h * 0.1, '#2b2b2b'),
    b(it.w * 0.45, it.d * 0.82, it.h * 0.47, it.w * 0.4, 2, 2, '#2b2b2b'),
    cyl(it.w * 0.5, it.d * 0.82, 2, it.w * 0.2, it.w * 0.2, it.h * 0.18, '#ffffff'),
    b(it.w * 0.15, it.d * 0.1, it.h, it.w * 0.7, it.d * 0.4, 1, '#2b2b2b', { plain: true }),
  ]
}

// ---------- Record player ----------

function drawRecordPlayer(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#a26b45'
  box(c, 0, 0, w, d, color, px, 2)
  const r = Math.min(w * 0.36, d * 0.42)
  ell(c, w * 0.42, d / 2, r, r, '#161616', px)
  for (let k = 0.85; k > 0.4; k -= 0.15) ell(c, w * 0.42, d / 2, r * k, r * k, 'transparent', px, '#333', 0.5)
  ell(c, w * 0.42, d / 2, r * 0.3, r * 0.3, '#d98f6f', px, null)
  dot(c, w * 0.85, d * 0.2, 2.2, '#c0c0c0')
  line(c, w * 0.85, d * 0.2, w * 0.6, d * 0.62, px, 1.5, '#c0c0c0')
}

function buildRecordPlayer(it: FloorItem): Box[] {
  const color = it.color ?? '#a26b45'
  const base = it.h * 0.6
  const r = Math.min(it.w * 0.36, it.d * 0.42) * 2
  return [
    b(0, 0, 0, it.w, it.d, base, color),
    cyl(it.w * 0.42, it.d / 2, base, r, r, 1.5, '#2b2b2b'),
    cyl(it.w * 0.42, it.d / 2, base + 1.5, r * 0.98, r * 0.98, 0.4, '#161616'),
    cyl(it.w * 0.42, it.d / 2, base + 1.9, r * 0.3, r * 0.3, 0.2, '#d98f6f', { plain: true }),
    cyl(it.w * 0.85, it.d * 0.2, base, 4, 4, 3, '#c0c0c0'),
    { x: it.w * 0.72, y: it.d * 0.42, z: base + 3, w: it.d * 0.45, d: 0.8, h: 0.8, color: '#c0c0c0', turn: 55 },
    b(0, 0, base, it.w, it.d, it.h - base, '#ffffff', { opacity: 0.18 }), // dust cover
  ]
}

// ---------- Vinyl shelf: cube cubbies full of records ----------

function drawVinylShelf(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#f5f0e8'
  const rand = seededRandom(it.id)
  box(c, 0, 0, w, d, color, px, 1)
  const cubes = Math.max(1, Math.round(w / 38))
  const cw = w / cubes
  for (let i = 0; i < cubes; i++) {
    if (i) line(c, i * cw, 0, i * cw, d, px, 1.2)
    for (let x = i * cw + 3; x < (i + 1) * cw - 3; x += 1.8) {
      c.fillStyle = rand() < 0.5 ? '#161616' : pick(rand, ['#d98f6f', '#e9c46a', '#6d8ea0', '#8ab17d'])
      c.fillRect(x, 3, 1.2, d - 6)
    }
  }
}

function buildVinylShelf(it: FloorItem): Box[] {
  const color = it.color ?? '#f5f0e8'
  const rand = seededRandom(it.id)
  const t = 2
  const cubes = Math.max(1, Math.round(it.w / 38))
  const rows = Math.max(1, Math.round(it.h / 38))
  const cw = it.w / cubes
  const rh = (it.h - t) / rows
  const boxes: Box[] = [b(0, 0, 0, it.w, it.d, t, color), b(0, 0, 0, it.w, 1, it.h, color)]
  for (let i = 0; i <= cubes; i++) boxes.push(b(Math.min(i * cw, it.w - t), 0, 0, t, it.d, it.h, color))
  for (let r = 1; r <= rows; r++) boxes.push(b(0, 0, Math.min(r * rh, it.h - t), it.w, it.d, t, color))
  for (let r = 0; r < rows; r++)
    for (let i = 0; i < cubes; i++)
      for (let x = i * cw + t + 1; x < (i + 1) * cw - 3; x += 2.2)
        boxes.push(b(x, 2, r * rh + t, 1, it.d - 4, rh - t - 3, rand() < 0.5 ? '#161616' : pick(rand, ['#d98f6f', '#e9c46a', '#6d8ea0', '#8ab17d']), { plain: true }))
  return boxes
}

// ---------- Speaker ----------

function drawSpeaker(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  box(c, 0, 0, w, d, it.color ?? '#3b2f2a', px, 2)
  box(c, 1, d - 3, w - 2, 3, '#1f1f1f', px, 1)
}

function buildSpeaker(it: FloorItem): Box[] {
  const color = it.color ?? '#3b2f2a'
  const woofer = Math.min(it.w * 0.75, it.h * 0.4)
  return [
    b(0, 0, 0, it.w, it.d - 1, it.h, color),
    b(1, it.d - 1, 1, it.w - 2, 1, it.h - 2, '#1f1f1f'),
    { x: it.w / 2, y: it.d + 0.2, z: it.h * 0.32, w: woofer, d: 0.6, h: woofer, color: '#3a3a3a', cylinder: 'y' },
    { x: it.w / 2, y: it.d + 0.4, z: it.h * 0.32, w: woofer * 0.3, d: 0.6, h: woofer * 0.3, color: '#555', cylinder: 'y', plain: true },
    { x: it.w / 2, y: it.d + 0.2, z: it.h * 0.75, w: woofer * 0.35, d: 0.6, h: woofer * 0.35, color: '#3a3a3a', cylinder: 'y' },
  ]
}

// ---------- Projector ----------

function drawProjector(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  box(c, 0, 0, w, d, it.color ?? '#f3f4f6', px, 3)
  ell(c, w * 0.7, d - 2, w * 0.14, 2.5, '#1f2937', px)
  for (let x = w * 0.12; x < w * 0.45; x += 3) line(c, x, d * 0.25, x, d * 0.75, px, 0.8, '#9ca3af')
}

function buildProjector(it: FloorItem): Box[] {
  return [
    b(0, 0, 1, it.w, it.d, it.h - 1, it.color ?? '#f3f4f6'),
    ...legs4(it.w, it.d, 1, 2, 2, '#9ca3af'),
    { x: it.w * 0.7, y: it.d + 0.5, z: it.h / 2 + 0.5, w: it.w * 0.28, d: 2, h: it.w * 0.28, color: '#1f2937', cylinder: 'y' },
    { x: it.w * 0.7, y: it.d + 1.6, z: it.h / 2 + 0.5, w: it.w * 0.18, d: 0.3, h: it.w * 0.18, color: '#bfe3ff', cylinder: 'y', glow: true },
  ]
}

const life = (label: string, en: string, color: string, layer: FloorDef['layer'], defaults: FloorDef['defaults'], min: FloorDef['min'], max: FloorDef['max'], draw2D: FloorDef['draw2D'], build3D: FloorDef['build3D']): FloorDef => ({
  mount: 'floor',
  layer,
  label,
  en,
  category: 'lifestyle',
  color,
  defaults,
  min,
  max,
  draw2D,
  build3D,
})

export const LIFESTYLE_DEFS = {
  bookStack: life('Chồng sách', 'Book stack', '#c0504d', 'decor', { w: 25, d: 18, h: 14 }, { w: 12, d: 10, h: 4 }, { w: 40, d: 30, h: 50 }, drawBookStack, buildBookStack),
  coffeeStation: life('Quầy cafe tại nhà', 'Coffee station', '#3d405b', 'solid', { w: 100, d: 45, h: 90 }, { w: 60, d: 35, h: 70 }, { w: 200, d: 65, h: 110 }, drawCoffeeStation, buildCoffeeStation),
  coffeeCart: life('Xe đẩy cafe', 'Coffee cart bar cart', '#1f2937', 'solid', { w: 60, d: 40, h: 80 }, { w: 40, d: 30, h: 50 }, { w: 100, d: 60, h: 100 }, drawCoffeeCart, buildCoffeeCart),
  espressoMachine: life('Máy pha espresso', 'Espresso machine', '#c0c0c0', 'decor', { w: 35, d: 30, h: 35 }, { w: 20, d: 20, h: 20 }, { w: 60, d: 50, h: 50 }, drawEspressoMachine, buildEspressoMachine),
  recordPlayer: life('Máy hát đĩa than', 'Record player turntable', '#a26b45', 'decor', { w: 45, d: 35, h: 14 }, { w: 30, d: 25, h: 8 }, { w: 60, d: 50, h: 25 }, drawRecordPlayer, buildRecordPlayer),
  vinylShelf: life('Kệ đĩa than', 'Vinyl shelf record storage', '#f5f0e8', 'solid', { w: 80, d: 40, h: 80 }, { w: 40, d: 30, h: 40 }, { w: 200, d: 50, h: 160 }, drawVinylShelf, buildVinylShelf),
  speaker: life('Loa', 'Speaker', '#3b2f2a', 'decor', { w: 20, d: 22, h: 32 }, { w: 10, d: 10, h: 15 }, { w: 45, d: 45, h: 120 }, drawSpeaker, buildSpeaker),
  projector: life('Máy chiếu', 'Projector', '#f3f4f6', 'decor', { w: 30, d: 24, h: 12 }, { w: 15, d: 15, h: 6 }, { w: 50, d: 40, h: 25 }, drawProjector, buildProjector),
} satisfies Record<string, FloorDef>

export const LIFESTYLE_WALL_DEFS = {
  mugShelf: {
    mount: 'wall',
    label: 'Kệ treo cốc',
    en: 'Mug shelf',
    category: 'lifestyle',
    color: '#b98a5e',
    defaults: { w: 60, d: 0, h: 25, elevation: 140 },
    min: { w: 25, d: 0, h: 15 },
    max: { w: 160, d: 0, h: 40 },
    depth: () => 15,
    draw2D: drawMugShelf,
    build3D: buildMugShelf,
  },
} satisfies Record<string, WallDef>
