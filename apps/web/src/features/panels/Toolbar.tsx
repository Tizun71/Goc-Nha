// SPDX-License-Identifier: AGPL-3.0-or-later

import { useRef, useState } from 'react'
import { Bot, Lightbulb, LightbulbOff, Link2, Maximize2, Moon, Redo2, Sun, Sunrise, Sunset, Undo2 } from 'lucide-react'
import { useStore } from '../../store/store'
import { useViewport } from '../editor/viewport'
import { renderPlanDataUrl } from '../editor/exportImage'
import { useBridge } from '../../ai/bridge'
import { PRESETS, type TimeOfDay } from '@goc-nha/core/orientation'
import { parseDoc } from '@goc-nha/core/serialization'
import { exportJson, exportPng } from '../../lib/download'
import { shareRoom } from '../../app/useShareLink'

function savePng() {
  const url = renderPlanDataUrl(2)
  if (url) exportPng(url)
}

const TIME_ICONS = { morning: Sunrise, noon: Sun, afternoon: Sunset, night: Moon }

function TimeLabel({ time }: { time: Exclude<TimeOfDay, 'off'> }) {
  const Icon = TIME_ICONS[time]
  return (
    <>
      <Icon size={14} /> <span className="wide-only">{PRESETS[time].label}</span>
    </>
  )
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
  const [shareNote, setShareNote] = useState('')

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
          <button
            key={t}
            className={lighting.time === t ? 'on' : ''}
            onClick={() => useStore.getState().setLighting({ time: t })}
            title={t === 'off' ? undefined : PRESETS[t].label}
          >
            {t === 'off' ? 'Không nắng' : <TimeLabel time={t} />}
          </button>
        ))}
      </div>
      <button
        className={`lamp-toggle ${lighting.lightsOn ? 'on' : ''}`}
        onClick={() => useStore.getState().setLighting({ lightsOn: !lighting.lightsOn })}
        title="Bật/tắt đèn trong phòng"
      >
        {lighting.lightsOn ? <Lightbulb size={16} /> : <LightbulbOff size={16} />} <span className="wide-only">{lighting.lightsOn ? 'Đèn bật' : 'Đèn tắt'}</span>
      </button>
      <div className="tool-group">
        <button onClick={undo} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)">
          <Undo2 size={16} />
        </button>
        <button onClick={redo} disabled={!canRedo} title="Làm lại (Ctrl+Y)">
          <Redo2 size={16} />
        </button>
        {view === '2d' && (
          <button onClick={() => useViewport.getState().requestFit()} title="Vừa màn hình" aria-label="Vừa khung">
            <Maximize2 size={16} /> <span className="wide-only">Vừa khung</span>
          </button>
        )}
      </div>
      {import.meta.env.DEV && (
        <span
          className={`ai-status ${ai.connected && ai.agents > 0 ? 'on' : ''}`}
          title={ai.connected ? 'Claude kết nối qua MCP (Claude Desktop / Claude Code)' : 'Mất kết nối với dev server'}
        >
          <Bot size={16} /> {ai.connected && ai.agents > 0 ? `AI đã kết nối${ai.agents > 1 ? ` (${ai.agents})` : ''}` : 'AI chưa kết nối'}
        </span>
      )}
      <div className="tool-group right">
        <button
          title="Tạo link mở đúng phòng này, để gửi cho người thân, chủ nhà hoặc bạn bè"
          onClick={async () => {
            const note = await shareRoom()
            if (!note) return
            setShareNote(note)
            setTimeout(() => setShareNote(''), 3000)
          }}
        >
          <Link2 size={16} /> Chia sẻ
        </button>
        {shareNote && (
          <span className="share-note" role="status">
            {shareNote}
          </span>
        )}
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
