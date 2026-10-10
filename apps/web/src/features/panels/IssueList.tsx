// SPDX-License-Identifier: AGPL-3.0-or-later

import { TriangleAlert } from 'lucide-react'
import { useStore } from '../../store/store'
import { defOf } from '@goc-nha/core/catalog'
import type { Issues } from '@goc-nha/core/layout'

/** Every layout problem in the room; clicking one selects the item so it can be fixed. */
export function IssueList({ issues }: { issues: Issues }) {
  const items = useStore((s) => s.items)
  const select = useStore((s) => s.select)
  if (issues.size === 0) return null

  return (
    <>
      <h3>Cần xem lại</h3>
      <ul className="issue-list">
        {[...issues].map(([id, problems]) => {
          const item = items.find((it) => it.id === id)
          if (!item) return null
          return (
            <li key={id}>
              <button onClick={() => select(id)} title="Chọn món này để sửa">
                <strong>{defOf(item.kind).label}</strong>
                {problems.map((p) => (
                  <span key={p}>
                    <TriangleAlert size={12} /> {p}
                  </span>
                ))}
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
