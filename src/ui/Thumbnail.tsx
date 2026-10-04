import { useEffect, useRef } from 'react'
import type { Kind } from '../model/types'
import { FLOOR_DEFS, WALL_DEFS, isWallKind } from '../furniture/catalog'
import { WALL_THICKNESS as T } from '../lib/geometry'

const SIZE = 56

/** Small preview drawn with the same procedural function as the editor. */
export function Thumbnail({ kind }: { kind: Kind }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const dpr = window.devicePixelRatio || 1
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    const c = canvas.getContext('2d')!
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.clearRect(0, 0, SIZE, SIZE)

    if (isWallKind(kind)) {
      const def = WALL_DEFS[kind]
      const it = { id: kind, mount: 'wall' as const, kind, wall: 'top' as const, offset: 0, ...def.defaults, hinge: 'left' as const, opening: 'in' as const }
      const depth = def.depth(it)
      const s = Math.min((SIZE - 8) / it.w, (SIZE - 8) / (T + depth))
      c.translate((SIZE - it.w * s) / 2, (SIZE - (T + depth) * s) / 2 + T * s)
      c.scale(s, s)
      c.fillStyle = '#5b4f45'
      c.fillRect(-20, -T, it.w + 40, T)
      def.draw2D(c, it, 1 / s)
    } else {
      const def = FLOOR_DEFS[kind]
      const it = { id: kind, mount: 'floor' as const, kind, x: 0, y: 0, rotation: 0, ...def.defaults }
      const s = Math.min((SIZE - 8) / it.w, (SIZE - 8) / it.d)
      c.translate((SIZE - it.w * s) / 2, (SIZE - it.d * s) / 2)
      c.scale(s, s)
      def.draw2D(c, it, 1 / s)
    }
  }, [kind])

  return <canvas ref={ref} style={{ width: SIZE, height: SIZE }} />
}
