import type { RoomDoc } from '../model/types'
import { supportOf } from '../model/layers'
import { wallLocalToRoom } from './geometry'

/** A lamp in the room, in room coordinates (z = height above the floor, cm). */
export type RoomLight = { id: string; x: number; y: number; z: number; color: string; intensity: number; reach: number }

/** Every light-emitting item as one or more point lights. */
export function roomLights(doc: RoomDoc): RoomLight[] {
  const { room, items } = doc
  const lights: RoomLight[] = []
  for (const it of items) {
    if (it.mount === 'floor') {
      if (it.kind === 'ceilingLight')
        lights.push({ id: it.id, x: it.x, y: it.y, z: room.height - it.h - 5, color: it.color ?? '#ffd27a', intensity: 2.2, reach: Math.max(room.length, room.width) * 1.1 })
      else if (it.kind === 'pendantLight')
        lights.push({ id: it.id, x: it.x, y: it.y, z: room.height - it.h + 5, color: '#ffd8a0', intensity: 1.6, reach: 260 })
      else if (it.kind === 'floorLamp') lights.push({ id: it.id, x: it.x, y: it.y, z: it.h * 0.85, color: '#ffd8a0', intensity: 1.4, reach: 230 })
      else if (it.kind === 'candleHolder') {
        const base = supportOf(it, items)?.h ?? 0
        lights.push({ id: it.id, x: it.x, y: it.y, z: base + it.h, color: '#ffb347', intensity: 0.55, reach: 90 })
      } else if (it.kind === 'tableLamp') {
        const base = supportOf(it, items)?.h ?? 0
        lights.push({ id: it.id, x: it.x, y: it.y, z: base + it.h * 0.55, color: '#ffd8a0', intensity: 1.3, reach: 170 })
      }
      continue
    }
    const at = (along: number, into: number) => wallLocalToRoom(room, it, { x: along, y: into })
    if (it.kind === 'wallLamp') {
      const p = at(it.w / 2, 15)
      lights.push({ id: it.id, ...p, z: it.elevation + it.h * 0.4, color: '#ffd8a0', intensity: 1.1, reach: 200 })
    } else if (it.kind === 'fluorescentLamp') {
      const p = at(it.w / 2, 8)
      lights.push({ id: it.id, ...p, z: it.elevation + it.h / 2, color: it.color ?? '#e0f2fe', intensity: 1.9, reach: 320 })
    } else if (it.kind === 'stringLights') {
      const n = Math.min(5, Math.max(1, Math.round(it.w / 80)))
      for (let i = 0; i < n; i++) {
        const p = at(((i + 0.5) / n) * it.w, 6)
        lights.push({ id: `${it.id}-${i}`, ...p, z: it.elevation + it.h * 0.5, color: it.color ?? '#ffd08a', intensity: 0.4, reach: 120 })
      }
    } else if (it.kind === 'ledStrip') {
      // a strip becomes a row of small lights, at most one every 80 cm
      const n = Math.min(6, Math.max(1, Math.round(it.w / 80)))
      for (let i = 0; i < n; i++) {
        const p = at(((i + 0.5) / n) * it.w, 6)
        lights.push({ id: `${it.id}-${i}`, ...p, z: it.elevation, color: it.color ?? '#fde68a', intensity: 0.7, reach: 130 })
      }
    }
  }
  return lights
}
