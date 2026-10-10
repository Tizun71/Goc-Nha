// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import type { RoomDoc } from '../model/types'
import { decodeShare, encodeShare, shareCodeFromHash } from './share'

const doc: RoomDoc = {
  room: { length: 400, width: 300, height: 270, north: 90 },
  items: [
    { id: 'bed1', mount: 'floor', kind: 'bed', x: 100, y: 120, w: 160, d: 200, h: 45, rotation: 90, color: '#c9a27e' },
    { id: 'door1', mount: 'wall', kind: 'door', wall: 'bottom', offset: 300, w: 80, h: 210, elevation: 0, hinge: 'left', opening: 'in' },
  ],
}

describe('share links', () => {
  it('round-trips a room through a URL-safe code', async () => {
    const code = await encodeShare(doc)
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(await decodeShare(code)).toEqual(doc)
  })

  it('is shorter than the raw JSON for a furnished room', async () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ ...doc.items[0], id: `item${i}`, x: i * 10 }))
    const big = { ...doc, items }
    expect((await encodeShare(big)).length).toBeLessThan(JSON.stringify(big).length / 2)
  })

  it('rejects a broken code with a readable error', async () => {
    await expect(decodeShare('not-a-room')).rejects.toThrow('Link chia sẻ')
  })

  it('reads the code from the fragment', () => {
    expect(shareCodeFromHash('#r=abc_-1')).toBe('abc_-1')
    expect(shareCodeFromHash('#other=1')).toBeNull()
    expect(shareCodeFromHash('')).toBeNull()
  })
})
