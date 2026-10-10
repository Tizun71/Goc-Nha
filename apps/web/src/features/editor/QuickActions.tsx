// SPDX-License-Identifier: AGPL-3.0-or-later

import { useStore } from '../../store/store'

/** Touch replacement for the keyboard shortcuts, shown over the canvas while an item is selected. */
export function QuickActions({ onEdit }: { onEdit: () => void }) {
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
