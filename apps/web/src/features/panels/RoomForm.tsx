// SPDX-License-Identifier: AGPL-3.0-or-later

import { RotateCcw, RotateCw } from 'lucide-react'
import { useStore } from '../../store/store'
import { DIRECTIONS, directionName, northForTopWall, northOf, wallBearing } from '@goc-nha/core/orientation'
import { NumberField } from './NumberField'
import { ROOM_TEMPLATES } from '@goc-nha/core/ops'
import { applyTemplate } from '../../app/templates'

/** Room size, compass direction and starter rooms. Area and other totals live in the inspector. */
export function RoomForm() {
  const room = useStore((s) => s.room)
  const setRoom = useStore((s) => s.setRoom)
  const topBearing = wallBearing('top', northOf(room))
  const setTop = (bearing: number) => setRoom({ north: northForTopWall(bearing) })
  const hasItems = useStore((s) => s.items.length > 0)

  return (
    <div className="room-form">
      <details className="section" open>
        <summary>Kích thước</summary>
        <div className="field-row">
          <NumberField label="Dài" value={room.length} min={100} max={2000} onCommit={(length) => setRoom({ length })} />
          <NumberField label="Rộng" value={room.width} min={100} max={2000} onCommit={(width) => setRoom({ width })} />
        </div>
        <NumberField label="Cao trần" value={room.height} min={200} max={500} onCommit={(height) => setRoom({ height })} />
      </details>

      <details className="section" open>
        <summary>Hướng phòng</summary>
        <div className="field-row">
          <label className="field">
            <span>Tường trên nhìn ra</span>
            <select value={topBearing % 45 === 0 ? topBearing : ''} onChange={(e) => setTop(Number(e.target.value))}>
              {topBearing % 45 !== 0 && <option value="">{directionName(topBearing)} (lệch)</option>}
              {DIRECTIONS.map((name, i) => (
                <option key={name} value={i * 45}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <NumberField label="Góc" suffix="°" value={topBearing} min={0} max={359} onCommit={setTop} showRange={false} />
        </div>
        <div className="button-row">
          <button onClick={() => setTop(topBearing - 45)} title="Xoay la bàn ngược chiều kim đồng hồ">
            <RotateCcw size={16} /> 45°
          </button>
          <button onClick={() => setTop(topBearing + 45)} title="Xoay la bàn theo chiều kim đồng hồ">
            <RotateCw size={16} /> 45°
          </button>
        </div>
        <p className="hint">0° Bắc, 90° Đông, 180° Nam, 270° Tây. Hướng quyết định nắng chiếu vào phòng.</p>
      </details>

      <details className="section" open={!hasItems}>
        <summary>Mẫu phòng</summary>
        <p className="hint top">{hasItems ? 'Thay phòng hiện tại bằng một mẫu (có thể hoàn tác).' : 'Bắt đầu nhanh từ một bố cục có sẵn.'}</p>
        <div className="template-list">
          {ROOM_TEMPLATES.map((t) => (
            <button key={t.id} className="template" onClick={() => applyTemplate(t.id)}>
              <strong>{t.label}</strong>
              <span>{t.description}</span>
            </button>
          ))}
        </div>
      </details>
    </div>
  )
}
