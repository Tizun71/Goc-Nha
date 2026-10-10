// SPDX-License-Identifier: AGPL-3.0-or-later

import { ROOM_TEMPLATES, templateDoc } from '@goc-nha/core/ops'
import { useStore } from '../store/store'

/** Replace the room with a starter template, as one undo step. Asks first if the room has items. */
export function applyTemplate(id: string) {
  const template = ROOM_TEMPLATES.find((t) => t.id === id)
  if (!template) return
  const { room, items, loadDoc } = useStore.getState()
  if (items.length > 0 && !confirm(`Dùng mẫu "${template.label}"? Phòng hiện tại sẽ được thay (có thể hoàn tác bằng Ctrl+Z).`)) return
  // keep the user's compass direction: it belongs to their real room, not the template
  const doc = templateDoc(template)
  loadDoc({ ...doc, room: { ...doc.room, north: room.north } })
}
