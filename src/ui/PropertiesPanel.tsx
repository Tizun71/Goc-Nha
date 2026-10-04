import { useMemo } from 'react'
import { useStore } from '../model/store'
import type { Wall } from '../model/types'
import { FLOOR_DEFS, WALL_DEFS, defOf } from '../furniture/catalog'
import { findIssues } from '../editor/collision'
import { wallFrame } from '../lib/geometry'
import { backBearing, directionName, frontBearing, northOf, wallBearing } from '../lib/compass'
import { NumberField } from './NumberField'

const WALL_LABELS: Record<Wall, string> = { top: 'Trên', right: 'Phải', bottom: 'Dưới', left: 'Trái' }

export function PropertiesPanel() {
  const room = useStore((s) => s.room)
  const items = useStore((s) => s.items)
  const item = useStore((s) => s.items.find((it) => it.id === s.selectedId) ?? null)
  const { updateItem, removeItem, duplicateItem, rotateItem } = useStore.getState()
  const issues = useMemo(() => findIssues(items, room), [items, room])

  if (!item) {
    const total = issues.size
    return (
      <section className="panel">
        <h2>Thuộc tính</h2>
        <p className="hint">Chọn một món đồ để chỉnh kích thước.</p>
        <p className="hint">
          {items.length} món đồ{total > 0 && <strong className="warn"> · {total} món có vấn đề</strong>}
        </p>
        <h3>Phím tắt</h3>
        <ul className="shortcuts">
          <li><kbd>R</kbd> xoay 90°</li>
          <li><kbd>Del</kbd> xoá</li>
          <li><kbd>Ctrl</kbd>+<kbd>D</kbd> nhân bản</li>
          <li><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd> hoàn tác / làm lại</li>
          <li><kbd>←↑→↓</kbd> dịch 1 cm (<kbd>Shift</kbd> 10 cm)</li>
          <li>Cuộn chuột để zoom, kéo nền để di chuyển</li>
        </ul>
      </section>
    )
  }

  const def = defOf(item.kind)
  const set = (patch: Parameters<typeof updateItem>[1]) => updateItem(item.id, patch)
  const problems = issues.get(item.id) ?? []
  const north = northOf(room)
  const facing =
    item.mount === 'floor'
      ? item.kind === 'bed'
        ? `Đầu giường hướng ${directionName(backBearing(item.rotation, north))}`
        : `Mặt trước hướng ${directionName(frontBearing(item.rotation, north))}`
      : item.kind === 'door'
        ? `Hướng cửa: ${directionName(wallBearing(item.wall, north))}`
        : item.kind === 'window'
          ? `Cửa sổ nhìn ra hướng ${directionName(wallBearing(item.wall, north))}`
          : `Trên tường hướng ${directionName(wallBearing(item.wall, north))}`

  return (
    <section className="panel">
      <h2>{def.label}</h2>
      {problems.length > 0 && (
        <div className="issues">
          {problems.map((p) => (
            <div key={p}>⚠ {p}</div>
          ))}
        </div>
      )}
      <div className="facing">🧭 {facing}</div>

      {item.mount === 'floor' ? (
        <>
          <div className="field-row">
            <NumberField label="Dài" value={item.w} min={FLOOR_DEFS[item.kind].min.w} max={FLOOR_DEFS[item.kind].max.w} onCommit={(w) => set({ w })} />
            <NumberField label="Rộng (sâu)" value={item.d} min={FLOOR_DEFS[item.kind].min.d} max={FLOOR_DEFS[item.kind].max.d} onCommit={(d) => set({ d })} />
          </div>
          <NumberField label="Cao" value={item.h} min={FLOOR_DEFS[item.kind].min.h} max={FLOOR_DEFS[item.kind].max.h} onCommit={(h) => set({ h })} />
          <div className="field-row">
            <NumberField label="Tâm X" value={item.x} onCommit={(x) => set({ x })} />
            <NumberField label="Tâm Y" value={item.y} onCommit={(y) => set({ y })} />
          </div>
          <div className="field-row align-end">
            <NumberField label="Xoay" suffix="°" value={item.rotation} min={0} max={359} onCommit={(rotation) => set({ rotation })} />
            <button onClick={() => rotateItem(item.id, 90)}>↻ 90°</button>
          </div>
        </>
      ) : (
        <>
          <label className="field">
            <span>Tường</span>
            <select value={item.wall} onChange={(e) => set({ wall: e.target.value as Wall })}>
              {(Object.keys(WALL_LABELS) as Wall[]).map((w) => (
                <option key={w} value={w}>
                  {WALL_LABELS[w]} ({directionName(wallBearing(w, north))})
                </option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <NumberField label="Rộng" value={item.w} min={WALL_DEFS[item.kind].min.w} max={WALL_DEFS[item.kind].max.w} onCommit={(w) => set({ w })} />
            <NumberField label="Cao" value={item.h} min={WALL_DEFS[item.kind].min.h} max={WALL_DEFS[item.kind].max.h} onCommit={(h) => set({ h })} />
          </div>
          <div className="field-row">
            <NumberField
              label="Cách góc"
              value={item.offset}
              min={0}
              max={wallFrame(room, item.wall).length - item.w}
              onCommit={(offset) => set({ offset })}
            />
            {item.kind !== 'door' && (
              <NumberField label="Cách sàn" value={item.elevation} min={0} max={room.height - item.h} onCommit={(elevation) => set({ elevation })} />
            )}
          </div>
          {item.kind === 'door' && (
            <div className="field-row">
              <label className="field">
                <span>Bản lề</span>
                <select value={item.hinge} onChange={(e) => set({ hinge: e.target.value as 'left' | 'right' })}>
                  <option value="left">Trái</option>
                  <option value="right">Phải</option>
                </select>
              </label>
              <label className="field">
                <span>Mở</span>
                <select value={item.opening} onChange={(e) => set({ opening: e.target.value as 'in' | 'out' })}>
                  <option value="in">Vào trong</option>
                  <option value="out">Ra ngoài</option>
                </select>
              </label>
            </div>
          )}
        </>
      )}

      {item.kind !== 'window' && (
        <label className="field">
          <span>Màu</span>
          <div className="color-row">
            <input type="color" value={item.color ?? def.color} onChange={(e) => updateItem(item.id, { color: e.target.value })} />
            {item.color && <button onClick={() => set({ color: undefined })}>Mặc định</button>}
          </div>
        </label>
      )}

      <div className="actions">
        <button onClick={() => duplicateItem(item.id)}>Nhân bản</button>
        <button className="danger" onClick={() => removeItem(item.id)}>
          Xoá
        </button>
      </div>
    </section>
  )
}
