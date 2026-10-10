// SPDX-License-Identifier: AGPL-3.0-or-later

// Browser side of the AI bridge. Connects to the hub in the Vite dev server and runs
// requests from MCP servers (Claude Desktop / Claude Code) against the live store.

import { create } from 'zustand'
import { useStore } from '../store/store'
import type { Room, RoomDoc } from '@goc-nha/core/model'
import { defOf } from '@goc-nha/core/catalog'
import { stageHandle } from '../features/editor/viewport'
import { renderPlanDataUrl } from '../features/editor/exportImage'
import { PRESETS, windowSunPatch, type TimeOfDay } from '@goc-nha/core/orientation'
import type { WallItem } from '@goc-nha/core/model'
import { applyOps, catalog, checkLayout, describeItem, describeRoom, shoppingList, validateRoom, type Op } from '@goc-nha/core/ops'

type BridgeState = {
  connected: boolean
  agents: number
  lastAction: string | null
}

export const useBridge = create<BridgeState>()(() => ({ connected: false, agents: 0, lastAction: null }))

let actionTimer: ReturnType<typeof setTimeout> | undefined
function announce(text: string) {
  useBridge.setState({ lastAction: text })
  clearTimeout(actionTimer)
  actionTimer = setTimeout(() => useBridge.setState({ lastAction: null }), 5000)
}

const doc = (): RoomDoc => {
  const s = useStore.getState()
  return { room: s.room, items: s.items }
}

function roomState() {
  const d = doc()
  return {
    room: describeRoom(d.room),
    items: d.items.map((it) => describeItem(d, it)),
    layout: checkLayout(d),
    selectedId: useStore.getState().selectedId,
  }
}

function runOps(ops: Op[]) {
  if (!Array.isArray(ops) || ops.length === 0) throw new Error('no changes given')
  const before = doc()
  const result = applyOps(before, ops)
  useStore.getState().commitDoc(result.doc, result.touched.at(-1) ?? null)
  const labels = (ids: string[], from: RoomDoc) => ids.map((id) => defOf(from.items.find((it) => it.id === id)!.kind).label)
  const summary = [
    result.touched.length ? `sửa/thêm ${labels(result.touched, result.doc).join(', ')}` : '',
    result.removed.length ? `xoá ${labels(result.removed, before).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' · ')
  announce(`AI: ${summary}`)
  return {
    changed: result.touched.map((id) => describeItem(result.doc, result.doc.items.find((it) => it.id === id)!)),
    removed: result.removed,
    notes: result.notes,
    layout: checkLayout(result.doc),
  }
}

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)))
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function waitFor<T>(get: () => T | null | undefined, timeoutMs: number): Promise<T | null> {
  const end = Date.now() + timeoutMs
  while (Date.now() < end) {
    const v = get()
    if (v) return v
    await sleep(50)
  }
  return null
}

/** Capture the plan or the iso view as PNG, switching views temporarily if needed. */
async function snapshot(view: '2d' | 'iso') {
  const store = useStore.getState()
  const previous = store.view
  if (previous !== view) store.setView(view)
  try {
    let url: string | null
    if (view === '2d') {
      await waitFor(() => stageHandle.current, 3000)
      await nextFrame()
      await nextFrame()
      url = renderPlanDataUrl(1.5)
    } else {
      const canvas = await waitFor(() => document.querySelector<HTMLCanvasElement>('.iso canvas'), 8000)
      await sleep(800) // let three.js draw a few frames
      url = canvas?.toDataURL('image/png') ?? null
    }
    if (!url) throw new Error('could not capture the view')
    return { mimeType: 'image/png', data: url.slice(url.indexOf(',') + 1) }
  } finally {
    if (previous !== view) useStore.getState().setView(previous)
  }
}

type Params = Record<string, unknown>

const methods: Record<string, (p: Params) => unknown> = {
  get_room: () => roomState(),
  list_catalog: () => catalog(),
  check_layout: () => checkLayout(doc()),
  shopping_list: () => shoppingList(doc()),
  set_room: (p) => {
    const room = validateRoom(useStore.getState().room, p as Partial<Room>)
    useStore.getState().commitDoc({ room, items: doc().items })
    announce('AI: đổi thông số phòng')
    return roomState()
  },
  add_item: (p) => runOps([{ ...(p as object), op: 'add' } as Op]),
  update_item: (p) => runOps([{ ...(p as object), op: 'update' } as Op]),
  remove_item: (p) => runOps([{ op: 'remove', id: String(p.id) }]),
  apply_changes: (p) => runOps(p.changes as Op[]),
  undo: () => {
    if (useStore.getState().past.length === 0) throw new Error('nothing to undo')
    useStore.getState().undo()
    announce('AI: hoàn tác')
    return roomState()
  },
  redo: () => {
    if (useStore.getState().future.length === 0) throw new Error('nothing to redo')
    useStore.getState().redo()
    announce('AI: làm lại')
    return roomState()
  },
  set_lighting: (p) => {
    const time = p.time as TimeOfDay | undefined
    if (time !== undefined && !['off', 'morning', 'noon', 'afternoon', 'night'].includes(time)) throw new Error('time must be off, morning, noon, afternoon or night')
    useStore.getState().setLighting({ ...(time ? { time } : {}), ...(typeof p.lightsOn === 'boolean' ? { lightsOn: p.lightsOn } : {}) })
    const { lighting, room, items } = useStore.getState()
    announce(`AI: ánh sáng ${lighting.time === 'off' ? 'mặc định' : PRESETS[lighting.time].label}`)
    const preset = lighting.time === 'off' ? null : PRESETS[lighting.time]
    return {
      lighting,
      sun: preset && { bearing: preset.bearing, elevation: preset.elevation, hour: preset.hour, daylight: preset.daylight },
      // which windows get direct sun at this time
      sunnyWindows: preset
        ? items
            .filter((it): it is WallItem => it.kind === 'window')
            .map((w) => ({ id: w.id, wall: w.wall, getsSun: windowSunPatch(room, w, preset) !== null }))
        : [],
    }
  },
  snapshot: (p) => snapshot(p.view === 'iso' ? 'iso' : '2d'),
}

export function startBridge() {
  const url = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/__dmr?role=app`
  let retry: ReturnType<typeof setTimeout> | undefined

  const connect = () => {
    const ws = new WebSocket(url)
    ws.onopen = () => useBridge.setState({ connected: true })
    ws.onclose = () => {
      useBridge.setState({ connected: false, agents: 0 })
      clearTimeout(retry)
      retry = setTimeout(connect, 2000)
    }
    ws.onmessage = async (ev) => {
      const msg = JSON.parse(String(ev.data))
      if (msg.type === 'agents') return useBridge.setState({ agents: msg.count })
      if (msg.type === 'replaced') {
        // another tab took over; stop reconnecting from this one
        ws.onclose = null
        useBridge.setState({ connected: false, agents: 0 })
        return
      }
      if (msg.type !== 'request') return
      const method = methods[msg.method]
      try {
        if (!method) throw new Error(`unknown method "${msg.method}"`)
        const result = await method(msg.params ?? {})
        ws.send(JSON.stringify({ type: 'response', id: msg.id, result }))
      } catch (e) {
        ws.send(JSON.stringify({ type: 'response', id: msg.id, error: (e as Error).message }))
      }
    }
  }
  connect()
}
