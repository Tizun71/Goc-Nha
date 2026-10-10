import { Suspense, lazy, useEffect, useState } from 'react'
import { useStore } from './model/store'
import { RoomCanvas } from './editor/RoomCanvas'
import { Toolbar } from './ui/Toolbar'
import { RoomForm } from './ui/RoomForm'
import { CatalogPanel } from './ui/CatalogPanel'
import { PropertiesPanel } from './ui/PropertiesPanel'
import { useBridge } from './ai/bridge'
import { MOBILE_QUERY, useMediaQuery } from './lib/useMedia'

// three.js is large; load it only when the iso view is opened
const IsoPreview = lazy(() => import('./iso/IsoPreview').then((m) => ({ default: m.IsoPreview })))

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, select, textarea')) return
      const s = useStore.getState()
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()
      if (mod && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) s.redo()
        else s.undo()
        return
      }
      if (mod && key === 'y') {
        e.preventDefault()
        s.redo()
        return
      }
      const item = s.items.find((it) => it.id === s.selectedId)
      if (!item) return
      if (mod && key === 'd') {
        e.preventDefault()
        s.duplicateItem(item.id)
      } else if (key === 'delete' || key === 'backspace') {
        e.preventDefault()
        s.removeItem(item.id)
      } else if (key === 'r' && !mod) {
        s.rotateItem(item.id, e.shiftKey ? -90 : 90)
      } else if (key === 'escape') {
        s.select(null)
      } else if (key.startsWith('arrow')) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0
        const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0
        if (item.mount === 'floor') s.updateItem(item.id, { x: item.x + dx, y: item.y + dy })
        else s.updateItem(item.id, { offset: item.offset + (dx || dy) })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

type Sheet = 'room' | 'catalog' | 'props'

const SHEET_TABS: { id: Sheet; label: string }[] = [
  { id: 'catalog', label: '🛋 Nội thất' },
  { id: 'room', label: '📐 Phòng' },
  { id: 'props', label: '⚙ Thuộc tính' },
]

/** Touch replacement for the keyboard shortcuts, shown over the canvas while an item is selected. */
function QuickActions({ onEdit }: { onEdit: () => void }) {
  const item = useStore((s) => s.items.find((it) => it.id === s.selectedId) ?? null)
  if (!item) return null
  const { rotateItem, duplicateItem, removeItem } = useStore.getState()
  return (
    <div className="quick-actions">
      {item.mount === 'floor' && <button onClick={() => rotateItem(item.id, 90)}>↻ 90°</button>}
      <button onClick={() => duplicateItem(item.id)}>Nhân bản</button>
      <button onClick={onEdit}>Sửa</button>
      <button className="danger" onClick={() => removeItem(item.id)}>
        Xoá
      </button>
    </div>
  )
}

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
