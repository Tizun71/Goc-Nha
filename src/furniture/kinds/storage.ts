import type { FloorItem, WallItem } from '../../model/types'
import type { FloorDef, WallDef } from '../catalog'
import { seededRandom } from '../../lib/random'
import { BOOK_COLORS, b, box, cyl, dot, ell, legs4, line, pick, shade, type Box } from './kit'

type C = CanvasRenderingContext2D

// ---------- Armoire: classic wardrobe with a crown, panelled doors and feet ----------

function drawArmoire(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#8b5a3c'
  box(c, -2, -1, w + 4, d + 2, shade(color, -0.2), px, 2) // crown overhang
  box(c, 2, 2, w - 4, d - 4, color, px, 2)
  box(c, 6, 6, w - 12, d - 14, shade(color, 0.08), px, 1, shade(color, -0.25))
  line(c, w / 2, d - 5, w / 2, d, px, 1.4)
  dot(c, w / 2 - 4, d - 1.5, 1.4, '#d4b483')
  dot(c, w / 2 + 4, d - 1.5, 1.4, '#d4b483')
}

function buildArmoire(it: FloorItem): Box[] {
  const color = it.color ?? '#8b5a3c'
  const foot = 10
  const crown = 10
  const body = it.h - foot - crown
  const dw = (it.w - 8) / 2
  const boxes: Box[] = [
    ...legs4(it.w, it.d, foot, 7, 2, shade(color, -0.3)),
    b(0, 0, foot, it.w, it.d - 2, body, color),
    b(-3, -1, foot + body, it.w + 6, it.d + 2, crown * 0.4, shade(color, -0.2)),
    b(-1, 0, foot + body + crown * 0.4, it.w + 2, it.d, crown * 0.6, color),
  ]
  for (let i = 0; i < 2; i++) {
    const x = 4 + i * dw
    boxes.push(b(x, it.d - 2, foot + 4, dw - 1, 1.5, body - 8, shade(color, 0.06)))
    boxes.push(b(x + 6, it.d - 0.5, foot + 12, dw - 13, 0.6, body * 0.42, shade(color, -0.12), { plain: true }))
    boxes.push(b(x + 6, it.d - 0.5, foot + body * 0.52, dw - 13, 0.6, body * 0.42, shade(color, -0.12), { plain: true }))
  }
  boxes.push(b(it.w / 2 - 5, it.d, foot + body * 0.48, 2, 1.5, 4, '#d4b483'))
  boxes.push(b(it.w / 2 + 3, it.d, foot + body * 0.48, 2, 1.5, 4, '#d4b483'))
  return boxes
}

// ---------- Chest of drawers ----------

function drawChestOfDrawers(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#d9c3a5'
  box(c, 0, 0, w, d, color, px, 2)
  box(c, 3, 3, w - 6, d - 9, shade(color, 0.06), px, 1, shade(color, -0.2))
  box(c, 1, d - 5, w - 2, 5, shade(color, -0.1), px, 1)
  for (const f of [0.3, 0.7]) line(c, w * f - 5, d - 1.2, w * f + 5, d - 1.2, px, 2.2, '#8a7356')
  // a small tray and frame on top
  box(c, w * 0.12, d * 0.25, w * 0.22, d * 0.35, '#efe6d8', px, 2)
  box(c, w * 0.62, d * 0.3, w * 0.18, 3, '#3b2f2a', px, 0.5)
}

function buildChestOfDrawers(it: FloorItem): Box[] {
  const color = it.color ?? '#d9c3a5'
  const leg = 10
  const body = it.h - leg
  const drawers = Math.max(3, Math.round(body / 22))
  const dh = (body - 4) / drawers
  const boxes: Box[] = [...legs4(it.w, it.d, leg, 4, 3, '#6b5440'), b(0, 0, leg, it.w, it.d - 1.5, body, color)]
  for (let i = 0; i < drawers; i++) {
    const z = leg + 2 + i * dh
    boxes.push(b(2, it.d - 1.5, z + 1, it.w - 4, 1.5, dh - 2, shade(color, 0.05)))
    for (const f of [0.3, 0.7]) boxes.push(b(it.w * f - 5, it.d, z + dh / 2 - 1, 10, 1.2, 2, '#8a7356', { plain: true }))
  }
  boxes.push(b(it.w * 0.62, it.d * 0.4, it.h, it.w * 0.18, 2, 22, '#3b2f2a'))
  return boxes
}

// ---------- Open shelving: slim frame with baskets, plants and books ----------

