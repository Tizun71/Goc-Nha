// SPDX-License-Identifier: AGPL-3.0-or-later

import { Edges, OrbitControls, OrthographicCamera } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentRef } from 'react'
import { GreaterDepth, Object3D, type DirectionalLight, type OrthographicCamera as OrthoCam } from 'three'
import { useStore } from '../../store/store'
import type { Item, Room, Wall, WallItem } from '@goc-nha/core/model'
import { FLOOR_DEFS, WALL_DEFS } from '@goc-nha/core/catalog'
import type { Box } from '@goc-nha/core/catalog'
import { FLOOR_COLOR } from '@goc-nha/core/catalog'
import { layerOf, supportOf } from '@goc-nha/core/model'
import { PRESETS, sunPlanDirection, type LightPreset } from '@goc-nha/core/orientation'
import { roomLights } from '@goc-nha/core/orientation'
import { TOUCH_QUERY, useMediaQuery } from '../../hooks/useMediaQuery'
import { WALL_THICKNESS as T, wallFrame, wallLocalToRoom } from '@goc-nha/core/geometry'

// Room coordinates (x, y) on the floor map to three.js (x, z); three's y is up.
const DEG = Math.PI / 180
const WALL_KEYS: Wall[] = ['top', 'right', 'bottom', 'left']

/** Walls between the camera and the room; they are drawn low so the room stays visible. */
type FrontWalls = Record<Wall, boolean>

function frontWallsFor(dx: number, dz: number): FrontWalls {
  return { top: dz < 0, bottom: dz > 0, left: dx < 0, right: dx > 0 }
}

/** Rotation, scale and geometry for a box, cylinder or ellipsoid (round shapes are unit-sized and scaled). */
function shapeOf(b: Box) {
  const rotation: [number, number, number] = [b.cylinder === 'y' ? Math.PI / 2 : 0, b.turn ? -b.turn * DEG : 0, b.tilt ? b.tilt * DEG : 0]
  const scale: [number, number, number] = b.cylinder === 'y' ? [b.w, b.d, b.h] : b.cylinder || b.ellipsoid ? [b.w, b.h, b.d] : [1, 1, 1]
  const geometry = b.ellipsoid ? (
    <sphereGeometry args={[0.5, 32, 24]} />
  ) : b.cylinder ? (
    <cylinderGeometry args={[0.5, 0.5 * (b.taper ?? 1), 1, 40]} />
  ) : (
    <boxGeometry args={[b.w, b.h, b.d]} />
  )
  return { rotation, scale, geometry }
}

function Boxes({ boxes, highlight, ghost = false }: { boxes: Box[]; highlight: boolean; ghost?: boolean }) {
  return (
    <>
      {boxes.map((b, i) =>
        b.glow ? (
          <Glow key={i} b={b} />
        ) : (
          <mesh
            key={i}
            position={[b.x, b.z, b.y]}
            rotation={shapeOf(b).rotation}
            scale={shapeOf(b).scale}
            castShadow={!ghost && b.opacity === undefined}
            receiveShadow
          >
            {shapeOf(b).geometry}
            <meshLambertMaterial
              // three.js only applies a change of `transparent` to a new material, so remount when ghosting toggles
              key={ghost ? 'ghost' : 'solid'}
              color={b.color}
              transparent={ghost || b.opacity !== undefined}
              opacity={(b.opacity ?? 1) * (ghost ? 0.35 : 1)}
              depthWrite={!ghost}
              emissive={highlight ? '#2563eb' : '#000000'}
              emissiveIntensity={highlight ? 0.25 : 0}
            />
            {!b.plain && <Edges color="#3b2f2a" threshold={20} />}
          </mesh>
        ),
      )}
      {boxes
        .filter((b) => b.xray)
        .map((b, i) => (
          // drawn only where something stands in front of it (GreaterDepth), so hidden outlets still show
          <mesh key={`x${i}`} position={[b.x, b.z, b.y + 0.5]}>
            <boxGeometry args={[b.w + 3, b.h + 3, b.d]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.75} depthWrite={false} depthFunc={GreaterDepth} />
          </mesh>
        ))}
    </>
  )
}

