// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import { findIssues, polygonsOverlap } from './collision'
import type { FloorItem, Room, WallItem } from '../model/types'
import { doorSwingPolygon, floorCorners } from '../geometry/geometry'

const room: Room = { length: 400, width: 300, height: 270 }
const floor = (id: string, x: number, y: number, w = 100, d = 50, rotation = 0): FloorItem => ({
  id,
  mount: 'floor',
  kind: 'desk',
  x,
  y,
  w,
  d,
  h: 75,
  rotation,
})

describe('collision', () => {
  it('detects overlapping and flush items', () => {
    expect(polygonsOverlap(floorCorners(floor('a', 100, 100)), floorCorners(floor('b', 150, 100)))).toBe(true)
    // flush edges touch but do not overlap
    expect(polygonsOverlap(floorCorners(floor('a', 100, 100)), floorCorners(floor('b', 200, 100)))).toBe(false)
  })

  it('handles rotated items', () => {
    // a 100x20 bar rotated 90° is 20 wide, so it clears an item 30 cm away
    expect(polygonsOverlap(floorCorners(floor('a', 100, 100, 100, 20, 90)), floorCorners(floor('b', 160, 100, 60, 60)))).toBe(false)
    expect(polygonsOverlap(floorCorners(floor('a', 100, 100, 100, 20, 0)), floorCorners(floor('b', 160, 100, 60, 60)))).toBe(true)
  })

  it('flags items outside the room', () => {
    const issues = findIssues([floor('a', 20, 100)], room)
    expect(issues.get('a')).toContain('Nằm ngoài phòng')
  })

  it('flags furniture in a door swing', () => {
    const door: WallItem = { id: 'door', mount: 'wall', kind: 'door', wall: 'top', offset: 50, w: 80, h: 210, elevation: 0, hinge: 'left', opening: 'in' }
    const swing = doorSwingPolygon(room, door)!
    expect(swing[0]).toEqual({ x: 50, y: 0 })
    const issues = findIssues([door, floor('chair', 90, 40, 40, 40)], room)
    expect(issues.get('door')).toContain('Cửa mở bị vướng')
    expect(findIssues([door, floor('chair', 300, 200, 40, 40)], room).size).toBe(0)
    expect(findIssues([{ ...door, opening: 'out' }, floor('chair', 90, 40, 40, 40)], room).size).toBe(0)
  })
})
