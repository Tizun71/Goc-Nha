// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import { zoomAround } from './zoom'

describe('zoomAround', () => {
  const view = { zoom: 2, x: 100, y: 50 }

  it('keeps the point under the cursor fixed', () => {
    const at = { x: 300, y: 250 }
    const before = { x: (at.x - view.x) / view.zoom, y: (at.y - view.y) / view.zoom }
    const next = zoomAround(view, 1.5, at, 0.2, 20)
    expect(next.zoom).toBe(3)
    expect((at.x - next.x) / next.zoom).toBeCloseTo(before.x)
    expect((at.y - next.y) / next.zoom).toBeCloseTo(before.y)
  })

  it('clamps the zoom', () => {
    expect(zoomAround(view, 100, { x: 0, y: 0 }, 0.2, 20).zoom).toBe(20)
    expect(zoomAround(view, 0.001, { x: 0, y: 0 }, 0.2, 20).zoom).toBe(0.2)
  })

  it('does not move the view at the clamp limit', () => {
    const top = { zoom: 20, x: 10, y: 10 }
    expect(zoomAround(top, 2, { x: 400, y: 300 }, 0.2, 20)).toEqual(top)
  })
})
