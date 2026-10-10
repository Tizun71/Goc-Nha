// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import { areaM2, formatCm, roundTo } from './units'

describe('units', () => {
  it('rounds to a step', () => {
    expect(roundTo(123, 5)).toBe(125)
    expect(roundTo(122, 5)).toBe(120)
  })
  it('formats centimetres and metres', () => {
    expect(formatCm(85)).toBe('85 cm')
    expect(formatCm(240)).toBe('2,4 m')
    expect(formatCm(400)).toBe('4 m')
  })
  it('computes area in m²', () => {
    expect(areaM2(400, 300)).toBe(12)
  })
})

describe('saved file migration', async () => {
  const { parseDoc } = await import('../serialization/persist')
  it('turns old tree shelves into fishbone shelves', () => {
    const doc = parseDoc(
      JSON.stringify({
        room: { length: 400, width: 300, height: 270 },
        items: [{ id: 'a', mount: 'floor', kind: 'treeShelf', x: 1, y: 1, w: 100, d: 30, h: 180, rotation: 0 }],
      }),
    )
    expect(doc.items[0].kind).toBe('fishboneShelf')
  })
})
