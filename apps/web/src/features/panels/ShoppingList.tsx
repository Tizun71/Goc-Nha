// SPDX-License-Identifier: AGPL-3.0-or-later

import { useMemo, useState } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import { useStore } from '../../store/store'
import { shoppingList, shoppingListText } from '@goc-nha/core/ops'

/** What to buy, with the real sizes to check in the shop. */
export function ShoppingList() {
  const room = useStore((s) => s.room)
  const items = useStore((s) => s.items)
  const lines = useMemo(() => shoppingList({ room, items }), [room, items])
  const [copied, setCopied] = useState(false)

  if (lines.length === 0) return null

  const copy = async () => {
    const text = shoppingListText({ room, items })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('Sao chép danh sách:', text)
    }
  }

  return (
    <>
      <h3 className="shopping-head">
        Danh sách mua sắm
        <button className="small" onClick={copy} title="Sao chép để mang theo khi đi mua">
          {copied ? (
            <>
              <Check size={14} /> Đã chép
            </>
          ) : (
            'Sao chép'
          )}
        </button>
      </h3>
      <ul className="shopping">
        {lines.map((l) => (
          <li key={`${l.kind}|${l.size}|${l.color}`}>
            <span className="swatch" style={{ background: l.color }} />
            <span className="name">
              {l.count > 1 && <strong>{l.count} × </strong>}
              {l.label}
            </span>
            <span className="size">{l.size}</span>
            {l.doorWarning && <span className="door-warning"><TriangleAlert size={12} /> {l.doorWarning}</span>}
          </li>
        ))}
      </ul>
    </>
  )
}
