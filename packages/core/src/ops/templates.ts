// SPDX-License-Identifier: AGPL-3.0-or-later

import type { FloorItem, FloorKind, Item, Room, RoomDoc, Wall, WallKind } from '../model/types'
import { FLOOR_DEFS, WALL_DEFS } from '../catalog/catalog'
import { newId } from '../geometry/random'

// Starter rooms, so a new user sees a furnished room instead of an empty one.
// Rotation: 0 = front faces the bottom wall, 90 = left, 180 = top, 270 = right.

type FloorSpec = { kind: FloorKind; x: number; y: number; rotation?: number; w?: number; d?: number }
type WallSpec = { kind: WallKind; wall: Wall; offset: number; w?: number }

export type RoomTemplate = {
  id: string
  label: string
  description: string
  room: Room
  floor: FloorSpec[]
  wall: WallSpec[]
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'student',
    label: 'Phòng trọ sinh viên',
    description: '4 × 3 m: giường đơn, bàn học dưới cửa sổ, tủ áo',
    room: { length: 400, width: 300, height: 300 },
    wall: [
      { kind: 'window', wall: 'top', offset: 180, w: 120 },
      { kind: 'door', wall: 'bottom', offset: 20 },
    ],
    floor: [
      { kind: 'bed', x: 60, y: 100, w: 120, d: 200 },
      { kind: 'desk', x: 240, y: 30 },
      { kind: 'chair', x: 240, y: 90, rotation: 180 },
      { kind: 'wardrobe', x: 370, y: 120, rotation: 90 },
      { kind: 'bookshelf', x: 60, y: 285, rotation: 180 },
      { kind: 'plant', x: 320, y: 25 },
      { kind: 'ceilingLight', x: 200, y: 150 },
    ],
  },
  {
    id: 'bedroom-work',
    label: 'Phòng ngủ có góc làm việc',
    description: '4 × 3,8 m: giường đôi, hai tab đầu giường, tủ áo, bàn viết',
    room: { length: 400, width: 380, height: 280 },
    wall: [
      { kind: 'window', wall: 'top', offset: 140, w: 120 },
      { kind: 'curtain', wall: 'top', offset: 120 },
      { kind: 'door', wall: 'bottom', offset: 20 },
    ],
    floor: [
      { kind: 'bed', x: 100, y: 140, rotation: 270 },
      { kind: 'nightstand', x: 20, y: 37.5, rotation: 270 },
      { kind: 'nightstand', x: 20, y: 242.5, rotation: 270 },
      { kind: 'tableLamp', x: 20, y: 37.5 },
      { kind: 'wardrobe', x: 370, y: 120, rotation: 90, w: 160 },
      { kind: 'writingDesk', x: 150, y: 355, rotation: 180 },
      { kind: 'chair', x: 150, y: 305 },
      { kind: 'ceilingLight', x: 200, y: 190 },
    ],
  },
  {
    id: 'studio',
    label: 'Căn studio',
    description: '5 × 4 m: giường đôi, tủ áo, bàn ăn hai ghế',
    room: { length: 500, width: 400, height: 300 },
    wall: [
      { kind: 'window', wall: 'top', offset: 40, w: 120 },
      { kind: 'window', wall: 'right', offset: 240, w: 100 },
      { kind: 'door', wall: 'bottom', offset: 30, w: 90 },
    ],
    floor: [
      { kind: 'bed', x: 290, y: 100 },
      { kind: 'nightstand', x: 187.5, y: 20 },
      { kind: 'wardrobe', x: 470, y: 150, rotation: 90 },
      { kind: 'diningTable', x: 110, y: 300, w: 100, d: 70 },
      { kind: 'chair', x: 110, y: 242 },
      { kind: 'chair', x: 110, y: 358, rotation: 180 },
      { kind: 'floorLamp', x: 30, y: 30 },
      { kind: 'plant', x: 30, y: 370 },
      { kind: 'ceilingLight', x: 250, y: 200 },
    ],
  },
]

/** A fresh copy of a template, with new item ids. */
export function templateDoc(template: RoomTemplate): RoomDoc {
  const { room } = template
  const floor = template.floor.map((s): FloorItem => {
    const def = FLOOR_DEFS[s.kind]
    return { id: newId(), mount: 'floor', kind: s.kind, x: s.x, y: s.y, w: s.w ?? def.defaults.w, d: s.d ?? def.defaults.d, h: def.defaults.h, rotation: s.rotation ?? 0 }
  })
  const wall = template.wall.map((s): Item => {
    const def = WALL_DEFS[s.kind]
    return {
      id: newId(),
      mount: 'wall',
      kind: s.kind,
      wall: s.wall,
      offset: s.offset,
      w: s.w ?? def.defaults.w,
      h: def.defaults.h,
      elevation: Math.min(def.defaults.elevation, room.height - def.defaults.h),
      ...(s.kind === 'door' ? { hinge: 'left' as const, opening: 'in' as const } : {}),
    }
  })
  return { room: { ...room }, items: [...wall, ...floor] }
}
