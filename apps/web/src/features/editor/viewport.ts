// SPDX-License-Identifier: AGPL-3.0-or-later

import type Konva from 'konva'
import { create } from 'zustand'
import type { Guide } from '@goc-nha/core/layout'

type Viewport = {
  zoom: number // screen pixels per centimetre
  x: number
  y: number
  guides: Guide[]
  dragging: boolean
  fitNonce: number
  /** Screen pixels at the bottom of the canvas covered by a floating card; fitting keeps the room above it. */
  insetBottom: number
  set: (patch: Partial<Omit<Viewport, 'set' | 'requestFit'>>) => void
  requestFit: () => void
}

export const useViewport = create<Viewport>()((set) => ({
  zoom: 1.5,
  x: 40,
  y: 40,
  guides: [],
  dragging: false,
  fitNonce: 0,
  insetBottom: 0,
  set: (patch) => set(patch),
  requestFit: () => set((s) => ({ fitNonce: s.fitNonce + 1 })),
}))

/** The mounted 2D stage, used for PNG export. */
export const stageHandle: { current: Konva.Stage | null } = { current: null }
