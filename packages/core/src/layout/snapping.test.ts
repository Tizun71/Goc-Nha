// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import { snapRect, snapTargets } from './snapping'

describe('snapRect', () => {
  const targets = snapTargets(400, 300, [{ minX: 100, minY: 100, maxX: 200, maxY: 160 }])

  it('snaps to the nearest wall within the threshold', () => {
    const r = snapRect({ minX: 3, minY: 50, maxX: 63, maxY: 110 }, targets, 5)
    expect(r.dx).toBe(-3)
    expect(r.guides).toContainEqual({ axis: 'x', at: 0 })
  })

  it('snaps an edge flush against another item', () => {
    const r = snapRect({ minX: 204, minY: 20, maxX: 254, maxY: 70 }, targets, 5)
    expect(r.dx).toBe(-4)
  })

  it('leaves the rect alone when nothing is close', () => {
    const r = snapRect({ minX: 250, minY: 200, maxX: 290, maxY: 240 }, targets, 5)
    expect(r).toEqual({ dx: 0, dy: 0, guides: [] })
  })
})
