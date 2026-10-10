// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import { parseDoc, restoreDoc } from './persist'

const room = { length: 400, width: 300, height: 270 }
const bed = { id: 'b', mount: 'floor', kind: 'bed', x: 100, y: 100, w: 160, d: 200, h: 45, rotation: 0 }

describe('restoring saved rooms', () => {
  it('returns null instead of throwing for broken saves', () => {
    expect(restoreDoc(undefined)).toBeNull()
    expect(restoreDoc({ items: [] })).toBeNull()
    expect(restoreDoc({ room, items: 'nope' })).toBeNull()
    expect(restoreDoc({ room: { ...room, length: 0 }, items: [] })).toBeNull()
    expect(restoreDoc({ room: { ...room, width: Number.NaN }, items: [] })).toBeNull()
  })

  it('drops invalid items and keeps the rest', () => {
    const doc = restoreDoc({
      room,
      items: [
        bed,
        { ...bed, id: 'unknown', kind: 'spaceship' },
        { ...bed, id: 'flat', w: 0 },
        { ...bed, id: 'nan', x: null },
        { id: 'w', mount: 'wall', kind: 'window', wall: 'top', offset: 50, w: 100, h: 120 }, // no elevation
        null,
      ],
    })
    expect(doc?.items.map((it) => it.id)).toEqual(['b'])
  })

  it('keeps only the first item of a duplicated id', () => {
    const doc = restoreDoc({ room, items: [bed, { ...bed, x: 300 }] })
    expect(doc?.items).toHaveLength(1)
    expect(doc?.items[0]).toMatchObject({ x: 100 })
  })

  it('migrates renamed kinds', () => {
    const doc = restoreDoc({ room, items: [{ ...bed, kind: 'treeShelf' }] })
    expect(doc?.items[0].kind).toBe('fishboneShelf')
  })

  it('still throws a readable error when opening a file', () => {
    expect(() => parseDoc('{"items": []}')).toThrow('thông tin phòng')
  })
})
