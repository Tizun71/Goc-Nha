import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Item, Kind, Room, RoomDoc, WallItem } from '@goc-nha/core/model'
import { FLOOR_DEFS, WALL_DEFS, isWallKind } from '@goc-nha/core/catalog'
import { clampWallItem, nearestWall, newId, type Vec } from '@goc-nha/core/geometry'
import { migrateItems } from '@goc-nha/core/serialization'
import { PRESETS, type TimeOfDay } from '@goc-nha/core/orientation'

const HISTORY_LIMIT = 100

export const DEFAULT_ROOM: Room = { length: 400, width: 300, height: 270 }

type State = RoomDoc & {
  selectedId: string | null
  view: '2d' | 'iso'
  past: RoomDoc[]
  future: RoomDoc[]
  /** Daylight simulation; a view setting, not part of the undo history. */
  lighting: { time: TimeOfDay; lightsOn: boolean }
}

type Actions = {
  setRoom: (patch: Partial<Room>) => void
  addItem: (kind: Kind, at?: Vec) => void
  /** Pass record=false for continuous edits (dragging) after calling checkpoint() once. */
  updateItem: (id: string, patch: Partial<Item>, record?: boolean) => void
  checkpoint: () => void
  removeItem: (id: string) => void
  duplicateItem: (id: string) => void
  rotateItem: (id: string, deg: number) => void
  select: (id: string | null) => void
  setView: (view: State['view']) => void
  /** Changing the time also switches room lights to that time's default (on at night). */
  setLighting: (patch: Partial<State['lighting']>) => void
  loadDoc: (doc: RoomDoc) => void
  /** Replace room and items as one undo step, e.g. a batch of AI changes. */
  commitDoc: (doc: RoomDoc, selectId?: string | null) => void
  clearItems: () => void
  undo: () => void
  redo: () => void
}

export function makeItem(kind: Kind, room: Room, at?: Vec): Item {
  const id = newId()
  if (isWallKind(kind)) {
    const def = WALL_DEFS[kind]
    const target = at ?? (kind === 'door' ? { x: room.length / 2, y: room.width } : { x: room.length / 2, y: 0 })
    const { wall, along } = nearestWall(room, target)
    const item: WallItem = {
      id,
      mount: 'wall',
      kind,
      wall,
      offset: along - def.defaults.w / 2,
      w: def.defaults.w,
      h: def.defaults.h,
      elevation: Math.max(0, Math.min(def.defaults.elevation, room.height - def.defaults.h)),
      ...(kind === 'door' ? { hinge: 'left' as const, opening: 'in' as const } : {}),
    }
    return clampWallItem(room, item)
  }
  const def = FLOOR_DEFS[kind]
  const p = at ?? { x: room.length / 2, y: room.width / 2 }
  return { id, mount: 'floor', kind, x: Math.round(p.x), y: Math.round(p.y), ...def.defaults, rotation: 0 }
}

const docOf = (s: State): RoomDoc => ({ room: s.room, items: s.items })

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => {
      const record = () =>
        set((s) => ({ past: [...s.past, docOf(s)].slice(-HISTORY_LIMIT), future: [] }))

      return {
        room: DEFAULT_ROOM,
        items: [],
        selectedId: null,
        view: '2d',
        past: [],
        future: [],
        lighting: { time: 'off', lightsOn: false },

        checkpoint: record,

        setRoom: (patch) => {
          record()
          set((s) => {
            const room = { ...s.room, ...patch }
            return { room, items: s.items.map((it) => (it.mount === 'wall' ? clampWallItem(room, it) : it)) }
          })
        },

        addItem: (kind, at) => {
          record()
          const item = makeItem(kind, get().room, at)
          set((s) => ({ items: [...s.items, item], selectedId: item.id }))
        },

        updateItem: (id, patch, rec = true) => {
          if (rec) record()
          set((s) => ({
            items: s.items.map((it) => {
              if (it.id !== id) return it
              const next = { ...it, ...patch } as Item
              return next.mount === 'wall' ? clampWallItem(s.room, next) : next
            }),
          }))
        },

        removeItem: (id) => {
          record()
          set((s) => ({ items: s.items.filter((it) => it.id !== id), selectedId: s.selectedId === id ? null : s.selectedId }))
        },

        duplicateItem: (id) => {
          const src = get().items.find((it) => it.id === id)
          if (!src) return
          record()
          const copy: Item =
            src.mount === 'floor'
              ? { ...src, id: newId(), x: src.x + 20, y: src.y + 20 }
              : clampWallItem(get().room, { ...src, id: newId(), offset: src.offset + src.w + 10 })
          set((s) => ({ items: [...s.items, copy], selectedId: copy.id }))
        },

        rotateItem: (id, deg) => {
          const it = get().items.find((i) => i.id === id)
          if (!it || it.mount !== 'floor') return
          get().updateItem(id, { rotation: (((it.rotation + deg) % 360) + 360) % 360 })
        },

        select: (id) => set({ selectedId: id }),
        setView: (view) => set({ view }),
        setLighting: (patch) =>
          set((s) => {
            const time = patch.time ?? s.lighting.time
            const lightsOn =
              patch.lightsOn ?? (patch.time && patch.time !== s.lighting.time ? time !== 'off' && PRESETS[time].lightsOn : s.lighting.lightsOn)
            return { lighting: { time, lightsOn } }
          }),

        loadDoc: (doc) => {
          record()
          set({ room: doc.room, items: doc.items, selectedId: null })
        },

        commitDoc: (doc, selectId) => {
          record()
          set((s) => ({
            room: doc.room,
            items: doc.items,
            selectedId:
              selectId !== undefined ? selectId : doc.items.some((it) => it.id === s.selectedId) ? s.selectedId : null,
          }))
        },

        clearItems: () => {
          record()
          set({ items: [], selectedId: null })
        },

        undo: () =>
          set((s) => {
            const prev = s.past.at(-1)
            if (!prev) return s
            return { ...prev, past: s.past.slice(0, -1), future: [docOf(s), ...s.future], selectedId: null }
          }),

        redo: () =>
          set((s) => {
            const next = s.future[0]
            if (!next) return s
            return { ...next, past: [...s.past, docOf(s)], future: s.future.slice(1), selectedId: null }
          }),
      }
    },
    {
      // storage key kept from the old app name so saved rooms survive the rename
      name: 'design-my-room',
      version: 2,
      partialize: (s) => ({ room: s.room, items: s.items, lighting: s.lighting }),
      // v2 renamed the tree shelf to the fishbone shelf
      migrate: (persisted) => {
        const s = persisted as RoomDoc
        return { ...s, items: migrateItems(s.items ?? []) as Item[] }
      },
    },
  ),
)
