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

function isItem(v: unknown): v is Item {
  const it = v as Item
  if (!it || typeof it.id !== 'string' || !isNum(it.w) || !isNum(it.h)) return false
  if (it.mount === 'floor') return it.kind in FLOOR_DEFS && isNum(it.x) && isNum(it.y) && isNum(it.d) && isNum(it.rotation)
  if (it.mount === 'wall') return it.kind in WALL_DEFS && ['top', 'right', 'bottom', 'left'].includes(it.wall) && isNum(it.offset)
  return false
}

/** Parse an exported file; throws a readable error when it is not one. */
export function parseDoc(text: string): RoomDoc {
  const raw = JSON.parse(text)
  const room = raw?.room
  if (!room || !isNum(room.length) || !isNum(room.width) || !isNum(room.height)) throw new Error('File không có thông tin phòng hợp lệ')
  if (!Array.isArray(raw.items)) throw new Error('File không có danh sách đồ đạc')
  return {
    room: { length: room.length, width: room.width, height: room.height, ...(isNum(room.north) ? { north: room.north } : {}) },
    items: migrateItems(raw.items).filter(isItem),
  }
}
