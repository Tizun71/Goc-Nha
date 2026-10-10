// SPDX-License-Identifier: AGPL-3.0-or-later

import type { FloorItem, FloorKind, Item, Room } from '../model/types'
import { floorCorners, rotate, type Vec } from '../geometry/geometry'
import { FLOOR_DEFS } from '../catalog/catalog'
import { isSolid } from '../model/layers'

/**
 * Free floor that an item needs in front of it (its local +y side) to be usable:
 * doors that swing open, drawers that pull out, a chair that slides back.
 */
export const FRONT_CLEARANCE: Partial<Record<FloorKind, { cm: number; reason: string }>> = {
  wardrobe: { cm: 60, reason: 'mở cửa tủ' },
  armoire: { cm: 60, reason: 'mở cửa tủ' },
  cabinet: { cm: 50, reason: 'mở cửa tủ' },
  chestOfDrawers: { cm: 50, reason: 'kéo ngăn kéo' },
  desk: { cm: 70, reason: 'kéo ghế ra ngồi' },
  writingDesk: { cm: 70, reason: 'kéo ghế ra ngồi' },
}

const EPS = 0.5

/** Polygon of the clearance zone in front of an item, in room coordinates, or null if it needs none. */
export function clearanceZone(item: FloorItem): Vec[] | null {
  const need = FRONT_CLEARANCE[item.kind]
  if (!need) return null
  const hw = item.w / 2
  const front = item.d / 2
  return [
    { x: -hw, y: front },
    { x: hw, y: front },
    { x: hw, y: front + need.cm },
    { x: -hw, y: front + need.cm },
  ].map((p) => {
    const r = rotate(p, item.rotation)
    return { x: r.x + item.x, y: r.y + item.y }
  })
}

/**
 * Message for an item whose clearance zone runs into a wall or other furniture, or null if it is clear.
 * Seating may stand in the zone: a chair belongs in front of a desk.
 */
export function clearanceProblem(item: FloorItem, items: Item[], room: Room, overlap: (a: Vec[], b: Vec[]) => boolean): string | null {
  const zone = clearanceZone(item)
  if (!zone) return null
  const blockedByWall = zone.some((p) => p.x < -EPS || p.y < -EPS || p.x > room.length + EPS || p.y > room.width + EPS)
  const blockedByItem = items.some(
    (o) => o.id !== item.id && isSolid(o) && FLOOR_DEFS[o.kind].category !== 'seating' && overlap(zone, floorCorners(o)),
  )
  if (!blockedByWall && !blockedByItem) return null
  const need = FRONT_CLEARANCE[item.kind]!
  return `Thiếu chỗ phía trước (cần ${need.cm} cm để ${need.reason})`
}
