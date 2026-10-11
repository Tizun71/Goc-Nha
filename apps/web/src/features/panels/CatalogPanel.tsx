// SPDX-License-Identifier: AGPL-3.0-or-later

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Kind } from '@goc-nha/core/model'
import { useStore } from '../../store/store'
import { CATEGORIES, FLOOR_DEFS, WALL_DEFS, defOf, type Category } from '@goc-nha/core/catalog'
import { DRAG_MIME } from '../editor/RoomCanvas'
import { Thumbnail } from './Thumbnail'

const ALL_KINDS = [...Object.keys(FLOOR_DEFS), ...Object.keys(WALL_DEFS)] as Kind[]
const OPEN_KEY = 'dmr-catalog-open'

/** Lowercase without Vietnamese accents, so "ghe" finds "Ghế" and "đen" finds "Đèn". */
function fold(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

function loadOpen(): Partial<Record<Category, boolean>> {
  try {
    return JSON.parse(localStorage.getItem(OPEN_KEY) ?? '') ?? {}
  } catch {
    return {}
  }
}

function CatalogItem({ kind, onPick }: { kind: Kind; onPick?: () => void }) {
  const def = defOf(kind)
  return (
    <button
      className="catalog-item"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_MIME, kind)
        e.dataTransfer.effectAllowed = 'copy'
      }}
      onClick={() => {
        useStore.getState().addItem(kind)
        onPick?.()
      }}
      title={`${def.label} (${def.en}) · bấm để thêm, hoặc kéo vào phòng`}
    >
      <Thumbnail kind={kind} />
      <span>{def.label}</span>
      <small>
        {def.defaults.w}
        {def.mount === 'floor' ? ` × ${def.defaults.d}` : ' cm'}
      </small>
    </button>
  )
}

/** onPick runs after an item is added by tapping, e.g. to close the mobile sheet. */
export function CatalogPanel({ onPick }: { onPick?: () => void } = {}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Partial<Record<Category, boolean>>>(() => ({ bed: true, ...loadOpen() }))

  const groups = useMemo(() => {
    const q = fold(query.trim())
    return CATEGORIES.map((cat) => ({
      ...cat,
      kinds: ALL_KINDS.filter((k) => {
        const def = defOf(k)
        return def.category === cat.id && (!q || fold(`${def.label} ${def.en}`).includes(q))
      }),
    })).filter((g) => g.kinds.length > 0)
  }, [query])

  const toggle = (id: Category) => {
    const next = { ...open, [id]: !open[id] }
    setOpen(next)
    try {
      localStorage.setItem(OPEN_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable: the open state just isn't remembered
    }
  }

  const searching = query.trim() !== ''
  return (
    <section className="catalog">
      <div className="catalog-search-wrap">
        <input
          className="catalog-search"
          type="search"
          aria-label="Tìm nội thất"
          placeholder="Tìm: giường, đèn, monstera…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {groups.length === 0 && <p className="hint">Không tìm thấy món nào.</p>}
      {groups.map((g) => {
        const expanded = searching || open[g.id]
        return (
          <div key={g.id} className="catalog-group">
            <button className="catalog-head" onClick={() => toggle(g.id)} aria-expanded={expanded}>
              <span className="chev">{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
              {g.label}
              <em>{g.kinds.length}</em>
            </button>
            {expanded && (
              <div className="catalog-grid">
                {g.kinds.map((k) => (
                  <CatalogItem key={k} kind={k} onPick={onPick} />
                ))}
              </div>
            )}
          </div>
        )
      })}
      <p className="hint">{onPick ? 'Chạm để thêm vào phòng.' : 'Bấm để thêm vào phòng hoặc kéo thả vào vị trí mong muốn.'}</p>
    </section>
  )
}
