// SPDX-License-Identifier: AGPL-3.0-or-later

import { Suspense, lazy, useState, type ComponentType } from 'react'
import { PanelRightClose, PanelRightOpen, Ruler, Settings2, Sofa, X } from 'lucide-react'
import { useStore } from './store/store'
import { RoomCanvas } from './features/editor/RoomCanvas'
import { Toolbar } from './features/panels/Toolbar'
import { RoomForm } from './features/panels/RoomForm'
import { CatalogPanel } from './features/panels/CatalogPanel'
import { LeftPanel, type LeftTab } from './features/panels/LeftPanel'
import { PropertiesPanel } from './features/panels/PropertiesPanel'
import { useBridge } from './ai/bridge'
import { MOBILE_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import { useShortcuts } from './app/useShortcuts'
import { useShareLink } from './app/useShareLink'
import { QuickActions } from './features/editor/QuickActions'
import { EmptyState } from './features/editor/EmptyState'
import { ZoomControls } from './features/editor/ZoomControls'
import { usePersistentState } from './hooks/usePersistentState'

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
  const [leftTab, setLeftTab] = usePersistentState<LeftTab>('dmr-left-tab', 'catalog')
  const [leftCollapsed, setLeftCollapsed] = usePersistentState<boolean>('dmr-left-collapsed', false)
  const [rightCollapsed, setRightCollapsed] = usePersistentState<boolean>('dmr-right-collapsed', false)
  const openCatalog = () => {
    if (mobile) return setSheet('catalog')
    setLeftTab('catalog')
    setLeftCollapsed(false)
  }
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
      {empty && view === '2d' && !sheet && <EmptyState onOpenCatalog={openCatalog} />}
      {view === '2d' && !(mobile && sheet) && <ZoomControls />}
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
    <div className={`app ${leftCollapsed ? 'left-collapsed' : ''} ${rightCollapsed ? 'right-collapsed' : ''}`}>
      <Toolbar />
      <LeftPanel tab={leftTab} onTab={setLeftTab} collapsed={leftCollapsed} onCollapse={setLeftCollapsed} />
      {stage}
      {rightCollapsed ? (
        <aside className="sidebar right rail" aria-label="Thuộc tính">
          <button className="icon ghost" onClick={() => setRightCollapsed(false)} aria-label="Mở bảng thuộc tính" title="Mở bảng thuộc tính">
            <PanelRightOpen size={16} />
          </button>
        </aside>
      ) : (
        <aside className="sidebar right" aria-label="Thuộc tính">
          <button className="icon ghost panel-collapse" onClick={() => setRightCollapsed(true)} aria-label="Thu gọn bảng thuộc tính" title="Thu gọn">
            <PanelRightClose size={16} />
          </button>
          <PropertiesPanel />
        </aside>
      )}
    </div>
  )
}
