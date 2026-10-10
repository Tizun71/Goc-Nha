// SPDX-License-Identifier: AGPL-3.0-or-later

import { useRef } from 'react'
import { useStore } from '../../store/store'
import { useViewport } from '../editor/viewport'
import { renderPlanDataUrl } from '../editor/exportImage'
import { useBridge } from '../../ai/bridge'
import { PRESETS, type TimeOfDay } from '@goc-nha/core/orientation'
import { parseDoc } from '@goc-nha/core/serialization'
import { exportJson, exportPng } from '../../lib/download'

function savePng() {
  const url = renderPlanDataUrl(2)
  if (url) exportPng(url)
}

const SOURCE_URL = 'https://github.com/Tizun71/Goc-Nha'

export function Toolbar() {
  const view = useStore((s) => s.view)
  const lighting = useStore((s) => s.lighting)
  const canUndo = useStore((s) => s.past.length > 0)
  const canRedo = useStore((s) => s.future.length > 0)
  const { setView, undo, redo, loadDoc, clearItems } = useStore.getState()
  const fileRef = useRef<HTMLInputElement>(null)
  const ai = useBridge()

  return (
    <header className="toolbar">
      <h1>
        <img className="logo" src="/icon-64.png" alt="" width={28} height={28} /> Góc Nhà
        <small className="tagline">xếp phòng trước khi mua đồ</small>
      </h1>
      <div className="segmented">
        <button className={view === '2d' ? 'on' : ''} onClick={() => setView('2d')}>
          2D
        </button>
        <button className={view === 'iso' ? 'on' : ''} onClick={() => setView('iso')}>
          Isometric
        </button>
      </div>
      <div className="segmented light" title="Mô phỏng ánh sáng theo giờ trong ngày (theo hướng la bàn của phòng)">
        {(['off', 'morning', 'noon', 'afternoon', 'night'] as TimeOfDay[]).map((t) => (
          <button key={t} className={lighting.time === t ? 'on' : ''} onClick={() => useStore.getState().setLighting({ time: t })}>
            {t === 'off' ? 'Không nắng' : `${t === 'night' ? '🌙' : '☀'} ${PRESETS[t].label}`}
          </button>
        ))}
      </div>
      <button
        className={`lamp-toggle ${lighting.lightsOn ? 'on' : ''}`}
        onClick={() => useStore.getState().setLighting({ lightsOn: !lighting.lightsOn })}
        title="Bật/tắt đèn trong phòng"
      >
        💡 {lighting.lightsOn ? 'Đèn bật' : 'Đèn tắt'}
      </button>
      <div className="tool-group">
        <button onClick={undo} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)">
          ↶
        </button>
        <button onClick={redo} disabled={!canRedo} title="Làm lại (Ctrl+Y)">
          ↷
        </button>
        {view === '2d' && (
          <button onClick={() => useViewport.getState().requestFit()} title="Vừa màn hình">
            ⤢ Vừa khung
          </button>
        )}
      </div>
      {import.meta.env.DEV && (
        <span
          className={`ai-status ${ai.connected && ai.agents > 0 ? 'on' : ''}`}
          title={ai.connected ? 'Claude kết nối qua MCP (Claude Desktop / Claude Code)' : 'Mất kết nối với dev server'}
        >
          {ai.connected && ai.agents > 0 ? `🤖 AI đã kết nối${ai.agents > 1 ? ` (${ai.agents})` : ''}` : '🤖 AI chưa kết nối'}
        </span>
      )}
      <div className="tool-group right">
        {view === '2d' && <button onClick={savePng}>Xuất PNG</button>}
        <button onClick={() => exportJson({ room: useStore.getState().room, items: useStore.getState().items })}>Lưu JSON</button>
        <button onClick={() => fileRef.current?.click()}>Mở JSON</button>
        <button
          className="danger"
          onClick={() => {
            if (confirm('Xoá toàn bộ đồ đạc trong phòng? (có thể hoàn tác bằng Ctrl+Z)')) clearItems()
          }}
        >
          Xoá hết
        </button>
        {/* AGPL-3.0 §13: users of the hosted app can get its source */}
        <a className="source-link" href={SOURCE_URL} target="_blank" rel="noopener noreferrer" title="Mã nguồn mở (AGPL-3.0)">
          Mã nguồn
        </a>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            try {
              loadDoc(parseDoc(await file.text()))
            } catch (err) {
              alert(`Không mở được file: ${(err as Error).message}`)
            }
          }}
        />
      </div>
    </header>
  )
}
