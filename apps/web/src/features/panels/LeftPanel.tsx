// SPDX-License-Identifier: AGPL-3.0-or-later

import { PanelLeftClose, PanelLeftOpen, Ruler, Sofa } from 'lucide-react'
import type { ComponentType } from 'react'
import { CatalogPanel } from './CatalogPanel'
import { RoomForm } from './RoomForm'

export type LeftTab = 'catalog' | 'room'

const TABS: { id: LeftTab; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'catalog', label: 'Nội thất', Icon: Sofa },
  { id: 'room', label: 'Phòng', Icon: Ruler },
]

type Props = {
  tab: LeftTab
  onTab: (tab: LeftTab) => void
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

/** Left sidebar: the furniture library and the room settings as two tabs. Collapses to an icon rail. */
export function LeftPanel({ tab, onTab, collapsed, onCollapse }: Props) {
  if (collapsed) {
    return (
      <aside className="sidebar left rail" aria-label="Thiết kế">
        <button className="icon ghost" onClick={() => onCollapse(false)} aria-label="Mở bảng bên trái" title="Mở bảng">
          <PanelLeftOpen size={16} />
        </button>
        {TABS.map((t) => (
          <button
            key={t.id}
            className="icon ghost"
            onClick={() => {
              onTab(t.id)
              onCollapse(false)
            }}
            aria-label={t.label}
            title={t.label}
          >
            <t.Icon size={16} />
          </button>
        ))}
      </aside>
    )
  }

  return (
    <aside className="sidebar left" aria-label="Thiết kế">
      <div className="panel-tabs">
        <div className="tabs" role="tablist" aria-label="Bảng thiết kế">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`tabpanel-${t.id}`}
              className={tab === t.id ? 'on' : ''}
              onClick={() => onTab(t.id)}
            >
              <t.Icon size={16} /> {t.label}
            </button>
          ))}
        </div>
        <button className="icon ghost" onClick={() => onCollapse(true)} aria-label="Thu gọn bảng bên trái" title="Thu gọn">
          <PanelLeftClose size={16} />
        </button>
      </div>
      <div className="panel-body" role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'catalog' ? <CatalogPanel /> : <RoomForm />}
      </div>
    </aside>
  )
}
