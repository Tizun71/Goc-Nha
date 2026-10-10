// SPDX-License-Identifier: AGPL-3.0-or-later

import { Group, Label, Line, Tag, Text } from 'react-konva'
import type { Item, Room } from '@goc-nha/core/model'
import { boundsOf, floorCorners, wallFrame, wallLocalToRoom, type Vec } from '@goc-nha/core/geometry'
import { formatCm, formatSize } from '@goc-nha/core/geometry'
import type { Guide } from '@goc-nha/core/layout'

const ACCENT = '#2563eb'

function Dim({ a, b, zoom, text }: { a: Vec; b: Vec; zoom: number; text?: string }) {
  const px = 1 / zoom
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  if (len < 1) return null
  return (
    <Group listening={false}>
      <Line points={[a.x, a.y, b.x, b.y]} stroke={ACCENT} strokeWidth={px} dash={[4 * px, 3 * px]} />
      <Tagged x={(a.x + b.x) / 2} y={(a.y + b.y) / 2} zoom={zoom} text={text ?? formatCm(len)} />
    </Group>
  )
}

function Tagged({ x, y, zoom, text, color = ACCENT }: { x: number; y: number; zoom: number; text: string; color?: string }) {
  const px = 1 / zoom
  const font = 11 * px
  const width = text.length * font * 0.6 + 8 * px
  return (
    <Label x={x - width / 2} y={y - font} listening={false}>
      <Tag fill={color} cornerRadius={3 * px} />
      <Text text={text} fontSize={font} padding={4 * px} fill="#fff" width={width} align="center" />
    </Label>
  )
}

/** Distances from the selected item to the walls, plus its size. */
export function Measurements({ item, room, zoom }: { item: Item; room: Room; zoom: number }) {
  if (item.mount === 'floor') {
    const r = boundsOf(floorCorners(item))
    const cx = (r.minX + r.maxX) / 2
    const cy = (r.minY + r.maxY) / 2
    return (
      <>
        <Dim a={{ x: 0, y: cy }} b={{ x: r.minX, y: cy }} zoom={zoom} />
        <Dim a={{ x: r.maxX, y: cy }} b={{ x: room.length, y: cy }} zoom={zoom} />
        <Dim a={{ x: cx, y: 0 }} b={{ x: cx, y: r.minY }} zoom={zoom} />
        <Dim a={{ x: cx, y: r.maxY }} b={{ x: cx, y: room.width }} zoom={zoom} />
        <Tagged x={cx} y={r.minY - 6 / zoom} zoom={zoom} text={formatSize(item.w, item.d)} color="#111827" />
      </>
    )
  }
  const len = wallFrame(room, item.wall).length
  const at = (x: number) => wallLocalToRoom(room, item, { x, y: 28 })
  return (
    <>
      <Dim a={at(-item.offset)} b={at(0)} zoom={zoom} />
      <Dim a={at(item.w)} b={at(len - item.offset)} zoom={zoom} />
      <Dim a={at(0)} b={at(item.w)} zoom={zoom} text={formatCm(item.w)} />
    </>
  )
}

export function Guides({ guides, room, zoom }: { guides: Guide[]; room: Room; zoom: number }) {
  const px = 1 / zoom
  return (
    <>
      {guides.map((g, i) => (
        <Line
          key={i}
          listening={false}
          points={g.axis === 'x' ? [g.at, -20, g.at, room.width + 20] : [-20, g.at, room.length + 20, g.at]}
          stroke="#ec4899"
          strokeWidth={px}
        />
      ))}
    </>
  )
}
