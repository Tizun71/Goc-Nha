// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Room, Wall } from '../model/types'

// Screen angles are degrees clockwise from "up" on the plan. Bearings are compass degrees (0 = north, 90 = east).
// room.north is the screen angle north points to: 0 means north is at the top of the plan.

export const DIRECTIONS = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'] as const
export const SHORT = ['B', 'ĐB', 'Đ', 'ĐN', 'N', 'TN', 'T', 'TB'] as const

const norm = (deg: number) => ((Math.round(deg) % 360) + 360) % 360

export function northOf(room: Room) {
  return room.north ?? 0
}

export function bearingOf(screenAngle: number, north: number) {
  return norm(screenAngle - north)
}

/** Closest of the 8 compass directions, e.g. 100° → "Đông". */
export function directionName(bearing: number) {
  return DIRECTIONS[Math.round(norm(bearing) / 45) % 8]
}

export function directionShort(bearing: number) {
  return SHORT[Math.round(norm(bearing) / 45) % 8]
}

const WALL_OUTWARD: Record<Wall, number> = { top: 0, right: 90, bottom: 180, left: 270 }

/** Bearing a wall faces when looking out of the room through it (how "hướng cửa" is read). */
export function wallBearing(wall: Wall, north: number) {
  return bearingOf(WALL_OUTWARD[wall], north)
}

/** Bearing of a floor item's back (local -y) side, e.g. where the head of a bed points. */
export function backBearing(rotation: number, north: number) {
  return bearingOf(rotation, north)
}

/** Bearing of a floor item's front (local +y) side. */
export function frontBearing(rotation: number, north: number) {
  return bearingOf(rotation + 180, north)
}

/** The value for room.north that makes the top wall face `bearing`. */
export function northForTopWall(bearing: number) {
  return norm(-bearing)
}
