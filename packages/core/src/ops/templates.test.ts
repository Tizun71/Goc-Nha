// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import { ROOM_TEMPLATES, templateDoc } from './templates'
import { checkLayout } from './ops'
import { FLOOR_DEFS, WALL_DEFS } from '../catalog/catalog'

describe('room templates', () => {
  it.each(ROOM_TEMPLATES.map((t) => [t.label, t] as const))('%s is a clean layout', (_, template) => {
    const report = checkLayout(templateDoc(template))
    expect(report.issues).toEqual([])
    expect(report.tightPassages).toEqual([])
  })

  it('uses sizes inside each item’s allowed range', () => {
    for (const t of ROOM_TEMPLATES)
      for (const it of templateDoc(t).items) {
        const def = it.mount === 'floor' ? FLOOR_DEFS[it.kind] : WALL_DEFS[it.kind]
        expect(it.w).toBeGreaterThanOrEqual(def.min.w)
        expect(it.w).toBeLessThanOrEqual(def.max.w)
      }
  })

  it('gives every copy new ids', () => {
    const a = templateDoc(ROOM_TEMPLATES[0])
    const b = templateDoc(ROOM_TEMPLATES[0])
    expect(a.items[0].id).not.toBe(b.items[0].id)
  })
})
