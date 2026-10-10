// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import type { FloorItem, FloorKind, Room } from '../model/types'
import { clearanceZone } from './clearance'
import { findIssues } from './collision'

const room: Room = { length: 400, width: 300, height: 270 }
const item = (id: string, kind: FloorKind, x: number, y: number, w: number, d: number, rotation = 0): FloorItem => ({
  id,
  mount: 'floor',
  kind,
  x,
  y,
  w,
  d,
  h: 80,
  rotation,
})
const clearanceIssue = (id: string, items: FloorItem[]) => (findIssues(items, room).get(id) ?? []).find((m) => m.startsWith('Thiếu chỗ'))

describe('front clearance', () => {
  it('builds the zone on the front side, following rotation', () => {
    // wardrobe against the top wall, front facing down: zone from y=60 to y=120
    const zone = clearanceZone(item('w', 'wardrobe', 100, 30, 120, 60))!
    expect(Math.min(...zone.map((p) => p.y))).toBeCloseTo(60)
    expect(Math.max(...zone.map((p) => p.y))).toBeCloseTo(120)
    // turned 90° clockwise, the front faces left
    const turned = clearanceZone(item('w', 'wardrobe', 200, 150, 120, 60, 90))!
    expect(Math.min(...turned.map((p) => p.x))).toBeCloseTo(110)
  })

  it('needs no zone for items without doors or drawers', () => {
    expect(clearanceZone(item('b', 'bed', 100, 100, 160, 200))).toBeNull()
  })

  it('flags a wardrobe whose doors open into a bed', () => {
    const wardrobe = item('w', 'wardrobe', 100, 30, 120, 60)
    expect(clearanceIssue('w', [wardrobe])).toBeUndefined()
    const bed = item('b', 'bed', 100, 150, 160, 100)
    expect(clearanceIssue('w', [wardrobe, bed])).toContain('60 cm')
  })

  it('flags a wardrobe facing a wall', () => {
    expect(clearanceIssue('w', [item('w', 'wardrobe', 100, 30, 120, 60, 180)])).toBeDefined()
  })

  it('lets a chair stand in front of a desk', () => {
    const desk = item('d', 'desk', 100, 25, 100, 50)
    const chair = item('c', 'chair', 100, 80, 50, 50)
    expect(clearanceIssue('d', [desk, chair])).toBeUndefined()
  })
})
