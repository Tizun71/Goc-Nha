// SPDX-License-Identifier: AGPL-3.0-or-later

import { Suspense, lazy, useState, type ComponentType } from 'react'
import { Ruler, Settings2, Sofa, X } from 'lucide-react'
import { useStore } from './store/store'
import { RoomCanvas } from './features/editor/RoomCanvas'
import { Toolbar } from './features/panels/Toolbar'
import { RoomForm } from './features/panels/RoomForm'
import { CatalogPanel } from './features/panels/CatalogPanel'
import { PropertiesPanel } from './features/panels/PropertiesPanel'
import { useBridge } from './ai/bridge'
import { MOBILE_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import { useShortcuts } from './app/useShortcuts'
import { useShareLink } from './app/useShareLink'
import { QuickActions } from './features/editor/QuickActions'
import { EmptyState } from './features/editor/EmptyState'

// three.js is large; load it only when the iso view is opened
const IsoPreview = lazy(() => import('./features/iso/IsoPreview').then((m) => ({ default: m.IsoPreview })))

type Sheet = 'room' | 'catalog' | 'props'

const SHEET_TABS: { id: Sheet; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'catalog', label: 'Nội thất', Icon: Sofa },
  { id: 'room', label: 'Phòng', Icon: Ruler },
  { id: 'props', label: 'Thuộc tính', Icon: Settings2 },
]

export default function App() {
  const view = useStore((s) => s.view)
  const empty = useStore((s) => s.items.length === 0)
  const aiAction = useBridge((s) => s.lastAction)
  const mobile = useMediaQuery(MOBILE_QUERY)
  const [sheet, setSheet] = useState<Sheet | null>(null)
  useShortcuts()
  useShareLink()

  const stage = (
    <main className="stage">
      {view === '2d' ? (
        <RoomCanvas />
      ) : (
        <Suspense fallback={<div className="loading">Đang tải 3D…</div>}>
          <IsoPreview />
        </Suspense>
      )}
      {empty && view === '2d' && !sheet && <EmptyState onOpenCatalog={mobile ? () => setSheet('catalog') : undefined} />}
      {aiAction && <div className="ai-toast">{aiAction}</div>}
      {mobile && !sheet && view === '2d' && <QuickActions onEdit={() => setSheet('props')} />}
    </main>
  )

  if (mobile) {
    return (
      <div className="app mobile">
        <Toolbar />
        {stage}
        {sheet && (
          <aside className="sheet">
            <button className="sheet-close" onClick={() => setSheet(null)} aria-label="Đóng">
              <X size={18} />
            </button>
            {sheet === 'room' && <RoomForm />}
            {/* close after picking so the new item is visible on the canvas */}
            {sheet === 'catalog' && <CatalogPanel onPick={() => setSheet(null)} />}
            {sheet === 'props' && <PropertiesPanel />}
          </aside>
        )}
        <nav className="tabbar">
          {SHEET_TABS.map((t) => (
            <button key={t.id} className={sheet === t.id ? 'on' : ''} onClick={() => setSheet(sheet === t.id ? null : t.id)}>
              <t.Icon size={16} /> {t.label}
            </button>
          ))}
        </nav>
      </div>
    )
  }

  return (
    <div className="app">
      <Toolbar />
      <aside className="sidebar left">
        <RoomForm />
        <CatalogPanel />
      </aside>
      {stage}
      <aside className="sidebar right">
        <PropertiesPanel />
      </aside>
    </div>
  )
}