function drawOpenShelving(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#2f2f2f'
  const rand = seededRandom(it.id)
  box(c, 0, 0, w, d, '#e9dfcf', px, 0, shade(color, 0.3))
  for (const [x, y] of [
    [0, 0],
    [w - 3, 0],
    [0, d - 3],
    [w - 3, d - 3],
  ])
    box(c, x, y, 3, 3, color, px, 0, color)
  // things on the top shelf
  let x = 5
  while (x < w - 12) {
    const kind = rand()
    if (kind < 0.4) {
      box(c, x, d * 0.2, 14, d * 0.6, '#c8a46e', px, 2)
      x += 17
    } else if (kind < 0.7) {
      ell(c, x + 6, d / 2, 6, 6, '#c46b43', px)
      ell(c, x + 6, d / 2, 7, 4, '#4fa35e', px)
      x += 15
    } else {
      for (let i = 0; i < 5; i++) {
        c.fillStyle = pick(rand, BOOK_COLORS)
        c.fillRect(x + i * 2.4, d * 0.2, 2, d * 0.6)
      }
      x += 15
    }
  }
}

function buildOpenShelving(it: FloorItem): Box[] {
  const color = it.color ?? '#2f2f2f'
  const rand = seededRandom(it.id)
  const shelves = Math.max(3, Math.round(it.h / 45))
  const gap = (it.h - 4) / (shelves - 1)
  const boxes: Box[] = legs4(it.w, it.d, it.h, 2.5, 0, color)
  for (let i = 0; i < shelves; i++) {
    const z = Math.min(i * gap + 4, it.h - 2)
    boxes.push(b(0, 0, z, it.w, it.d, 2, '#d8c4a5'))
    if (i === shelves - 1) break
    let x = 4
    while (x < it.w - 14) {
      const k = rand()
      if (k < 0.35) {
        boxes.push(b(x, 3, z + 2, 16, it.d - 6, Math.min(16, gap * 0.5), '#c8a46e'))
        x += 19
      } else if (k < 0.65) {
        boxes.push(cyl(x + 6, it.d / 2, z + 2, 11, 11, 10, '#c46b43', { taper: 0.8 }))
        boxes.push({ x: x + 6, y: it.d / 2, z: z + 16, w: 16, d: 14, h: 12, color: '#4fa35e', ellipsoid: true })
        x += 16
      } else {
        for (let j = 0; j < 5; j++) boxes.push(b(x + j * 2.6, 4, z + 2, 2.2, it.d * 0.7, gap * (0.45 + rand() * 0.2), pick(rand, BOOK_COLORS), { plain: true }))
        x += 16
      }
    }
  }
  return boxes
}

// ---------- Cabinet: decorative sideboard on legs with cane doors ----------

function drawCabinet(c: C, it: FloorItem, px: number) {
  const { w, d } = it
  const color = it.color ?? '#a26b45'
  box(c, 0, 0, w, d, color, px, 2)
  box(c, 3, 3, w - 6, d - 9, shade(color, 0.08), px, 1, shade(color, -0.2))
  const doors = Math.max(2, Math.round(w / 45))
  const dw = w / doors
  box(c, 0, d - 4, w, 4, '#d8c39a', px, 1)
  for (let i = 1; i < doors; i++) line(c, i * dw, d - 4, i * dw, d, px, 1)
  // a vase and a lamp-shaped bowl on top
  ell(c, w * 0.2, d * 0.45, 5, 5, '#eae2d3', px)
  ell(c, w * 0.75, d * 0.45, 9, 6, '#6f8f7d', px)
}

function buildCabinet(it: FloorItem): Box[] {
  const color = it.color ?? '#a26b45'
  const leg = 15
  const body = it.h - leg
  const doors = Math.max(2, Math.round(it.w / 45))
  const dw = (it.w - 4) / doors
  const boxes: Box[] = [...legs4(it.w, it.d, leg, 3, 4, shade(color, -0.3)), b(0, 0, leg, it.w, it.d - 1.5, body, color)]
  for (let i = 0; i < doors; i++) {
    boxes.push(b(2 + i * dw + 0.5, it.d - 1.5, leg + 3, dw - 1, 1.5, body - 6, shade(color, 0.04)))
    // woven cane insert
    boxes.push(b(2 + i * dw + 5, it.d, leg + 8, dw - 10, 0.4, body - 16, '#d8c39a', { plain: true }))
  }
  boxes.push(cyl(it.w * 0.2, it.d * 0.45, it.h, 10, 10, 22, '#eae2d3', { taper: 0.7 }))
  boxes.push({ x: it.w * 0.75, y: it.d * 0.45, z: it.h + 4, w: 18, d: 12, h: 8, color: '#6f8f7d', ellipsoid: true })
  return boxes
}

