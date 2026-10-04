import type Konva from 'konva'
import { Group, Rect, Shape } from 'react-konva'
import type { FloorItem, Item, Room } from '../model/types'
import { useStore } from '../model/store'
import { FLOOR_DEFS } from '../furniture/catalog'
import { boundsOf, clampNum, floorCorners } from '../lib/geometry'
import { snapRect, snapTargets } from './snapping'
import { useViewport } from './viewport'

const SNAP_PX = 8

type Props = { item: FloorItem; room: Room; others: Item[]; zoom: number; hasIssue: boolean }

export function FurnitureNode({ item, room, others, zoom, hasIssue }: Props) {
  const def = FLOOR_DEFS[item.kind]
  const { updateItem, checkpoint, select } = useStore.getState()
  const px = 1 / zoom

  const onDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target
    const x = Math.round(node.x())
    const y = Math.round(node.y())
    const rect = boundsOf(floorCorners({ ...item, x, y }))
    const otherRects = others.filter((o): o is FloorItem => o.mount === 'floor').map((o) => boundsOf(floorCorners(o)))
    const snap = snapRect(rect, snapTargets(room.length, room.width, otherRects), SNAP_PX / zoom)
    const pos = { x: x + snap.dx, y: y + snap.dy }
    node.position(pos)
    useViewport.getState().set({ guides: snap.guides })
    updateItem(item.id, pos, false)
  }

  // Resize by turning the transformer's scale into real width/depth, so the drawing re-flows instead of stretching.
  const onTransform = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target
    const w = clampNum(Math.round(item.w * node.scaleX()), def.min.w, def.max.w)
    const d = clampNum(Math.round(item.d * node.scaleY()), def.min.d, def.max.d)
    node.scaleX(1)
    node.scaleY(1)
    updateItem(item.id, { x: Math.round(node.x()), y: Math.round(node.y()), w, d, rotation: Math.round(node.rotation()) }, false)
  }

  return (
    <Group
      id={item.id}
      name="item"
      x={item.x}
      y={item.y}
      offsetX={item.w / 2}
      offsetY={item.d / 2}
      rotation={item.rotation}
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
        useViewport.getState().set({ dragging: true })
      }}
      onDragMove={onDragMove}
      onDragEnd={() => useViewport.getState().set({ guides: [], dragging: false })}
      onTransformStart={checkpoint}
      onTransform={onTransform}
    >
      <Shape
        width={item.w}
        height={item.d}
        sceneFunc={(ctx) => def.draw2D(ctx._context, item, px)}
        hitFunc={(ctx, shape) => {
          ctx.beginPath()
          ctx.rect(0, 0, item.w, item.d)
          ctx.closePath()
          ctx.fillStrokeShape(shape)
        }}
      />
      {hasIssue && (
        <Rect
          width={item.w}
          height={item.d}
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
