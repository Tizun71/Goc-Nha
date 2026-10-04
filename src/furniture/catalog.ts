import type { FloorItem, FloorKind, Kind, WallItem, WallKind } from '../model/types'
import * as d2 from './draw2d'
import * as d3 from './build3d'
import type { Box } from './build3d'
import { BED_DEFS } from './kinds/beds'
import { STORAGE_DEFS, STORAGE_WALL_DEFS } from './kinds/storage'
import { TABLE_DEFS } from './kinds/tables'
import { SEATING_DEFS } from './kinds/seating'
import { LIGHTING_DEFS, LIGHTING_WALL_DEFS } from './kinds/lighting'
import { RUG_DEFS, TEXTILE_DEFS } from './kinds/textiles'
import { PLANT_DEFS } from './kinds/plants'
import { WALL_DECOR_DEFS } from './kinds/wallDecor'
import { LIFESTYLE_DEFS, LIFESTYLE_WALL_DEFS } from './kinds/lifestyle'

type Size = { w: number; d: number; h: number }

export type Category =
  | 'bed'
  | 'storage'
  | 'table'
  | 'seating'
  | 'lighting'
  | 'textile'
  | 'rug'
  | 'plant'
  | 'wallDecor'
  | 'lifestyle'
  | 'structure'
  | 'appliance'

/** Catalog sections, in display order. */
export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'bed', label: 'Giường' },
  { id: 'storage', label: 'Tủ & lưu trữ' },
  { id: 'table', label: 'Bàn' },
  { id: 'seating', label: 'Ghế' },
  { id: 'lighting', label: 'Ánh sáng' },
  { id: 'textile', label: 'Chăn gối' },
  { id: 'rug', label: 'Thảm' },
  { id: 'plant', label: 'Cây & chậu' },
  { id: 'wallDecor', label: 'Trang trí tường' },
  { id: 'lifestyle', label: 'Góc đọc sách · cafe · chill' },
  { id: 'structure', label: 'Cửa & rèm' },
  { id: 'appliance', label: 'Thiết bị điện' },
]

/**
 * Where a floor item sits vertically:
 * - solid: ordinary furniture, checked for overlaps
 * - rug: lies on the floor under furniture
 * - decor: small things that stand on whatever is below them (a desk, a bed) or on the floor
 * - ceiling: hangs from the ceiling
 */
export type Layer = 'solid' | 'rug' | 'decor' | 'ceiling'

type Base = {
  label: string
  /** English name, used for search. */
  en: string
  category: Category
  /** Colour used when the item has none of its own; must match the drawing functions. */
  color: string
  min: Size
  max: Size
}

export type FloorDef = Base & {
  mount: 'floor'
  layer?: Layer
  defaults: Size
  draw2D: (c: CanvasRenderingContext2D, it: FloorItem, px: number) => void
  build3D: (it: FloorItem) => Box[]
}

export type WallDef = Base & {
  mount: 'wall'
  defaults: Size & { elevation: number }
  /** How far the item reaches into the room in plan view, for hit testing. */
  depth: (it: WallItem) => number
  draw2D: (c: CanvasRenderingContext2D, it: WallItem, px: number) => void
  build3D: (it: WallItem) => Box[]
}

