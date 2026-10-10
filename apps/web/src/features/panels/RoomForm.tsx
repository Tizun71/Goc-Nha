// SPDX-License-Identifier: AGPL-3.0-or-later

import { RotateCcw, RotateCw } from 'lucide-react'
import { useStore } from '../../store/store'
import { areaM2 } from '@goc-nha/core/geometry'
import { DIRECTIONS, directionName, northForTopWall, northOf, wallBearing } from '@goc-nha/core/orientation'
import { NumberField } from './NumberField'
import { ROOM_TEMPLATES } from '@goc-nha/core/ops'
import { applyTemplate } from '../../app/templates'

export function RoomForm() {
  const room = useStore((s) => s.room)
  const setRoom = useStore((s) => s.setRoom)
  const topBearing = wallBearing('top', northOf(room))
  const setTop = (bearing: number) => setRoom({ north: northForTopWall(bearing) })
  const hasItems = useStore((s) => s.items.length > 0)

  return (
    <section className="panel">
      <h2>Phòng</h2>
      <div className="field-row">
        <NumberField label="Dài" value={room.length} min={100} max={2000} onCommit={(length) => setRoom({ length })} />
        <NumberField label="Rộng" value={room.width} min={100} max={2000} onCommit={(width) => setRoom({ width })} />
      </div>
      <NumberField label="Cao" value={room.height} min={200} max={500} onCommit={(height) => setRoom({ height })} />
      <p className="hint">Diện tích: {areaM2(room.length, room.width).toString().replace('.', ',')} m²</p>

      <label className="field">
        <span>{hasItems ? 'Bắt đầu lại từ phòng mẫu' : 'Chưa biết bắt đầu từ đâu? Chọn phòng mẫu'}</span>
        <select value="" onChange={(e) => applyTemplate(e.target.value)}>
          <option value="">Chọn phòng mẫu…</option>
          {ROOM_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} ({t.description})
            </option>
          ))}
        </select>
      </label>

      <h3>Hướng</h3>
      <div className="field-row">
        <label className="field">
          <span>Tường trên nhìn ra hướng</span>
          <select value={topBearing % 45 === 0 ? topBearing : ''} onChange={(e) => setTop(Number(e.target.value))}>
            {topBearing % 45 !== 0 && <option value="">{directionName(topBearing)} (lệch)</option>}
            {DIRECTIONS.map((name, i) => (
              <option key={name} value={i * 45}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <NumberField label="Góc" suffix="°" value={topBearing} min={0} max={359} onCommit={setTop} />
      </div>
      <div className="field-row">
        <button onClick={() => setTop(topBearing - 45)} title="Xoay la bàn ngược chiều kim đồng hồ">
          <RotateCcw size={16} /> 45°
        </button>
        <button onClick={() => setTop(topBearing + 45)} title="Xoay la bàn theo chiều kim đồng hồ">
          <RotateCw size={16} /> 45°
        </button>
      </div>
      <p className="hint">Góc tính theo la bàn: 0° Bắc, 90° Đông, 180° Nam, 270° Tây.</p>
    </section>
  )
}
