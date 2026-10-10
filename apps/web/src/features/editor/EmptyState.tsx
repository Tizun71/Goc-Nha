// SPDX-License-Identifier: AGPL-3.0-or-later

import { Sofa, Sprout } from 'lucide-react'
import { ROOM_TEMPLATES } from '@goc-nha/core/ops'
import { applyTemplate } from '../../app/templates'

type Props = {
  /** Mobile: open the catalog sheet. On desktop the catalog is already on screen. */
  onOpenCatalog?: () => void
}

/** Shown over an empty room: start from a template or from the catalog. */
export function EmptyState({ onOpenCatalog }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-card">
        <div className="empty-art" aria-hidden>
          <Sprout size={40} strokeWidth={1.5} />
        </div>
        <h2>Phòng còn trống</h2>
        <p>Nhập kích thước phòng thật, rồi bắt đầu từ một phòng mẫu hoặc thêm đồ từ danh mục.</p>
        <div className="empty-templates">
          {ROOM_TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => applyTemplate(t.id)} title={t.description}>
              <strong>{t.label}</strong>
              <span>{t.description}</span>
            </button>
          ))}
        </div>
        {onOpenCatalog && (
          <button className="empty-catalog" onClick={onOpenCatalog}>
            <Sofa size={16} /> Thêm đồ từ danh mục
          </button>
        )}
      </div>
    </div>
  )
}