// ---------- Floating shelf (wall): a plank with books, a plant and a frame ----------

function drawFloatingShelf(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#b98a5e'
  const rand = seededRandom(it.id)
  box(c, 0, 0, w, 22, color, px, 1)
  let x = 4
  for (let i = 0; i < 6 && x < w * 0.35; i++) {
    c.fillStyle = pick(rand, BOOK_COLORS)
    c.fillRect(x, 3, 2.4, 15)
    x += 2.8
  }
  ell(c, w * 0.6, 11, 5, 5, '#c46b43', px)
  ell(c, w * 0.6, 11, 7, 4.5, '#4fa35e', px)
  box(c, w * 0.8, 3, 10, 2, '#3b2f2a', px, 0.4)
}

function buildFloatingShelf(it: WallItem): Box[] {
  const color = it.color ?? '#b98a5e'
  const rand = seededRandom(it.id)
  const z = it.elevation
  const boxes: Box[] = [b(0, 0, z, it.w, 22, it.h, color)]
  let x = 4
  for (let i = 0; i < 6 && x < it.w * 0.35; i++) {
    boxes.push(b(x, 3, z + it.h, 2.4, 15, 16 + rand() * 6, pick(rand, BOOK_COLORS), { plain: true }))
    x += 2.8
  }
  boxes.push(cyl(it.w * 0.6, 11, z + it.h, 10, 10, 9, '#c46b43', { taper: 0.8 }))
  boxes.push({ x: it.w * 0.6, y: 11, z: z + it.h + 14, w: 15, d: 12, h: 12, color: '#4fa35e', ellipsoid: true })
  boxes.push(b(it.w * 0.8, 3, z + it.h, 10, 2, 13, '#3b2f2a', { tilt: -6 }))
  return boxes
}

// ---------- Rope shelf (wall): wooden planks hung on two ropes from one hook ----------

const ROPE = '#d9c3a0'
const ROPE_DEPTH = 20

/** Plank heights (bottom of each plank, absolute) and the height of the rope V above the top plank. */
function ropeShelfLayout(it: WallItem) {
  const t = 2.5
  const vH = Math.min(Math.max(it.w * 0.45, 15), it.h * 0.5)
  const span = Math.max(0, it.h - vH - t)
  const n = Math.max(2, Math.floor(span / 25) + 1)
  const planks = Array.from({ length: n }, (_, i) => it.elevation + (span * i) / (n - 1))
  return { t, vH, planks }
}

function drawRopeShelf(c: C, it: WallItem, px: number) {
  const { w } = it
  const color = it.color ?? '#c49a6c'
  const rand = seededRandom(it.id)
  box(c, 0, 0, w, ROPE_DEPTH, color, px, 1)
  // rope through each end of the plank, and the hook on the wall
  for (const x of [3, w - 3]) dot(c, x, ROPE_DEPTH / 2, 1.6, ROPE)
  line(c, w / 2, 0, w / 2, ROPE_DEPTH / 2, px, 1.5, '#3b2f2a')
  // what sits on the top plank
  ell(c, w * 0.35, ROPE_DEPTH / 2, 4.5, 4.5, '#c46b43', px)
  ell(c, w * 0.35, ROPE_DEPTH / 2, 6.5, 4, '#4fa35e', px)
  let x = w * 0.55
  for (let i = 0; i < 4 && x < w - 8; i++) {
    c.fillStyle = pick(rand, BOOK_COLORS)
    c.fillRect(x, 4, 2.4, 12)
    x += 2.8
  }
}