/** A light source: unlit full colour plus a soft halo around it. */
function Glow({ b }: { b: Box }) {
  const { rotation, scale, geometry } = shapeOf(b)
  const round = Boolean(b.cylinder || b.ellipsoid)
  return (
    <group position={[b.x, b.z, b.y]}>
      <mesh rotation={rotation} scale={scale}>
        {geometry}
        <meshBasicMaterial color={b.color} toneMapped={false} />
      </mesh>
      {[1, 2].map((k) => {
        const grow = Math.min(10, Math.max(b.w, b.h) * 0.5) * k
        // round shapes are unit geometry scaled up, so grow them through the scale instead
        const s: [number, number, number] = round ? [scale[0] + grow, scale[1] + grow * 0.5, scale[2] + grow] : [1, 1, 1]
        return (
          <mesh key={k} rotation={rotation} scale={s}>
            {round ? geometry : <boxGeometry args={[b.w + grow, b.h + grow, b.d + grow * 0.5]} />}
            <meshBasicMaterial color={b.color} transparent opacity={0.22 / k} depthWrite={false} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

function ItemMesh({ item, items, room, selected, front }: { item: Item; items: Item[]; room: Room; selected: boolean; front: FrontWalls }) {
  if (item.mount === 'floor') {
    const layer = layerOf(item)
    const base = layer === 'ceiling' ? room.height - item.h : layer === 'decor' ? (supportOf(item, items)?.h ?? 0) : 0
    return (
      <group position={[item.x, base, item.y]} rotation={[0, -item.rotation * DEG, 0]}>
        <group position={[-item.w / 2, 0, -item.d / 2]}>
          <Boxes boxes={FLOOR_DEFS[item.kind].build3D(item)} highlight={selected} />
        </group>
      </group>
    )
  }
  const o = wallLocalToRoom(room, item, { x: 0, y: 0 })
  return (
    <group position={[o.x, 0, o.y]} rotation={[0, -wallFrame(room, item.wall).rotation * DEG, 0]}>
      {/* large items on the front walls would hide the room, so they are see-through; small ones like outlets stay solid */}
      <Boxes boxes={WALL_DEFS[item.kind].build3D(item)} highlight={selected} ghost={front[item.wall] && item.w * item.h > 1500} />
    </group>
  )
}

type Opening = { a0: number; a1: number; z0: number; z1: number }
type Piece = { pos: [number, number, number]; size: [number, number, number] }

/**
 * A wall split into boxes around its window openings, so sunlight only gets in through the windows.
 * Top and bottom walls run past the corners by the wall thickness.
 */
function wallPieces(room: Room, wall: Wall, openings: Opening[], height: number): Piece[] {
  const f = wallFrame(room, wall)
  const extend = wall === 'top' || wall === 'bottom' ? T : 0
  const start = -extend
  const end = f.length + extend
  const piece = (a0: number, a1: number, z0: number, z1: number): Piece | null => {
    if (a1 - a0 < 0.01 || z1 - z0 < 0.01) return null
    const along = (a0 + a1) / 2
    const x = f.start.x + f.dir.x * along - (f.inward.x * T) / 2
    const y = f.start.y + f.dir.y * along - (f.inward.y * T) / 2
    const horizontal = f.dir.x !== 0
    return { pos: [x, (z0 + z1) / 2, y], size: horizontal ? [a1 - a0, z1 - z0, T] : [T, z1 - z0, a1 - a0] }
  }
  const pieces: (Piece | null)[] = []
  let cursor = start
  for (const o of [...openings].sort((p, q) => p.a0 - q.a0)) {
    const z1 = Math.min(o.z1, height)
    if (o.a0 > cursor) pieces.push(piece(cursor, o.a0, 0, height))
    pieces.push(piece(Math.max(o.a0, cursor), o.a1, 0, o.z0))
    pieces.push(piece(Math.max(o.a0, cursor), o.a1, z1, height))
    cursor = Math.max(cursor, o.a1)
  }
  pieces.push(piece(cursor, end, 0, height))
  return pieces.filter((p): p is Piece => p !== null)
}

/**
 * Walls facing away from the camera are full height; the ones in front are a low curb plus faint glass.
 * Invisible copies of the front walls and the ceiling still cast shadows, so daylight only enters through windows.
 */
function Shell({ room, front, items }: { room: Room; front: FrontWalls; items: Item[] }) {
  const { length: L, width: W, height: H } = room
  const curb = 10
  const wall = '#ece4d8'
  const openings = (w: Wall): Opening[] =>
    items
      .filter((it): it is WallItem => it.mount === 'wall' && it.kind === 'window' && it.wall === w)
      .map((it) => ({ a0: it.offset, a1: it.offset + it.w, z0: it.elevation, z1: it.elevation + it.h }))
  return (
    <>
      <mesh position={[L / 2, -1, W / 2]} receiveShadow>
        <boxGeometry args={[L, 2, W]} />
        <meshLambertMaterial color={FLOOR_COLOR} />
      </mesh>
      {/* ceiling: invisible, only blocks the sun */}
      <mesh position={[L / 2, H + 1, W / 2]} castShadow>
        <boxGeometry args={[L + 2 * T, 2, W + 2 * T]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {WALL_KEYS.map((w) => {
        const pieces = wallPieces(room, w, openings(w), H)
        if (!front[w])
          return pieces.map((p, i) => (
            <mesh key={`${w}${i}`} position={p.pos} castShadow receiveShadow>
              <boxGeometry args={p.size} />
              <meshLambertMaterial color={wall} />
              <Edges color="#b9ab97" />
            </mesh>
          ))
        const full = wallPieces(room, w, [], H)[0]
        return (
          <group key={w}>
            <mesh position={[full.pos[0], curb / 2, full.pos[2]]} receiveShadow>
              <boxGeometry args={[full.size[0], curb, full.size[2]]} />
              <meshLambertMaterial color={wall} />
              <Edges color="#b9ab97" />
            </mesh>
            {/* faint glass gives items mounted on this wall something to sit on */}
            <mesh position={[full.pos[0], curb + (H - curb) / 2, full.pos[2]]} renderOrder={-1}>
              <boxGeometry args={[full.size[0], H - curb, full.size[2]]} />
              <meshLambertMaterial color={wall} transparent opacity={0.12} depthWrite={false} />
            </mesh>
            {pieces.map((p, i) => (
              <mesh key={i} position={p.pos} castShadow>
                <boxGeometry args={p.size} />
                <meshBasicMaterial colorWrite={false} depthWrite={false} />
              </mesh>
            ))}
          </group>
        )
      })}
    </>
  )
}

/** Sun (or moon) as a shadow-casting directional light aimed at the middle of the room. */
function Sun({ room, preset }: { room: Room; preset: LightPreset }) {
  const target = useMemo(() => new Object3D(), [])
  const light = useRef<DirectionalLight>(null)
  const s = sunPlanDirection(room, preset.bearing)
  const el = preset.elevation * DEG
  const dist = 2000
  const span = Math.hypot(room.length, room.width) / 2 + room.height
  useLayoutEffect(() => {
    target.position.set(room.length / 2, 0, room.width / 2)
    target.updateMatrixWorld()
    light.current?.shadow.camera.updateProjectionMatrix()
  })
  return (
    <>
      <primitive object={target} />
      <directionalLight
        ref={light}
        target={target}
        position={[room.length / 2 + s.x * Math.cos(el) * dist, Math.sin(el) * dist, room.width / 2 + s.y * Math.cos(el) * dist]}
        color={preset.sunColor}
        intensity={preset.sunIntensity}
        castShadow={preset.daylight}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={1.5}
        shadow-camera-left={-span}
        shadow-camera-right={span}
        shadow-camera-top={span}
        shadow-camera-bottom={-span}
        shadow-camera-near={10}
        shadow-camera-far={dist * 2}
      />
    </>
  )
}

function Lighting({ room, items, preset, lightsOn }: { room: Room; items: Item[]; preset: LightPreset | null; lightsOn: boolean }) {
  const lamps = lightsOn ? roomLights({ room, items }) : []
  return (
    <>
      {preset ? (
        <>
          <ambientLight color={preset.ambientColor} intensity={preset.ambientIntensity} />
          <Sun room={room} preset={preset} />
        </>
      ) : (
        <>
          <ambientLight intensity={1.6} />
          <directionalLight position={[room.length * 2, room.height * 3, room.width * 1.5]} intensity={1.8} />
          <directionalLight position={[-room.length, room.height, -room.width]} intensity={0.4} />
        </>
      )}
      {lamps.map((l) => (
        <pointLight key={l.id} position={[l.x, l.z, l.y]} color={l.color} intensity={l.intensity} distance={l.reach} decay={0} />
      ))}
    </>
  )
}

function FitCamera({ room }: { room: Room }) {
  // read the camera through get() so the effect mutates three.js state, not a hook value
  const get = useThree((s) => s.get)
  const size = useThree((s) => s.size)
  useEffect(() => {
    const camera = get().camera as OrthoCam
    const span = Math.hypot(room.length, room.width) + room.height
    camera.zoom = Math.min(size.width, size.height * 1.4) / (span * 1.15)
    camera.updateProjectionMatrix()
  }, [get, size, room])
  return null
}

export function IsoPreview() {
  const room = useStore((s) => s.room)
  const items = useStore((s) => s.items)
  const selectedId = useStore((s) => s.selectedId)
  const lighting = useStore((s) => s.lighting)
  const preset = lighting.time === 'off' ? null : PRESETS[lighting.time]
  const center: [number, number, number] = [room.length / 2, room.height * 0.25, room.width / 2]
  const dist = 2000
  // classic isometric direction: equal parts x, y, z
  const camPos: [number, number, number] = [center[0] + dist, center[1] + dist * 0.82, center[2] + dist]
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const [front, setFront] = useState<FrontWalls>(() => frontWallsFor(1, 1))
  const touch = useMediaQuery(TOUCH_QUERY)

  const updateFront = () => {
    const c = controls.current
    if (!c) return
    const p = c.object.position
    const next = frontWallsFor(p.x - c.target.x, p.z - c.target.z)
    setFront((prev) => (WALL_KEYS.every((k) => prev[k] === next[k]) ? prev : next))
  }

  /** Swing the camera a quarter turn around the room. */
  const turn = (deg: number) => {
    const c = controls.current
    if (!c) return
    const p = c.object.position
    const dx = p.x - c.target.x
    const dz = p.z - c.target.z
    const r = deg * DEG
    p.set(c.target.x + dx * Math.cos(r) - dz * Math.sin(r), p.y, c.target.z + dx * Math.sin(r) + dz * Math.cos(r))
    c.update()
    updateFront()
  }

  return (
    <div className="canvas-wrap iso">
      {/* preserveDrawingBuffer lets the AI bridge read the picture back as a PNG */}
      <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={[preset?.background ?? '#f7f4ee']} />
        <OrthographicCamera makeDefault position={camPos} near={1} far={10000} />
        <FitCamera room={room} />
        <OrbitControls ref={controls} target={center} enablePan maxPolarAngle={Math.PI / 2.1} onChange={updateFront} />
        <Lighting room={room} items={items} preset={preset} lightsOn={lighting.lightsOn} />
        <Shell room={room} front={front} items={items} />
        {items.map((it) => (
          <ItemMesh key={it.id} item={it} items={items} room={room} selected={it.id === selectedId} front={front} />
        ))}
      </Canvas>
      <div className="iso-turn">
        <button onClick={() => turn(-90)} title="Xoay góc nhìn 90° ngược chiều kim đồng hồ">
          ⟲ Xoay 90°
        </button>
        <button onClick={() => turn(90)} title="Xoay góc nhìn 90° theo chiều kim đồng hồ">
          ⟳ Xoay 90°
        </button>
      </div>
      <div className="iso-hint">
        {touch ? 'Kéo để xoay · chụm để zoom · hai ngón để di chuyển' : 'Kéo để xoay · cuộn để zoom · chuột phải để di chuyển'}
      </div>
    </div>
  )
}
