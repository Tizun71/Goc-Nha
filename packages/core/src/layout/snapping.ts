import type { Rect } from '../geometry/geometry'

export type Guide = { axis: 'x' | 'y'; at: number }

/**
 * Move `rect` so its nearest edge (or centre) lines up with a target line when within `threshold`.
 * Returns the offset to apply and the guide lines that matched.
 */
export function snapRect(
  rect: Rect,
  targets: { xs: number[]; ys: number[] },
  threshold: number,
): { dx: number; dy: number; guides: Guide[] } {
  const pick = (edges: number[], lines: number[]) => {
    let best: { delta: number; at: number } | null = null
    for (const e of edges)
      for (const l of lines) {
        const delta = l - e
        if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta))) best = { delta, at: l }
      }
    return best
  }
  const sx = pick([rect.minX, rect.maxX, (rect.minX + rect.maxX) / 2], targets.xs)
  const sy = pick([rect.minY, rect.maxY, (rect.minY + rect.maxY) / 2], targets.ys)
  const guides: Guide[] = []
  if (sx) guides.push({ axis: 'x', at: sx.at })
  if (sy) guides.push({ axis: 'y', at: sy.at })
  return { dx: sx?.delta ?? 0, dy: sy?.delta ?? 0, guides }
}

/** Snap lines from the room walls and the edges of other items. */
export function snapTargets(roomLength: number, roomWidth: number, others: Rect[]) {
  const xs = [0, roomLength]
  const ys = [0, roomWidth]
  for (const r of others) {
    xs.push(r.minX, r.maxX)
    ys.push(r.minY, r.maxY)
  }
  return { xs, ys }
}
