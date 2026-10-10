import { useEffect } from 'react'
import { useStore } from '../store/store'

/** Global keyboard shortcuts for the editor (ignored while typing in a form field). */
export function useShortcuts() {
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
