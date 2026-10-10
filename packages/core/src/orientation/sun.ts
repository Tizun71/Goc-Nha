// SPDX-License-Identifier: AGPL-3.0-or-later

// Daylight presets and sun geometry. Sun positions are typical for Vietnam (about 16°N):
// low in the east in the morning, high in the south at noon, low in the west in the afternoon.

import type { Room, WallItem } from '../model/types'
import { wallFrame, wallLocalToRoom, type Vec } from '../geometry/geometry'
import { northOf } from './compass'

export type TimeOfDay = 'off' | 'morning' | 'noon' | 'afternoon' | 'night'

export type LightPreset = {
  label: string
  hour: string
  /** Compass bearing of the sun or moon (0 = north, 90 = east). */
  bearing: number
  /** Degrees above the horizon. */
  elevation: number
  sunColor: string
  sunIntensity: number
  ambientColor: string
  ambientIntensity: number
  background: string
  /** Whether the light source is the sun (casts window patches) or the moon. */
  daylight: boolean
  /** Room lights switch on by default at this time. */
  lightsOn: boolean
}

export const PRESETS: Record<Exclude<TimeOfDay, 'off'>, LightPreset> = {
  morning: {
    label: 'Sáng',
    hour: '8:00',
    bearing: 100,
    elevation: 25,
    sunColor: '#ffd9a0',
    sunIntensity: 4.5,
    ambientColor: '#dfe8ff',
    ambientIntensity: 0.75,
    background: '#fdf1dc',
    daylight: true,
    lightsOn: false,
  },
  noon: {
    label: 'Trưa',
    hour: '12:00',
    bearing: 180,
    elevation: 72,
    sunColor: '#fffaf0',
    sunIntensity: 4.2,
    ambientColor: '#ffffff',
    ambientIntensity: 0.9,
    background: '#eef5fb',
    daylight: true,
    lightsOn: false,
  },
  afternoon: {
    label: 'Chiều',
    hour: '16:30',
    bearing: 255,
    elevation: 22,
    sunColor: '#ffb36b',
    sunIntensity: 4.5,
    ambientColor: '#ffe9d6',
    ambientIntensity: 0.7,
    background: '#fbe3c9',
    daylight: true,
    lightsOn: false,
  },
  night: {
    label: 'Khuya',
    hour: '23:00',
    bearing: 200,
    elevation: 40,
    sunColor: '#9db4ff',
    sunIntensity: 0.25,
    ambientColor: '#5b6b9a',
    ambientIntensity: 0.22,
    background: '#141a2a',
    daylight: false,
    lightsOn: true,
  },
}

/** Unit vector on the plan pointing towards the sun, from the bearing and the room's north. */
export function sunPlanDirection(room: Room, bearing: number): Vec {
  const a = ((bearing + northOf(room)) * Math.PI) / 180 // screen angle, clockwise from up
  return { x: Math.sin(a), y: -Math.cos(a) }
}

/**
 * The patch of floor lit by sunlight coming through a window, as a parallelogram in room coordinates.
 * Null when the sun is on the other side of that wall or below the horizon.
 */
export function windowSunPatch(room: Room, window: WallItem, preset: LightPreset): Vec[] | null {
  if (!preset.daylight || preset.elevation <= 0) return null
  const s = sunPlanDirection(room, preset.bearing)
  const f = wallFrame(room, window.wall)
  // the sun must be outside this wall: towards the outward normal (-inward)
  if (s.x * -f.inward.x + s.y * -f.inward.y <= 0.01) return null
  const reach = (z: number) => z / Math.tan((preset.elevation * Math.PI) / 180)
  const at = (along: number, z: number) => {
    const p = wallLocalToRoom(room, window, { x: along, y: 0 })
    const d = reach(z)
    return { x: p.x - s.x * d, y: p.y - s.y * d }
  }
  const bottom = window.elevation
  const top = window.elevation + window.h
  return [at(0, bottom), at(window.w, bottom), at(window.w, top), at(0, top)]
}
