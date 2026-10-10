// SPDX-License-Identifier: AGPL-3.0-or-later

import type { FloorItem, Item, Room, WallItem } from '../model/types'
import { doorSwingPolygon, floorCorners, type Vec } from '../geometry/geometry'
import { isSolid, layerOf, supportOf } from '../model/layers'
import { clearanceProblem } from './clearance'

const EPS = 0.5 // cm of overlap tolerated, so items placed flush are not flagged

/** Separating axis test for two convex polygons. */
export function polygonsOverlap(a: Vec[], b: Vec[]): boolean {
  for (const poly of [a, b]) {
    for (let i = 0; i < poly.length; i++) {
      const p1 = poly[i]
      const p2 = poly[(i + 1) % poly.length]
      const nx = p2.y - p1.y
      const ny = p1.x - p2.x
      const len = Math.hypot(nx, ny)
      if (len === 0) continue
      const project = (pts: Vec[]) => {
        let min = Infinity
        let max = -Infinity
        for (const p of pts) {
          const v = (p.x * nx + p.y * ny) / len
          min = Math.min(min, v)
          max = Math.max(max, v)
        }
        return { min, max }
      }
      const pa = project(a)
      const pb = project(b)
      if (pa.max - EPS <= pb.min || pb.max - EPS <= pa.min) return false
    }
  }
  return true
}

export function isOutOfRoom(item: FloorItem, room: Room) {
  return floorCorners(item).some((p) => p.x < -EPS || p.y < -EPS || p.x > room.length + EPS || p.y > room.width + EPS)
}

export type Issues = Map<string, string[]>

/** Problems per item id: overlaps, items outside the room, items above the ceiling, blocked door swings and missing front clearance. */
export function findIssues(items: Item[], room: Room): Issues {
  const issues: Issues = new Map()
  const add = (id: string, msg: string) => {
    const list = issues.get(id) ?? []
    if (!list.includes(msg)) list.push(msg)
    issues.set(id, list)
  }
  for (const it of items) if (it.mount === 'floor' && isOutOfRoom(it, room)) add(it.id, 'Nằm ngoài phòng')

  // ceiling lights hang from the ceiling; decor stands on top of the item below it
  for (const it of items) {
    if (it.mount !== 'floor' || layerOf(it) === 'ceiling') continue
    const top = (layerOf(it) === 'decor' ? (supportOf(it, items)?.h ?? 0) : 0) + it.h
    if (top > room.height + EPS) add(it.id, `Cao hơn trần (${Math.round(top)} cm, trần ${room.height} cm)`)
  }

  // rugs, decor and ceiling lights do not collide with furniture
  const floor = items.filter(isSolid)
  const polys = new Map(floor.map((it) => [it.id, floorCorners(it)]))

  for (let i = 0; i < floor.length; i++)
    for (let j = i + 1; j < floor.length; j++)
      if (polygonsOverlap(polys.get(floor[i].id)!, polys.get(floor[j].id)!)) {
        add(floor[i].id, 'Chồng lên đồ khác')
        add(floor[j].id, 'Chồng lên đồ khác')
      }

  const doors = items.filter((it): it is WallItem => it.kind === 'door')
  for (const door of doors) {
    const swing = doorSwingPolygon(room, door)
    if (!swing) continue
    for (const it of floor)
      if (polygonsOverlap(swing, polys.get(it.id)!)) {
        add(door.id, 'Cửa mở bị vướng')
        add(it.id, 'Chắn đường mở cửa')
      }
  }

  for (const it of floor) {
    const problem = clearanceProblem(it, floor, room, polygonsOverlap)
    if (problem) add(it.id, problem)
  }
  return issues
}
