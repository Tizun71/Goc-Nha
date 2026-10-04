import type Konva from 'konva'
import { Group, Rect, Shape } from 'react-konva'
import type { Item, Room, WallItem } from '../model/types'
import { clampWallItem, useStore } from '../model/store'
import { WALL_DEFS } from '../furniture/catalog'
import { WALL_THICKNESS as T, clampNum, nearestWall, wallFrame, wallLocalToRoom } from '../lib/geometry'

const SNAP_PX = 8

type Props = { item: WallItem; room: Room; others: Item[]; zoom: number; hasIssue: boolean }

export function WallItemNode({ item, room, others, zoom, hasIssue }: Props) {
  const def = WALL_DEFS[item.kind]
  const { updateItem, checkpoint, select } = useStore.getState()
  const px = 1 / zoom
  const frame = wallFrame(room, item.wall)
  const origin = wallLocalToRoom(room, item, { x: 0, y: 0 })
  const depth = def.depth(item)

  // Slide along the nearest wall, jumping to another wall when the pointer gets closer to it.
  const onDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target
    const pointer = node.getLayer()!.getRelativePointerPosition()!
    const { wall, along } = nearestWall(room, pointer)
    let offset = Math.round(along - item.w / 2)
    // centre on another wall item of the same wall (e.g. a curtain over a window)
    for (const o of others)
      if (o.mount === 'wall' && o.wall === wall && o.id !== item.id) {
        const target = o.offset + o.w / 2 - item.w / 2
        if (Math.abs(target - offset) <= SNAP_PX / zoom) offset = target
      }
    const next = clampWallItem(room, { ...item, wall, offset })
    node.position(wallLocalToRoom(room, next, { x: 0, y: 0 }))
    node.rotation(wallFrame(room, wall).rotation)
    updateItem(item.id, { wall, offset: next.offset }, false)
  }

  const onTransform = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target
    const w = clampNum(Math.round(item.w * node.scaleX()), def.min.w, Math.min(def.max.w, frame.length))
    node.scaleX(1)
    node.scaleY(1)
    const offset = (node.x() - frame.start.x) * frame.dir.x + (node.y() - frame.start.y) * frame.dir.y
    updateItem(item.id, { w, offset: Math.round(offset) }, false)
  }

  return (
    <Group
      id={item.id}
      name="item"
      x={origin.x}
      y={origin.y}
      rotation={frame.rotation}
      draggable
      onMouseDown={(e) => {
        e.cancelBubble = true
        select(item.id)
      }}
      onTouchStart={(e) => {
        e.cancelBubble = true
        select(item.id)
      }}
      onDragStart={() => {
        checkpoint()
        select(item.id)
      }}
      onDragMove={onDragMove}
      onTransformStart={checkpoint}
      onTransform={onTransform}
    >
      {/* invisible box that gives the transformer the item's bounds */}
      <Rect y={-T} width={item.w} height={T + depth} listening={false} />
      <Shape
        sceneFunc={(ctx) => def.draw2D(ctx._context, item, px)}
        hitFunc={(ctx, shape) => {
          ctx.beginPath()
          ctx.rect(0, -T, item.w, T + depth)
          ctx.closePath()
          ctx.fillStrokeShape(shape)
        }}
      />
      {hasIssue && (
        <Rect
          y={-T}
          width={item.w}
          height={T + depth}
          fill="rgba(220,38,38,0.12)"
          stroke="#dc2626"
          strokeWidth={2 * px}
          dash={[6 * px, 4 * px]}
          listening={false}
        />
      )}
    </Group>
  )
}