export const FLOOR_DEFS: Record<FloorKind, FloorDef> = {
  wardrobe: {
    mount: 'floor',
    label: 'Tủ quần áo',
    category: 'storage',
    en: 'Wardrobe',
    color: '#c89b6d',
    defaults: { w: 120, d: 60, h: 200 },
    min: { w: 40, d: 35, h: 80 },
    max: { w: 400, d: 90, h: 280 },
    draw2D: d2.drawWardrobe,
    build3D: d3.buildWardrobe,
  },
  desk: {
    mount: 'floor',
    label: 'Bàn làm việc',
    category: 'table',
    en: 'Desk',
    color: '#e3c79f',
    defaults: { w: 120, d: 60, h: 75 },
    min: { w: 40, d: 30, h: 40 },
    max: { w: 300, d: 150, h: 120 },
    draw2D: d2.drawDesk,
    build3D: d3.buildDesk,
  },
  bookshelf: {
    mount: 'floor',
    label: 'Kệ sách',
    category: 'storage',
    en: 'Bookshelf',
    color: '#a9744f',
    defaults: { w: 80, d: 30, h: 180 },
    min: { w: 30, d: 15, h: 40 },
    max: { w: 400, d: 60, h: 280 },
    draw2D: d2.drawBookshelf,
    build3D: d3.buildBookshelf,
  },
  bed: {
    mount: 'floor',
    label: 'Giường',
    category: 'bed',
    en: 'Bed',
    color: '#7a5a43',
    defaults: { w: 160, d: 200, h: 45 },
    min: { w: 80, d: 150, h: 20 },
    max: { w: 220, d: 230, h: 80 },
    draw2D: d2.drawBed,
    build3D: d3.buildBed,
  },
  chair: {
    mount: 'floor',
    label: 'Ghế',
    category: 'seating',
    en: 'Chair',
    color: '#5a7d9a',
    defaults: { w: 45, d: 45, h: 90 },
    min: { w: 30, d: 30, h: 40 },
    max: { w: 100, d: 100, h: 130 },
    draw2D: d2.drawChair,
    build3D: d3.buildChair,
  },
  fishboneShelf: {
    mount: 'floor',
    label: 'Kệ sách xương cá',
    category: 'storage',
    en: 'Fishbone bookshelf',
    color: '#b07d4f',
    defaults: { w: 80, d: 25, h: 180 },
    min: { w: 40, d: 15, h: 80 },
    max: { w: 200, d: 45, h: 260 },
    draw2D: d2.drawFishboneShelf,
    build3D: d3.buildFishboneShelf,
  },
  safe: {
    mount: 'floor',
    label: 'Két sắt',
    category: 'storage',
    en: 'Safe',
    color: '#5f6b73',
    defaults: { w: 45, d: 45, h: 60 },
    min: { w: 25, d: 25, h: 25 },
    max: { w: 120, d: 90, h: 200 },
    draw2D: d2.drawSafe,
    build3D: d3.buildSafe,
  },
  fan: {
    mount: 'floor',
    label: 'Quạt đứng',
    category: 'appliance',
    en: 'Standing fan',
    color: '#e8eef2',
    defaults: { w: 40, d: 40, h: 120 },
    min: { w: 25, d: 25, h: 40 },
    max: { w: 70, d: 70, h: 160 },
    draw2D: d2.drawFan,
    build3D: d3.buildFan,
  },
  laundryBasket: {
    mount: 'floor',
    label: 'Giỏ quần áo',
    category: 'storage',
    en: 'Laundry basket',
    color: '#3f9fe0',
    defaults: { w: 40, d: 35, h: 55 },
    min: { w: 20, d: 20, h: 20 },
    max: { w: 80, d: 60, h: 90 },
    draw2D: d2.drawLaundryBasket,
    build3D: d3.buildLaundryBasket,
  },
  nightstand: {
    mount: 'floor',
    label: 'Tủ đầu giường',
    category: 'storage',
    en: 'Nightstand bedside table',
    color: '#a0714f',
    defaults: { w: 45, d: 40, h: 55 },
    min: { w: 30, d: 25, h: 30 },
    max: { w: 80, d: 60, h: 80 },
    draw2D: d2.drawNightstand,
    build3D: d3.buildNightstand,
  },
  rug: {
    mount: 'floor',
    label: 'Thảm khu vực',
    category: 'rug',
    en: 'Area rug',
    layer: 'rug',
    color: '#b5533c',
    defaults: { w: 160, d: 230, h: 1 },
    min: { w: 40, d: 40, h: 1 },
    max: { w: 500, d: 500, h: 3 },
    draw2D: d2.drawRug,
    build3D: d3.buildRug,
  },
  ceilingLight: {
    mount: 'floor',
    label: 'Đèn ốp trần',
    category: 'lighting',
    en: 'Ceiling light',
    layer: 'ceiling',
    color: '#ffd27a',
    defaults: { w: 40, d: 40, h: 10 },
    min: { w: 20, d: 20, h: 5 },
    max: { w: 120, d: 120, h: 30 },
    draw2D: d2.drawCeilingLight,
    build3D: d3.buildCeilingLight,
  },
  tableLamp: {
    mount: 'floor',
    label: 'Đèn bàn',
    category: 'lighting',
    en: 'Table lamp',
    layer: 'decor',
    color: '#f6e7c8',
    defaults: { w: 25, d: 25, h: 45 },
    min: { w: 12, d: 12, h: 20 },
    max: { w: 50, d: 50, h: 80 },
    draw2D: d2.drawTableLamp,
    build3D: d3.buildTableLamp,
  },
  plant: {
    mount: 'floor',
    label: 'Chậu cây xanh',
    category: 'plant',
    en: 'Potted plant',
    layer: 'decor',
    color: '#4fa35e',
    defaults: { w: 40, d: 40, h: 90 },
    min: { w: 12, d: 12, h: 15 },
    max: { w: 120, d: 120, h: 220 },
    draw2D: d2.drawPlant,
    build3D: d3.buildPlant,
  },
  ...BED_DEFS,
  ...STORAGE_DEFS,
  ...TABLE_DEFS,
  ...SEATING_DEFS,
  ...LIGHTING_DEFS,
  ...TEXTILE_DEFS,
  ...RUG_DEFS,
  ...PLANT_DEFS,
  ...LIFESTYLE_DEFS,
}

