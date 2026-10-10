import { Layer, Shape } from 'react-konva'
import type { Item, Room, WallItem } from '@goc-nha/core/model'
import { WALL_THICKNESS as T, wallLocalToRoom } from '@goc-nha/core/geometry'
import { PRESETS, sunPlanDirection, windowSunPatch, type TimeOfDay } from '@goc-nha/core/orientation'
import { roomLights } from '@goc-nha/core/orientation'

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

type Props = { room: Room; items: Item[]; zoom: number; time: TimeOfDay; lightsOn: boolean }

/** Sun patches through windows by day, a dark room lit by its lamps at night, and a sun/moon marker. */
export function Lighting2D({ room, items, zoom, time, lightsOn }: Props) {
  if (time === 'off' && !lightsOn) return null
  const preset = time === 'off' ? null : PRESETS[time]
  const px = 1 / zoom
  const { length: L, width: W } = room
  const lights = lightsOn ? roomLights({ room, items }) : []
  const windows = items.filter((it): it is WallItem => it.kind === 'window')

  return (
    <Layer listening={false}>
      <Shape
        sceneFunc={(ctx) => {
          const c = ctx._context
          c.save()
          c.beginPath()
          c.rect(0, 0, L, W)
          c.clip()
          if (preset && !preset.daylight) {
            // night: darken the room, then punch out pools of lamp light
            c.fillStyle = 'rgba(12,18,40,0.62)'
            c.fillRect(0, 0, L, W)
            c.globalCompositeOperation = 'destination-out'
            for (const l of lights) {
              const r = l.reach * 0.75
              const g = c.createRadialGradient(l.x, l.y, 0, l.x, l.y, r)
              g.addColorStop(0, `rgba(0,0,0,${Math.min(1, 0.55 * l.intensity)})`)
              g.addColorStop(1, 'rgba(0,0,0,0)')
              c.fillStyle = g
              c.fillRect(l.x - r, l.y - r, 2 * r, 2 * r)
            }
            c.globalCompositeOperation = 'source-over'
          }
          if (preset?.daylight) {
            for (const win of windows) {
              const patch = windowSunPatch(room, win, preset)
              if (!patch) continue
              // faint beam from the window opening, then the bright patch on the floor
              const a = wallLocalToRoom(room, win, { x: 0, y: 0 })
              const b = wallLocalToRoom(room, win, { x: win.w, y: 0 })
              c.beginPath()
              c.moveTo(a.x, a.y)
              c.lineTo(b.x, b.y)
              c.lineTo(patch[2].x, patch[2].y)
              c.lineTo(patch[3].x, patch[3].y)
              c.closePath()
              c.fillStyle = rgba(preset.sunColor, 0.14)
              c.fill()
              c.beginPath()
              patch.forEach((p, i) => (i === 0 ? c.moveTo(p.x, p.y) : c.lineTo(p.x, p.y)))
              c.closePath()
              c.fillStyle = rgba(preset.sunColor === '#fffaf0' ? '#ffe9a8' : preset.sunColor, 0.5)
              c.fill()
            }
          }
          // warm glow around lamps that are on
          for (const l of lights) {
            const r = l.reach * 0.6
            const g = c.createRadialGradient(l.x, l.y, 0, l.x, l.y, r)
            g.addColorStop(0, rgba(l.color, preset && !preset.daylight ? 0.28 : 0.16))
            g.addColorStop(1, rgba(l.color, 0))
            c.fillStyle = g
            c.fillRect(l.x - r, l.y - r, 2 * r, 2 * r)
          }
          c.restore()

          if (!preset) return
          // sun or moon marker outside the room, in the direction it shines from
          const s = sunPlanDirection(room, preset.bearing)
          const toEdge = Math.min(Math.abs(s.x) > 1e-6 ? L / 2 / Math.abs(s.x) : Infinity, Math.abs(s.y) > 1e-6 ? W / 2 / Math.abs(s.y) : Infinity)
          const d = toEdge + T + 30 * px
          const x = L / 2 + s.x * d
          const y = W / 2 + s.y * d
          const r = 10 * px
          if (preset.daylight) {
            c.strokeStyle = '#f59e0b'
            c.lineWidth = 2 * px
            for (let i = 0; i < 8; i++) {
              const t = (i / 8) * Math.PI * 2
              c.beginPath()
              c.moveTo(x + Math.cos(t) * r * 1.35, y + Math.sin(t) * r * 1.35)
              c.lineTo(x + Math.cos(t) * r * 1.8, y + Math.sin(t) * r * 1.8)
              c.stroke()
            }
            c.beginPath()
            c.arc(x, y, r, 0, Math.PI * 2)
            c.fillStyle = '#fbbf24'
            c.fill()
          } else {
            c.beginPath()
            c.arc(x, y, r, 0, Math.PI * 2)
            c.fillStyle = '#e2e8f0'
            c.fill()
            c.beginPath()
            c.arc(x + r * 0.45, y - r * 0.3, r * 0.85, 0, Math.PI * 2)
            c.fillStyle = '#f7f4ee'
            c.fill()
          }
          c.font = `bold ${11 * px}px system-ui, sans-serif`
          c.fillStyle = '#5b4f45'
          c.textAlign = 'center'
          c.fillText(`${preset.label} ${preset.hour}`, x, y + r * 2.9)
        }}
      />
    </Layer>
  )
}
