// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from 'vitest'
import { backBearing, directionName, frontBearing, northForTopWall, wallBearing } from './compass'

describe('compass', () => {
  it('names the 8 directions', () => {
    expect(directionName(0)).toBe('Bắc')
    expect(directionName(100)).toBe('Đông')
    expect(directionName(225)).toBe('Tây Nam')
    expect(directionName(-10)).toBe('Bắc')
  })

  it('reads wall directions from where north points', () => {
    // north at the top of the plan
    expect(wallBearing('top', 0)).toBe(0)
    expect(wallBearing('right', 0)).toBe(90)
    expect(wallBearing('bottom', 0)).toBe(180)
    // north points to the right of the plan: the right wall faces north, the top wall west
    expect(wallBearing('right', 90)).toBe(0)
    expect(wallBearing('top', 90)).toBe(270)
  })

  it('sets north so the top wall faces a chosen bearing', () => {
    for (const b of [0, 45, 90, 180, 315]) expect(wallBearing('top', northForTopWall(b))).toBe(b)
  })

  it('reads the facing of rotated furniture', () => {
    // unrotated: back towards the top wall, front towards the bottom wall
    expect(backBearing(0, 0)).toBe(0)
    expect(frontBearing(0, 0)).toBe(180)
    expect(frontBearing(90, 0)).toBe(270)
  })
})
