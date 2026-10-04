import type Konva from 'konva'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Layer, Stage, Transformer } from 'react-konva'
import { useStore } from '../model/store'
import type { Kind } from '../model/types'
import { FLOOR_DEFS, WALL_DEFS } from '../furniture/catalog'
import { WALL_THICKNESS as T } from '../lib/geometry'
import { RoomShell } from './Grid'
import { FurnitureNode } from './FurnitureNode'
import { WallItemNode } from './WallItemNode'
import { Guides, Measurements } from './Measurements'
import { findIssues } from './collision'
import { Lighting2D } from './Lighting2D'
import { LAYER_ORDER, layerOf } from '../model/layers'
import type { FloorItem } from '../model/types'
import { stageHandle, useViewport } from './viewport'

export const DRAG_MIME = 'application/x-dmr-kind'

export function RoomCanvas() {
  const room = useStore((s) => s.room)
  const items = useStore((s) => s.items)
  const selectedId = useStore((s) => s.selectedId)
  const lighting = useStore((s) => s.lighting)
  const { zoom, x, y, guides, fitNonce, set } = useViewport()

  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })

  const issues = useMemo(() => findIssues(items, room), [items, room])
  const selected = items.find((it) => it.id === selectedId) ?? null

  useLayoutEffect(() => {
    const el = wrapRef.current!
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    stageHandle.current = stageRef.current
    return () => {
      stageHandle.current = null
    }
  }, [])

  // Fit the room on screen when it changes size, the window resizes, or the user asks.
  useEffect(() => {
    const margin = 70
    const z = Math.min((size.w - 2 * margin) / (room.length + 2 * T), (size.h - 2 * margin) / (room.width + 2 * T))
    const zoom = Math.max(0.2, z)
    set({ zoom, x: (size.w - room.length * zoom) / 2, y: (size.h - room.width * zoom) / 2 })
  }, [room.length, room.width, size.w, size.h, fitNonce, set])

  // Attach the transformer to the selected item.
  useEffect(() => {
    const tr = trRef.current
    const stage = stageRef.current
    if (!tr || !stage) return
    const node = selectedId ? stage.findOne<Konva.Group>('#' + selectedId) : undefined
    tr.nodes(node ? [node] : [])
    tr.getLayer()?.batchDraw()
  }, [selectedId, items])

  const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current!
    const pointer = stage.getPointerPosition()!
    const factor = e.evt.deltaY > 0 ? 1 / 1.1 : 1.1
    const next = Math.min(20, Math.max(0.2, zoom * factor))
    const cm = { x: (pointer.x - x) / zoom, y: (pointer.y - y) / zoom }
    set({ zoom: next, x: pointer.x - cm.x * next, y: pointer.y - cm.y * next })
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const kind = e.dataTransfer.getData(DRAG_MIME) as Kind
    if (!(kind in FLOOR_DEFS) && !(kind in WALL_DEFS)) return
    const stage = stageRef.current!
    stage.setPointersPositions(e.nativeEvent)
    const p = stage.getRelativePointerPosition()!
    useStore.getState().addItem(kind, p)
  }

  const wallItems = items.filter((it) => it.mount === 'wall')
  // rugs at the bottom, then furniture, decor, wall items, and ceiling lights on top
  const floorItems = items
    .filter((it): it is FloorItem => it.mount === 'floor')
    .sort((a, b) => LAYER_ORDER[layerOf(a)] - LAYER_ORDER[layerOf(b)])
  const renderFloor = (it: FloorItem) => (
    <FurnitureNode key={it.id} item={it} room={room} others={items.filter((o) => o.id !== it.id)} zoom={zoom} hasIssue={issues.has(it.id)} />
  )
  const isWall = selected?.mount === 'wall'

  return (
    <div
      ref={wrapRef}
      className="canvas-wrap"
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
      }}
      onDrop={onDrop}
    >
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        x={x}
        y={y}
        scaleX={zoom}
        scaleY={zoom}
        draggable
        onWheel={onWheel}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) useStore.getState().select(null)
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) useStore.getState().select(null)
        }}
        onDragEnd={(e) => {
          if (e.target === e.target.getStage()) set({ x: e.target.x(), y: e.target.y() })
        }}
      >
        <Layer listening={false}>
          <RoomShell room={room} zoom={zoom} />
        </Layer>
        <Layer name="items">
          {floorItems.filter((it) => layerOf(it) !== 'ceiling').map(renderFloor)}
          {wallItems.map((it) =>
            it.mount === 'wall' ? (
              <WallItemNode key={it.id} item={it} room={room} others={wallItems} zoom={zoom} hasIssue={issues.has(it.id)} />
            ) : null,
          )}
          {floorItems.filter((it) => layerOf(it) === 'ceiling').map(renderFloor)}
        </Layer>
        <Lighting2D room={room} items={items} zoom={zoom} time={lighting.time} lightsOn={lighting.lightsOn} />
        <Layer name="ui">
          {selected && <Measurements item={selected} room={room} zoom={zoom} />}
          <Guides guides={guides} room={room} zoom={zoom} />
          <Transformer
            ref={trRef}
            flipEnabled={false}
            keepRatio={false}
            ignoreStroke
            rotateEnabled={!isWall}
            rotationSnaps={[0, 90, 180, 270]}
            rotationSnapTolerance={8}
            enabledAnchors={
              isWall
                ? ['middle-left', 'middle-right']
                : ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']
            }
            anchorSize={9}
            anchorCornerRadius={2}
            borderStroke="#2563eb"
            anchorStroke="#2563eb"
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)}
          />
        </Layer>
      </Stage>
    </div>
  )
}
