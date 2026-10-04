import { Suspense, lazy, useEffect } from 'react'
import { useStore } from './model/store'
import { RoomCanvas } from './editor/RoomCanvas'
import { Toolbar } from './ui/Toolbar'
import { RoomForm } from './ui/RoomForm'
import { CatalogPanel } from './ui/CatalogPanel'
import { PropertiesPanel } from './ui/PropertiesPanel'
import { useBridge } from './ai/bridge'

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

export default function App() {
  const view = useStore((s) => s.view)
  const aiAction = useBridge((s) => s.lastAction)
  useShortcuts()
  return (
    <div className="app">
      <Toolbar />
      <aside className="sidebar left">
        <RoomForm />
        <CatalogPanel />
      </aside>
      <main className="stage">
        {view === '2d' ? (
          <RoomCanvas />
        ) : (
          <Suspense fallback={<div className="loading">Đang tải 3D…</div>}>
            <IsoPreview />
          </Suspense>
        )}
        {aiAction && <div className="ai-toast">{aiAction}</div>}
      </main>
      <aside className="sidebar right">
        <PropertiesPanel />
      </aside>
    </div>
  )
}