export const WALL_DEFS: Record<WallKind, WallDef> = {
  door: {
    mount: 'wall',
    label: 'Cửa đơn',
    category: 'structure',
    en: 'Door',
    color: '#9c6b43',
    defaults: { w: 80, d: 0, h: 210, elevation: 0 },
    min: { w: 60, d: 0, h: 180 },
    max: { w: 120, d: 0, h: 260 },
    depth: (it) => (it.opening === 'out' ? 10 : it.w),
    draw2D: d2.drawDoor,
    build3D: d3.buildDoor,
  },
  window: {
    mount: 'wall',
    label: 'Cửa sổ',
    category: 'structure',
    en: 'Window',
    color: '#cfe8f5',
    defaults: { w: 120, d: 0, h: 100, elevation: 90 },
    min: { w: 30, d: 0, h: 30 },
    max: { w: 400, d: 0, h: 250 },
    depth: () => 6,
    draw2D: d2.drawWindow,
    build3D: d3.buildWindow,
  },
  curtain: {
    mount: 'wall',
    label: 'Rèm',
    category: 'structure',
    en: 'Curtain',
    color: '#d9826a',
    defaults: { w: 160, d: 0, h: 200, elevation: 40 },
    min: { w: 30, d: 0, h: 50 },
    max: { w: 500, d: 0, h: 300 },
    depth: () => 14,
    draw2D: d2.drawCurtain,
    build3D: d3.buildCurtain,
  },
  wallHook: {
    mount: 'wall',
    label: 'Móc treo tường',
    category: 'storage',
    en: 'Wall hook',
    color: '#a9744f',
    defaults: { w: 40, d: 0, h: 6, elevation: 160 },
    min: { w: 10, d: 0, h: 3 },
    max: { w: 200, d: 0, h: 20 },
    depth: () => 9,
    draw2D: d2.drawWallHook,
    build3D: d3.buildWallHook,
  },
  airConditioner: {
    mount: 'wall',
    label: 'Máy lạnh',
    category: 'appliance',
    en: 'Air conditioner',
    color: '#f7f8fa',
    defaults: { w: 80, d: 0, h: 28, elevation: 210 },
    min: { w: 60, d: 0, h: 20 },
    max: { w: 120, d: 0, h: 40 },
    depth: () => 22,
    draw2D: d2.drawAirConditioner,
    build3D: d3.buildAirConditioner,
  },
  wallLamp: {
    mount: 'wall',
    label: 'Đèn gắn tường',
    category: 'lighting',
    en: 'Wall sconce',
    color: '#f3e3c3',
    defaults: { w: 20, d: 0, h: 25, elevation: 160 },
    min: { w: 10, d: 0, h: 10 },
    max: { w: 60, d: 0, h: 60 },
    depth: () => 18,
    draw2D: d2.drawWallLamp,
    build3D: d3.buildWallLamp,
  },
  ledStrip: {
    mount: 'wall',
    label: 'Đèn LED hắt',
    category: 'lighting',
    en: 'LED strip light',
    color: '#fde68a',
    defaults: { w: 200, d: 0, h: 2, elevation: 240 },
    min: { w: 20, d: 0, h: 1 },
    max: { w: 2000, d: 0, h: 5 },
    depth: () => 6,
    draw2D: d2.drawLedStrip,
    build3D: d3.buildLedStrip,
  },
  fluorescentLamp: {
    mount: 'wall',
    label: 'Đèn huỳnh quang',
    category: 'lighting',
    en: 'Fluorescent tube',
    color: '#e0f2fe',
    defaults: { w: 120, d: 0, h: 6, elevation: 220 },
    min: { w: 30, d: 0, h: 4 },
    max: { w: 160, d: 0, h: 12 },
    depth: () => 8,
    draw2D: d2.drawFluorescentLamp,
    build3D: d3.buildFluorescentLamp,
  },
  powerOutlet: {
    mount: 'wall',
    label: 'Ổ điện',
    category: 'appliance',
    en: 'Power outlet',
    color: '#f5f5f4',
    defaults: { w: 12, d: 0, h: 8, elevation: 30 },
    min: { w: 6, d: 0, h: 6 },
    max: { w: 40, d: 0, h: 15 },
    depth: () => 10,
    draw2D: d2.drawPowerOutlet,
    build3D: d3.buildPowerOutlet,
  },
  wallPainting: {
    mount: 'wall',
    label: 'Tranh treo tường',
    category: 'wallDecor',
    en: 'Wall art landscape',
    color: '#9ec5e8',
    defaults: { w: 60, d: 0, h: 40, elevation: 140 },
    min: { w: 15, d: 0, h: 15 },
    max: { w: 300, d: 0, h: 200 },
    depth: () => 5,
    draw2D: d2.drawWallPainting,
    build3D: d3.buildWallPainting,
  },
  wallFan: {
    mount: 'wall',
    label: 'Quạt treo tường',
    category: 'appliance',
    en: 'Wall fan',
    color: '#e5e7eb',
    defaults: { w: 45, d: 0, h: 45, elevation: 190 },
    min: { w: 30, d: 0, h: 30 },
    max: { w: 70, d: 0, h: 70 },
    depth: () => 26,
    draw2D: d2.drawWallFan,
    build3D: d3.buildWallFan,
  },
  ...STORAGE_WALL_DEFS,
  ...LIGHTING_WALL_DEFS,
  ...WALL_DECOR_DEFS,
  ...LIFESTYLE_WALL_DEFS,
}

export function isWallKind(kind: Kind): kind is WallKind {
  return kind in WALL_DEFS
}

export function defOf(kind: Kind): FloorDef | WallDef {
  return isWallKind(kind) ? WALL_DEFS[kind] : FLOOR_DEFS[kind]
}
