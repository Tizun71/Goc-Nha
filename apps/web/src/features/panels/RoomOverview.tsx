// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Issues } from '@goc-nha/core/layout'
import { areaM2 } from '@goc-nha/core/geometry'
import { directionName, northOf, wallBearing } from '@goc-nha/core/orientation'
import { useStore } from '../../store/store'
import { IssueList } from './IssueList'
import { ShoppingList } from './ShoppingList'

/** Inspector content when nothing is selected: the room at a glance, problems and what to buy. */
export function RoomOverview({ issues }: { issues: Issues }) {
  const room = useStore((s) => s.room)
  const count = useStore((s) => s.items.length)
  const area = areaM2(room.length, room.width).toString().replace('.', ',')

  return (
    <>
      <header className="inspector-head">
        <h2>Tổng quan phòng</h2>
        <p className="hint">Chọn một món đồ trên mặt bằng để chỉnh.</p>
      </header>
      <dl className="stats">
        <div className="wide">
          <dt>Dài × rộng × cao trần</dt>
          <dd>
            {room.length} × {room.width} × {room.height} cm
          </dd>
        </div>
        <div>
          <dt>Diện tích</dt>
          <dd>{area} m²</dd>
        </div>
        <div>
          <dt>Tường trên</dt>
          <dd>{directionName(wallBearing('top', northOf(room)))}</dd>
        </div>
        <div>
          <dt>Đồ đạc</dt>
          <dd>{count} món</dd>
        </div>
        <div>
          <dt>Cần xem lại</dt>
          <dd className={issues.size > 0 ? 'warn' : 'ok'}>{issues.size > 0 ? `${issues.size} món` : 'Không có'}</dd>
        </div>
      </dl>
      <IssueList issues={issues} />
      <ShoppingList />
    </>
  )
}
