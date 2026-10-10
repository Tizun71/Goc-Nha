// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import type { FloorItem, RoomDoc, WallItem } from '../model/types'
import { fitsThroughDoor, shoppingList, shoppingListText } from './shopping'

const chair = (id: string, w = 45): FloorItem => ({ id, mount: 'floor', kind: 'chair', x: 100, y: 100, w, d: 45, h: 90, rotation: 0 })
const wall = (id: string, kind: WallItem['kind']): WallItem => ({ id, mount: 'wall', kind, wall: 'top', offset: 50, w: 80, h: 120, elevation: 90 })

const doc: RoomDoc = {
  room: { length: 400, width: 300, height: 270 },
  items: [
    chair('c1'),
    chair('c2'),
    chair('c3', 50),
    { id: 'b', mount: 'floor', kind: 'bed', x: 200, y: 150, w: 160, d: 200, h: 45, rotation: 0 },
    wall('win', 'window'),
    { ...wall('door', 'door'), h: 210, elevation: 0 },
    wall('cur', 'curtain'),
  ],
}

describe('shopping list', () => {
  it('counts identical items together and keeps different sizes apart', () => {
    const chairs = shoppingList(doc).filter((l) => l.kind === 'chair')
    expect(chairs.map((l) => [l.count, l.size])).toEqual(
      expect.arrayContaining([
        [2, '45 × 45 × 90 cm'],
        [1, '50 × 45 × 90 cm'],
      ]),
    )
  })

  it('leaves out doors and windows but keeps curtains', () => {
    const kinds = shoppingList(doc).map((l) => l.kind)
    expect(kinds).not.toContain('door')
    expect(kinds).not.toContain('window')
    expect(kinds).toContain('curtain')
  })

  it('follows catalog order: beds before seating', () => {
    const kinds = shoppingList(doc).map((l) => l.kind)
    expect(kinds.indexOf('bed')).toBeLessThan(kinds.indexOf('chair'))
  })

  it('writes a text list with the room size', () => {
    const text = shoppingListText(doc)
    expect(text.split('\n')[0]).toContain('400 × 300 cm')
    expect(text).toContain('- 2 × ')
  })
})

describe('fits through the door', () => {
  const door = { w: 80, h: 210 }

  it('carries a wardrobe in upright or on its side', () => {
    expect(fitsThroughDoor({ w: 120, d: 60, h: 200 }, door)).toBe(true)
  })

  it('rejects an item deeper and taller than the opening allows', () => {
    expect(fitsThroughDoor({ w: 220, d: 100, h: 230 }, door)).toBe(false)
  })

  it('warns in the shopping list only for solid items that pass no door', () => {
    const big: FloorItem = { id: 'big', mount: 'floor', kind: 'armoire', x: 200, y: 150, w: 220, d: 100, h: 230, rotation: 0 }
    const lines = shoppingList({ ...doc, items: [...doc.items, big] })
    expect(lines.find((l) => l.kind === 'armoire')?.doorWarning).toContain('80 × 210 cm')
    expect(lines.find((l) => l.kind === 'bed')?.doorWarning).toBeUndefined()
  })

  it('does not warn when the room has no door', () => {
    const big: FloorItem = { id: 'big', mount: 'floor', kind: 'armoire', x: 200, y: 150, w: 220, d: 100, h: 230, rotation: 0 }
    expect(shoppingList({ room: doc.room, items: [big] })[0].doorWarning).toBeUndefined()
  })
})