function buildRopeShelf(it: WallItem): Box[] {
  const color = it.color ?? '#c49a6c'
  const rand = seededRandom(it.id)
  const { t, vH, planks } = ropeShelfLayout(it)
  const y = ROPE_DEPTH / 2
  const top = planks[planks.length - 1] + t
  const hookZ = top + vH
  const boxes: Box[] = []
  // hook: a short arm out of the wall
  boxes.push(b(it.w / 2 - 1, 0, hookZ - 1, 2, y + 1, 2, '#3b2f2a'))
  for (const x of [3, it.w - 3]) {
    // straight rope through all planks, with a loose tail under the bottom one
    const z0 = planks[0] - 6
    boxes.push({ x, y, z: (z0 + top) / 2, w: 1.2, d: 1.2, h: top - z0, color: ROPE, plain: true })
    // rope up to the hook, as one side of the V
    const dx = x - it.w / 2
    const len = Math.hypot(dx, vH)
    boxes.push({ x: (x + it.w / 2) / 2, y, z: (top + hookZ) / 2, w: 1.2, d: 1.2, h: len, color: ROPE, plain: true, tilt: (Math.atan2(dx, vH) * 180) / Math.PI })
    // knots holding each plank
    for (const z of planks) boxes.push({ x, y, z: z - 1.2, w: 2.4, d: 2.4, h: 2.4, color: ROPE, ellipsoid: true, plain: true })
  }
  planks.forEach((z, i) => {
    boxes.push(b(0, 0, z, it.w, ROPE_DEPTH, t, color))
    const zTop = z + t
    const room = i < planks.length - 1 ? planks[i + 1] - zTop : vH
    if (room < 10 || it.w < 30) return
    // a pot plant or a few books on each plank
    if ((i + Math.floor(rand() * 2)) % 2 === 0) {
      const potH = Math.min(9, room * 0.4)
      boxes.push(cyl(it.w * 0.35, y, zTop, 9, 9, potH, '#c46b43', { taper: 0.8 }))
      boxes.push({ x: it.w * 0.35, y, z: zTop + potH + Math.min(6, room * 0.25), w: 13, d: 11, h: Math.min(11, room * 0.45), color: '#4fa35e', ellipsoid: true })
    } else {
      let x = it.w * 0.2
      for (let k = 0; k < 5 && x < it.w * 0.6; k++) {
        boxes.push(b(x, 4, zTop, 2.4, 12, Math.min(room - 2, 14 + rand() * 5), pick(rand, BOOK_COLORS), { plain: true }))
        x += 2.8
      }
    }
  })
  return boxes
}

export const STORAGE_DEFS = {
  armoire: {
    mount: 'floor',
    label: 'Tủ áo cổ điển',
    en: 'Armoire',
    category: 'storage',
    color: '#8b5a3c',
    defaults: { w: 110, d: 60, h: 200 },
    min: { w: 60, d: 40, h: 120 },
    max: { w: 220, d: 80, h: 260 },
    draw2D: drawArmoire,
    build3D: buildArmoire,
  },
  chestOfDrawers: {
    mount: 'floor',
    label: 'Tủ nhiều ngăn kéo',
    en: 'Chest of drawers',
    category: 'storage',
    color: '#d9c3a5',
    defaults: { w: 90, d: 45, h: 100 },
    min: { w: 40, d: 30, h: 50 },
    max: { w: 200, d: 65, h: 160 },
    draw2D: drawChestOfDrawers,
    build3D: buildChestOfDrawers,
  },
  openShelving: {
    mount: 'floor',
    label: 'Kệ mở',
    en: 'Open shelving',
    category: 'storage',
    color: '#2f2f2f',
    defaults: { w: 100, d: 35, h: 180 },
    min: { w: 40, d: 20, h: 60 },
    max: { w: 240, d: 60, h: 260 },
    draw2D: drawOpenShelving,
    build3D: buildOpenShelving,
  },
  cabinet: {
    mount: 'floor',
    label: 'Tủ trang trí',
    en: 'Cabinet sideboard',
    category: 'storage',
    color: '#a26b45',
    defaults: { w: 140, d: 45, h: 80 },
    min: { w: 60, d: 30, h: 50 },
    max: { w: 240, d: 60, h: 120 },
    draw2D: drawCabinet,
    build3D: buildCabinet,
  },
} satisfies Record<string, FloorDef>

export const STORAGE_WALL_DEFS = {
  floatingShelf: {
    mount: 'wall',
    label: 'Kệ treo tường',
    en: 'Floating shelf',
    category: 'storage',
    color: '#b98a5e',
    defaults: { w: 80, d: 0, h: 4, elevation: 150 },
    min: { w: 30, d: 0, h: 2 },
    max: { w: 240, d: 0, h: 8 },
    depth: () => 22,
    draw2D: drawFloatingShelf,
    build3D: buildFloatingShelf,
  },
  ropeShelf: {
    mount: 'wall',
    label: 'Kệ dây thừng',
    en: 'Rope shelf hanging',
    category: 'storage',
    color: '#c49a6c',
    defaults: { w: 60, d: 0, h: 90, elevation: 100 },
    min: { w: 30, d: 0, h: 40 },
    max: { w: 150, d: 0, h: 200 },
    depth: () => ROPE_DEPTH,
    draw2D: drawRopeShelf,
    build3D: buildRopeShelf,
  },
} satisfies Record<string, WallDef>
