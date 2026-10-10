// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Item, RoomDoc } from '../model/types'
import { FLOOR_DEFS, WALL_DEFS } from '../catalog/catalog'

/** Serialise a room for a JSON export; parseDoc reads it back. */
export function serializeDoc(doc: RoomDoc): string {
  return JSON.stringify({ app: 'goc-nha', version: 1, ...doc }, null, 2)
}

const RENAMED_KINDS: Record<string, string> = { treeShelf: 'fishboneShelf' }

/** Map kinds renamed since a file was saved, so old saves keep their items. */
export function migrateItems(items: unknown[]): unknown[] {
  return items.map((it) => {
    const kind = (it as { kind?: string })?.kind
    return kind && kind in RENAMED_KINDS ? { ...(it as object), kind: RENAMED_KINDS[kind] } : it
  })
}

const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
const isSize = (v: unknown) => isNum(v) && (v as number) > 0

function isItem(v: unknown): v is Item {
  const it = v as Item
  if (!it || typeof it.id !== 'string' || !isSize(it.w) || !isSize(it.h)) return false
  if (it.mount === 'floor') return it.kind in FLOOR_DEFS && isNum(it.x) && isNum(it.y) && isSize(it.d) && isNum(it.rotation)
  if (it.mount === 'wall') return it.kind in WALL_DEFS && ['top', 'right', 'bottom', 'left'].includes(it.wall) && isNum(it.offset) && isNum(it.elevation)
  return false
}

/** Items keyed by id must have unique ids; keep the first of any duplicates. */
function uniqueIds(items: Item[]): Item[] {
  const seen = new Set<string>()
  return items.filter((it) => !seen.has(it.id) && seen.add(it.id))
}

/** Parse an exported file; throws a readable error when it is not one. */
export function parseDoc(text: string): RoomDoc {
  return docFromRaw(JSON.parse(text))
}

/**
 * Rebuild a room from untrusted data (a save in localStorage, a file, a link).
 * Returns null instead of throwing, for callers that fall back to a default room.
 */
export function restoreDoc(raw: unknown): RoomDoc | null {
  try {
    return docFromRaw(raw)
  } catch {
    return null
  }
}

function docFromRaw(input: unknown): RoomDoc {
  const raw = input as { room?: Record<string, unknown>; items?: unknown } | null | undefined
  const room = raw?.room
  if (!room || !isSize(room.length) || !isSize(room.width) || !isSize(room.height)) throw new Error('File không có thông tin phòng hợp lệ')
  if (!Array.isArray(raw.items)) throw new Error('File không có danh sách đồ đạc')
  return {
    room: {
      length: room.length as number,
      width: room.width as number,
      height: room.height as number,
      ...(isNum(room.north) ? { north: room.north as number } : {}),
    },
    items: uniqueIds(migrateItems(raw.items).filter(isItem)),
  }
}
