// SPDX-License-Identifier: AGPL-3.0-or-later

import { useLayoutEffect, useRef } from 'react'
import { Sofa, Sprout } from 'lucide-react'
import { ROOM_TEMPLATES } from '@goc-nha/core/ops'
import { applyTemplate } from '../../app/templates'
import { useViewport } from './viewport'

type Props = {
  /** Open the furniture library: the catalog tab on desktop, the catalog sheet on mobile. */
  onOpenCatalog: () => void
}

/** Shown under an empty room until the first item is added: start from a template or the library. */
export function EmptyState({ onOpenCatalog }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // keep the room fitted above the card, and give the space back once the card goes away
  useLayoutEffect(() => {
    const el = ref.current!
    const { set } = useViewport.getState()
    const ro = new ResizeObserver(() => set({ insetBottom: el.offsetHeight + 16 }))
    ro.observe(el)
    return () => {
      ro.disconnect()
      set({ insetBottom: 0 })
    }
  }, [])

  return (
    <div className="empty-state" ref={ref}>
      <div className="empty-card" role="region" aria-label="Bắt đầu">
        <div className="empty-head">
          <Sprout className="empty-art" size={28} strokeWidth={1.75} aria-hidden />
          <div>
            <h2>Bắt đầu thiết kế phòng của bạn</h2>
            <p>Chọn một mẫu phòng, hoặc thêm đồ từ thư viện. Có thể kéo đồ thả thẳng vào phòng.</p>
          </div>
        </div>
        <div className="empty-actions">
          {ROOM_TEMPLATES.map((t) => (
            <button key={t.id} className="chip" onClick={() => applyTemplate(t.id)} title={t.description}>
              {t.label}
            </button>
          ))}
          <button className="primary" onClick={onOpenCatalog}>
            <Sofa size={16} /> Thêm nội thất
          </button>
        </div>
      </div>
    </div>
  )
}
