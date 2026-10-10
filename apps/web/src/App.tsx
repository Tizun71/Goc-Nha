import { Suspense, lazy, useState } from 'react'
import { useStore } from './store/store'
import { RoomCanvas } from './features/editor/RoomCanvas'
import { Toolbar } from './features/panels/Toolbar'
import { RoomForm } from './features/panels/RoomForm'
import { CatalogPanel } from './features/panels/CatalogPanel'
import { PropertiesPanel } from './features/panels/PropertiesPanel'
import { useBridge } from './ai/bridge'
import { MOBILE_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import { useShortcuts } from './app/useShortcuts'
import { QuickActions } from './features/editor/QuickActions'

// three.js is large; load it only when the iso view is opened
const IsoPreview = lazy(() => import('./features/iso/IsoPreview').then((m) => ({ default: m.IsoPreview })))

type Sheet = 'room' | 'catalog' | 'props'

const SHEET_TABS: { id: Sheet; label: string }[] = [
  { id: 'catalog', label: '🛋 Nội thất' },
  { id: 'room', label: '📐 Phòng' },
  { id: 'props', label: '⚙ Thuộc tính' },
]

export default function App() {
  const view = useStore((s) => s.view)
  const aiAction = useBridge((s) => s.lastAction)
  const mobile = useMediaQuery(MOBILE_QUERY)
  const [sheet, setSheet] = useState<Sheet | null>(null)
  useShortcuts()

  const stage = (
    <main className="stage">
      {view === '2d' ? (
        <RoomCanvas />
      ) : (
        <Suspense fallback={<div className="loading">Đang tải 3D…</div>}>
          <IsoPreview />
        </Suspense>
      )}
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
              ✕
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
              {t.label}
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
