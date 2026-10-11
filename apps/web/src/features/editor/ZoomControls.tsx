// SPDX-License-Identifier: AGPL-3.0-or-later

import { Maximize2, Minus, Plus } from 'lucide-react'
import { zoomAround } from '@goc-nha/core/geometry'
import { stageHandle, useViewport } from './viewport'
import { MAX_ZOOM, MIN_ZOOM } from './RoomCanvas'

/** Zoom around the centre of the canvas. */
function zoomBy(factor: number) {
  const stage = stageHandle.current
  if (!stage) return
  const vp = useViewport.getState()
  vp.set(zoomAround(vp, factor, { x: stage.width() / 2, y: stage.height() / 2 }, MIN_ZOOM, MAX_ZOOM))
}

/** Floating zoom buttons in the canvas corner, for people without a scroll wheel or trackpad. */
export function ZoomControls() {
  return (
    <div className="zoom-controls" role="group" aria-label="Thu phóng">
      <button className="icon" onClick={() => zoomBy(1 / 1.25)} aria-label="Thu nhỏ" title="Thu nhỏ (cuộn chuột)">
        <Minus size={16} />
      </button>
      <button className="icon" onClick={() => zoomBy(1.25)} aria-label="Phóng to" title="Phóng to (cuộn chuột)">
        <Plus size={16} />
      </button>
      <button className="icon" onClick={() => useViewport.getState().requestFit()} aria-label="Vừa khung" title="Vừa khung: hiện cả phòng">
        <Maximize2 size={16} />
      </button>
    </div>
  )
}
