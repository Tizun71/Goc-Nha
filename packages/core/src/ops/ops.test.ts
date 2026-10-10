// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import { applyOps, checkLayout, findFreeSpot } from './ops'
import type { FloorItem, RoomDoc, WallItem } from '../model/types'

const empty: RoomDoc = { room: { length: 400, width: 300, height: 270 }, items: [] }

describe('AI ops', () => {
  it('places a bed with its headboard against a wall', () => {
    const { doc } = applyOps(empty, [{ op: 'add', kind: 'bed', place: { type: 'wall', wall: 'right', align: 'center' } }])
    const bed = doc.items[0] as FloorItem
    expect(bed.rotation).toBe(90)
    // 160 wide, 200 long: headboard on the right wall, so the bed spans x 200..400
    expect(bed.x).toBe(300)
    expect(bed.y).toBe(150)
    expect(checkLayout(doc).ok).toBe(true)
  })

  it('puts a chair in front of a desk, facing it', () => {
    const first = applyOps(empty, [{ op: 'add', kind: 'desk', place: { type: 'wall', wall: 'top', align: 'start' } }])
    const deskId = first.touched[0]
    const { doc } = applyOps(first.doc, [{ op: 'add', kind: 'chair', place: { type: 'next_to', target: deskId, side: 'front', gap: 5, face: 'toward' } }])
    const desk = doc.items[0] as FloorItem
    const chair = doc.items[1] as FloorItem
    expect(desk).toMatchObject({ x: 60, y: 30, rotation: 0 })
    // desk front at y=60, 5 cm gap, then half the 45 cm chair: 87.5, rounded
    expect(chair).toMatchObject({ x: 60, y: 88, rotation: 180 })
  })

  it('finds free spots and clamps sizes with a note', () => {
    const { doc, notes } = applyOps(empty, [{ op: 'add', kind: 'wardrobe', w: 999 }])
    const w = doc.items[0] as FloorItem
    expect(w.w).toBe(400)
    expect(notes[0]).toMatch(/outside/)
    // nothing else fits where the 400 cm wardrobe stands, but a spot elsewhere does
    const spot = findFreeSpot(doc, 50, 50, 0)!
    expect(spot).not.toBeNull()
  })

  it('keeps wall items on the wall and below the ceiling', () => {
    const { doc, notes } = applyOps(empty, [{ op: 'add', kind: 'airConditioner', wall: 'left', offset: 500, elevation: 260 }])
    const ac = doc.items[0] as WallItem
    expect(ac.offset).toBe(300 - 80)
    expect(ac.elevation).toBe(270 - 28)
    expect(notes.length).toBe(2)
  })

  it('rejects unknown kinds and ids with a clear message', () => {
    expect(() => applyOps(empty, [{ op: 'add', kind: 'sofa' }])).toThrow(/Unknown kind "sofa".*bed/)
    expect(() => applyOps(empty, [{ op: 'remove', id: 'nope' }])).toThrow(/change #1 \(remove\): item "nope" not found/)
  })

  it('reports tight passages between furniture', () => {
    const { doc } = applyOps(empty, [
      { op: 'add', kind: 'desk', x: 100, y: 100 },
      { op: 'add', kind: 'bookshelf', x: 100, y: 160 },
    ])
    // desk 60 deep ends at y=130, shelf 30 deep starts at y=145: 15 cm gap
    expect(checkLayout(doc).tightPassages[0].gapCm).toBe(15)
  })
})

describe('layers', () => {
  it('lets rugs, decor and ceiling lights overlap furniture', () => {
    const { doc } = applyOps(empty, [
      { op: 'add', kind: 'bed', x: 200, y: 150 },
      { op: 'add', kind: 'rug', x: 200, y: 150 },
      { op: 'add', kind: 'ceilingLight', x: 200, y: 150 },
      { op: 'add', kind: 'plant', x: 200, y: 150 },
    ])
    expect(checkLayout(doc).issues).toEqual([])
  })

  it('puts decor on the solid item below it', async () => {
    const { supportOf } = await import('../model/layers')
    const { doc } = applyOps(empty, [
      { op: 'add', kind: 'nightstand', x: 50, y: 50 },
      { op: 'add', kind: 'tableLamp', x: 50, y: 50 },
      { op: 'add', kind: 'tableLamp', x: 300, y: 200 },
    ])
    const [stand, onStand, onFloor] = doc.items as FloorItem[]
    expect(supportOf(onStand, doc.items)?.id).toBe(stand.id)
    expect(supportOf(onFloor, doc.items)).toBeNull()
  })

  it('centres a rug or ceiling light placed freely', () => {
    const { doc } = applyOps(empty, [{ op: 'add', kind: 'wardrobe', x: 200, y: 150 }, { op: 'add', kind: 'ceilingLight' }])
    expect(doc.items[1]).toMatchObject({ x: 200, y: 150 })
  })
})
