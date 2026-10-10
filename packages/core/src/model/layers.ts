// SPDX-License-Identifier: AGPL-3.0-or-later

import type { FloorItem, Item } from './types'
import { floorCorners, type Vec } from '../geometry/geometry'
import { FLOOR_DEFS, type Layer } from '../catalog/catalog'

export type { Layer }

/** Only solid items take part in overlap and door-swing checks; see Layer in the catalog. */
export function layerOf(item: Pick<FloorItem, 'kind'>): Layer {
  return FLOOR_DEFS[item.kind]?.layer ?? 'solid'
}

export const isSolid = (it: Item): it is FloorItem => it.mount === 'floor' && layerOf(it) === 'solid'

/** Drawing order on the plan, bottom to top. Wall items are drawn between decor and ceiling. */
export const LAYER_ORDER: Record<Layer, number> = { rug: 0, solid: 1, decor: 2, ceiling: 4 }

function insideConvex(p: Vec, poly: Vec[]) {
  let sign = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
    if (cross === 0) continue
    if (sign === 0) sign = Math.sign(cross)
    else if (Math.sign(cross) !== sign) return false
  }
  return true
}

/** The solid item a decor item stands on (the tallest one under its centre), if any. */
export function supportOf(item: FloorItem, items: Item[]): FloorItem | null {
  let best: FloorItem | null = null
  for (const other of items)
    if (other.id !== item.id && isSolid(other) && insideConvex(item, floorCorners(other)) && (!best || other.h > best.h)) best = other
  return best
}
