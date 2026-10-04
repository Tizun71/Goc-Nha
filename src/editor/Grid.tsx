import { Circle, Group, Line, Rect, Shape, Text } from 'react-konva'
import type { Room, Wall } from '../model/types'
import { FLOOR_COLOR } from '../furniture/draw2d'
import { WALL_THICKNESS as T, WALLS, wallFrame } from '../lib/geometry'
import { formatCm } from '../lib/units'
import { DIRECTIONS, SHORT, directionName, northOf, wallBearing } from '../lib/compass'

/** Walls, floor, grid and the room dimensions. Not interactive. */
export function RoomShell({ room, zoom }: { room: Room; zoom: number }) {
  const { length: L, width: W } = room
  const px = 1 / zoom
  const fine = zoom * 10 >= 6 // hide the 10 cm grid when lines would crowd together
  return (
    <>
      <Rect x={-T} y={-T} width={L + 2 * T} height={W + 2 * T} fill="#5b4f45" cornerRadius={2} />
      <Rect x={0} y={0} width={L} height={W} fill={FLOOR_COLOR} />
      <Shape
        sceneFunc={(ctx) => {
          const c = ctx._context
          const lines = (step: number, color: string, width: number) => {
            c.beginPath()
            for (let x = step; x < L; x += step) {
              c.moveTo(x, 0)
              c.lineTo(x, W)
            }
            for (let y = step; y < W; y += step) {
              c.moveTo(0, y)
              c.lineTo(L, y)
            }
            c.strokeStyle = color
            c.lineWidth = width * px
            c.stroke()
          }
          if (fine) lines(10, 'rgba(91,79,69,0.08)', 1)
          lines(50, 'rgba(91,79,69,0.18)', 1)
          lines(100, 'rgba(91,79,69,0.28)', 1)
        }}
      />
      <WallDirections room={room} zoom={zoom} />
      <Compass room={room} zoom={zoom} />
    </>
  )
}

/** Outside each wall: the direction it faces, plus the room size on the top and left sides. */
function WallDirections({ room, zoom }: { room: Room; zoom: number }) {
  const font = 12 / zoom
  const north = northOf(room)
  const size: Partial<Record<Wall, string>> = { top: `dài ${formatCm(room.length)}`, left: `rộng ${formatCm(room.width)}` }
  return (
    <>
      {WALLS.map((wall) => {
        const f = wallFrame(room, wall)
        const gap = T + font * 1.1
        const x = f.start.x + (f.dir.x * f.length) / 2 - f.inward.x * gap
        const y = f.start.y + (f.dir.y * f.length) / 2 - f.inward.y * gap
        const width = f.length
        const name = directionName(wallBearing(wall, north))
        return (
          <Text
            key={wall}
            x={x}
            y={y}
            width={width}
            offsetX={width / 2}
            offsetY={font / 2}
            rotation={wall === 'left' ? -90 : wall === 'right' ? 90 : 0}
            align="center"
            text={size[wall] ? `${name.toUpperCase()}  ·  ${size[wall]}` : name.toUpperCase()}
            fontSize={font}
            fontStyle="bold"
            fill="#5b4f45"
          />
        )
      })}
    </>
  )
}

/** Compass rose outside the top-right corner, sized in screen pixels. */
function Compass({ room, zoom }: { room: Room; zoom: number }) {
  const px = 1 / zoom
  const r = 24 * px
  const north = northOf(room)
  const cx = room.length + T + 34 * px
  const cy = -T - 34 * px
  return (
    <Group x={cx} y={cy}>
      <Circle radius={r} fill="#ffffff" stroke="#5b4f45" strokeWidth={1.2 * px} />
      <Group rotation={north}>
        <Line points={[0, -r * 0.5, r * 0.16, 0, -r * 0.16, 0]} closed fill="#dc2626" />
        <Line points={[0, r * 0.5, r * 0.16, 0, -r * 0.16, 0]} closed fill="#9a8f85" />
      </Group>
      {DIRECTIONS.filter((_, i) => i % 2 === 0).map((name, i) => {
        // letters stay upright while their position rotates with north
        const a = ((north + i * 90) * Math.PI) / 180
        const f = 9 * px
        return (
          <Text
            key={name}
            x={Math.sin(a) * r * 0.8}
            y={-Math.cos(a) * r * 0.8}
            width={f * 2}
            offsetX={f}
            offsetY={f / 2}
            align="center"
            text={SHORT[i * 2]}
            fontSize={f}
            fontStyle="bold"
            fill={i === 0 ? '#dc2626' : '#5b4f45'}
          />
        )
      })}
    </Group>
  )
}
