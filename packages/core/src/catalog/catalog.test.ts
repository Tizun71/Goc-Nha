// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import { CATEGORIES, FLOOR_DEFS, WALL_DEFS } from './catalog'
import type { FloorItem, WallItem } from '../model/types'

/** A canvas 2D context that accepts every call and records nothing, so drawings can run in Node. */
function fakeContext(): CanvasRenderingContext2D {
  const gradient = { addColorStop: () => {} }
  const target: Record<string, unknown> = {}
  return new Proxy(target, {
    get: (t, key) => {
      if (key in t) return t[key as string]
      if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => gradient
      return () => {}
    },
    set: (t, key, value) => {
      t[key as string] = value
      return true
    },
  }) as unknown as CanvasRenderingContext2D
}

const categories = new Set(CATEGORIES.map((c) => c.id))

describe('catalog', () => {
  for (const [kind, def] of Object.entries(FLOOR_DEFS)) {
    it(`floor item ${kind} draws and builds at its default, min and max sizes`, () => {
      expect(categories.has(def.category)).toBe(true)
      for (const size of [def.defaults, def.min, def.max]) {
        const item = { id: `t-${kind}`, mount: 'floor', kind, x: 100, y: 100, rotation: 0, ...size } as FloorItem
        expect(() => def.draw2D(fakeContext(), item, 1)).not.toThrow()
        const boxes = def.build3D(item)
        expect(boxes.length).toBeGreaterThan(0)
        for (const b of boxes) for (const v of [b.x, b.y, b.z, b.w, b.d, b.h]) expect(Number.isFinite(v)).toBe(true)
        for (const b of boxes) expect(Math.min(b.w, b.d, b.h)).toBeGreaterThan(0)
      }
    })
  }
  for (const [kind, def] of Object.entries(WALL_DEFS)) {
    it(`wall item ${kind} draws and builds at its default, min and max sizes`, () => {
      expect(categories.has(def.category)).toBe(true)
      for (const size of [def.defaults, { ...def.defaults, ...def.min }, { ...def.defaults, ...def.max }]) {
        const item = { id: `t-${kind}`, mount: 'wall', kind, wall: 'top', offset: 0, hinge: 'left', opening: 'in', ...size } as WallItem
        expect(() => def.draw2D(fakeContext(), item, 1)).not.toThrow()
        const boxes = def.build3D(item)
        expect(boxes.length).toBeGreaterThan(0)
        for (const b of boxes) for (const v of [b.x, b.y, b.z, b.w, b.d, b.h]) expect(Number.isFinite(v)).toBe(true)
        for (const b of boxes) expect(Math.min(b.w, b.d, b.h)).toBeGreaterThan(0)
      }
    })
  }
  it('has unique labels', () => {
    const labels = [...Object.values(FLOOR_DEFS), ...Object.values(WALL_DEFS)].map((d) => d.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})
