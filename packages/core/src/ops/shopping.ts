// SPDX-License-Identifier: AGPL-3.0-or-later

import type { FloorItem, Item, Kind, RoomDoc, WallItem } from '../model/types'
import { CATEGORIES, defOf, type Category } from '../catalog/catalog'
import { isSolid } from '../model/layers'

/** Parts of the room itself, not things to buy. */
const FIXTURES = new Set<Kind>(['door', 'window', 'powerOutlet'])

export type ShoppingLine = {
  kind: Kind
  label: string
  en: string
  category: Category
  count: number
  /** Real size to check against the product, in cm. Floor: w × d × h; wall: w × h. */
  size: string
  color: string
  /** Set when the item, carried in one piece, does not pass through any door of the room. */
  doorWarning?: string
}

/**
 * Whether a box passes through a door opening in one piece: carried along its longest side,
 * the other two sides must fit the opening. Tilting through the diagonal is not counted,
 * so the answer errs on the safe side.
 */
export function fitsThroughDoor(item: Pick<FloorItem, 'w' | 'd' | 'h'>, door: Pick<WallItem, 'w' | 'h'>): boolean {
  const [a, b] = [item.w, item.d, item.h].sort((x, y) => x - y)
  const [narrow, tall] = [door.w, door.h].sort((x, y) => x - y)
  return a <= narrow && b <= tall
}

function doorWarningOf(it: Item, doors: WallItem[]): string | undefined {
  if (doors.length === 0 || !isSolid(it) || doors.some((d) => fitsThroughDoor(it, d))) return undefined
  const widest = doors.reduce((a, b) => (b.w > a.w ? b : a))
  return `Có thể không lọt cửa ${widest.w} × ${widest.h} cm nếu nguyên khối; hỏi shop có tháo lắp được không`
}

function sizeOf(it: Item) {
  return it.mount === 'floor' ? `${it.w} × ${it.d} × ${it.h} cm` : `${it.w} × ${it.h} cm`
}

/** The items to buy, with identical items (same kind, size and colour) counted together, in catalog order. */
export function shoppingList(doc: RoomDoc): ShoppingLine[] {
  const lines = new Map<string, ShoppingLine>()
  const doors = doc.items.filter((it): it is WallItem => it.kind === 'door')
  for (const it of doc.items) {
    if (FIXTURES.has(it.kind)) continue
    const def = defOf(it.kind)
    const size = sizeOf(it)
    const color = it.color ?? def.color
    const key = `${it.kind}|${size}|${color}`
    const line = lines.get(key)
    if (line) line.count++
    else {
      const doorWarning = doorWarningOf(it, doors)
      lines.set(key, { kind: it.kind, label: def.label, en: def.en, category: def.category, count: 1, size, color, ...(doorWarning ? { doorWarning } : {}) })
    }
  }
  const order = (c: Category) => CATEGORIES.findIndex((x) => x.id === c)
  return [...lines.values()].sort((a, b) => order(a.category) - order(b.category) || a.label.localeCompare(b.label, 'vi'))
}

/** Plain-text list to paste into a chat or notes app before going to the shop. */
export function shoppingListText(doc: RoomDoc): string {
  const { length, width, height } = doc.room
  const lines = shoppingList(doc).map((l) => {
    const line = `- ${l.count > 1 ? `${l.count} × ` : ''}${l.label}: ${l.size}`
    return l.doorWarning ? `${line}\n  ⚠ ${l.doorWarning}` : line
  })
  return [`Danh sách mua sắm (phòng ${length} × ${width} cm, cao ${height} cm)`, ...lines].join('\n')
}
