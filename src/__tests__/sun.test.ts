import { describe, expect, it } from 'vitest'
import { PRESETS, sunPlanDirection, windowSunPatch } from '../lib/sun'
import type { Room, WallItem } from '../model/types'

const room: Room = { length: 400, width: 300, height: 270 }
const win = (wall: WallItem['wall']): WallItem => ({ id: 'w', mount: 'wall', kind: 'window', wall, offset: 100, w: 100, h: 100, elevation: 90 })

describe('sun', () => {
  it('points east in the morning when north is up', () => {
    const s = sunPlanDirection(room, PRESETS.morning.bearing)
    expect(s.x).toBeGreaterThan(0.9)
  })

  it('follows the room orientation', () => {
    // north pointing right: east is down the plan
    const s = sunPlanDirection({ ...room, north: 90 }, 90)
    expect(s.y).toBeCloseTo(1)
  })

  it('lets morning sun in through an east window, onto the floor towards the west', () => {
    const patch = windowSunPatch(room, win('right'), PRESETS.morning)!
    expect(patch).not.toBeNull()
    // the window sits on x=400; the light lands further west, more so for the top of the window
    expect(Math.max(...patch.map((p) => p.x))).toBeLessThan(400)
    expect(patch[3].x).toBeLessThan(patch[0].x)
  })

  it('keeps morning sun out of a west window and gives no sun at night', () => {
    expect(windowSunPatch(room, win('left'), PRESETS.morning)).toBeNull()
    expect(windowSunPatch(room, win('right'), PRESETS.night)).toBeNull()
  })

  it('casts a short patch at noon through a south window', () => {
    const patch = windowSunPatch(room, win('bottom'), PRESETS.noon)!
    const depth = Math.max(...patch.map((p) => 300 - p.y))
    expect(depth).toBeLessThan(100)
  })
})
