// SPDX-License-Identifier: AGPL-3.0-or-later

import { useRef, useState } from 'react'
import { Bot, Code, Ellipsis, FileDown, FileUp, ImageDown, Lightbulb, LightbulbOff, Link2, Moon, Redo2, Sun, SunDim, Sunrise, Sunset, Trash2, Undo2 } from 'lucide-react'
import { useStore } from '../../store/store'
import { renderPlanDataUrl } from '../editor/exportImage'
import { useBridge } from '../../ai/bridge'
import { PRESETS, type TimeOfDay } from '@goc-nha/core/orientation'
import { parseDoc } from '@goc-nha/core/serialization'
import { exportJson, exportPng } from '../../lib/download'
import { shareRoom } from '../../app/useShareLink'
import { Menu } from '../../ui/Menu'
import { HelpMenu } from './HelpMenu'

function savePng() {
  const url = renderPlanDataUrl(2)
  if (url) exportPng(url)
}

const TIMES: { time: TimeOfDay; label: string; Icon: typeof Sun }[] = [
  { time: 'off', label: 'Không mô phỏng nắng', Icon: SunDim },
  { time: 'morning', label: PRESETS.morning.label, Icon: Sunrise },
  { time: 'noon', label: PRESETS.noon.label, Icon: Sun },
  { time: 'afternoon', label: PRESETS.afternoon.label, Icon: Sunset },
  { time: 'night', label: PRESETS.night.label, Icon: Moon },
]

const SOURCE_URL = 'https://github.com/Tizun71/Goc-Nha'

export function Toolbar() {
  const view = useStore((s) => s.view)
  const lighting = useStore((s) => s.lighting)
  const canUndo = useStore((s) => s.past.length > 0)
  const canRedo = useStore((s) => s.future.length > 0)
  const hasItems = useStore((s) => s.items.length > 0)
  const { setView, setLighting, undo, redo, loadDoc, clearItems } = useStore.getState()
  const fileRef = useRef<HTMLInputElement>(null)
  const ai = useBridge()
  const aiOn = ai.connected && ai.agents > 0
  const [shareNote, setShareNote] = useState('')

  return (
    <header className="toolbar">
      <h1 className="brand">
        <img className="logo" src="/icon-64.png" alt="" width={24} height={24} /> Góc Nhà
      </h1>

      <div className="tool-sep" aria-hidden />

      <div className="segmented" role="group" aria-label="Chế độ xem">
        <button className={view === '2d' ? 'on' : ''} aria-pressed={view === '2d'} onClick={() => setView('2d')} title="Mặt bằng 2D">
          2D
        </button>
        <button className={view === 'iso' ? 'on' : ''} aria-pressed={view === 'iso'} onClick={() => setView('iso')} title="Xem phối cảnh 3D">
          Isometric
        </button>
      </div>

      <div className="tool-sep" aria-hidden />

      <div className="tool-group" role="group" aria-label="Ánh sáng">
        <div className="segmented icons">
          {TIMES.map(({ time, label, Icon }) => (
            <button
              key={time}
              className={lighting.time === time ? 'on' : ''}
              aria-pressed={lighting.time === time}
              aria-label={label}
              title={time === 'off' ? label : `Nắng ${label.toLowerCase()} (theo hướng la bàn của phòng)`}
              onClick={() => setLighting({ time })}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
        <button
          className={`icon lamp-toggle ${lighting.lightsOn ? 'on' : ''}`}
          aria-pressed={lighting.lightsOn}
          aria-label={lighting.lightsOn ? 'Tắt đèn trong phòng' : 'Bật đèn trong phòng'}
          title={lighting.lightsOn ? 'Đèn đang bật · bấm để tắt' : 'Đèn đang tắt · bấm để bật'}
          onClick={() => setLighting({ lightsOn: !lighting.lightsOn })}
        >
          {lighting.lightsOn ? <Lightbulb size={16} /> : <LightbulbOff size={16} />}
        </button>
      </div>

      <div className="tool-sep" aria-hidden />

      <div className="tool-group" role="group" aria-label="Lịch sử">
        <button className="icon" onClick={undo} disabled={!canUndo} aria-label="Hoàn tác" title="Hoàn tác (Ctrl+Z)">
          <Undo2 size={16} />
        </button>
        <button className="icon" onClick={redo} disabled={!canRedo} aria-label="Làm lại" title="Làm lại (Ctrl+Y)">
          <Redo2 size={16} />
        </button>
      </div>

      <div className="tool-group right">
        {import.meta.env.DEV && (
          <span
            className={`ai-status ${aiOn ? 'on' : ''}`}
            title={ai.connected ? 'Claude kết nối qua MCP (Claude Desktop / Claude Code)' : 'Mất kết nối với dev server'}
          >
            <Bot size={14} /> <span className="wide-only">{aiOn ? `AI${ai.agents > 1 ? ` (${ai.agents})` : ''}` : 'AI chưa kết nối'}</span>
          </span>
        )}
        <HelpMenu />
        {view === '2d' && (
          <button onClick={savePng} aria-label="Xuất PNG" title="Tải ảnh mặt bằng (PNG)">
            <ImageDown size={16} /> <span className="wide-only">Xuất PNG</span>
          </button>
        )}
        <button
          className="primary"
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
        <Menu label="Thêm thao tác" trigger={<Ellipsis size={16} />}>
          {(close) => (
            <>
              <p className="menu-note">Thiết kế được tự động lưu trên trình duyệt này.</p>
              <button
                role="menuitem"
                onClick={() => {
                  exportJson({ room: useStore.getState().room, items: useStore.getState().items })
                  close()
                }}
              >
                <FileDown size={16} /> Lưu file JSON
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  close()
                  fileRef.current?.click()
                }}
              >
                <FileUp size={16} /> Mở file JSON…
              </button>
              <div className="menu-sep" role="separator" />
              <button
                role="menuitem"
                className="danger"
                disabled={!hasItems}
                onClick={() => {
                  close()
                  if (confirm('Xoá toàn bộ đồ đạc trong phòng? (có thể hoàn tác bằng Ctrl+Z)')) clearItems()
                }}
              >
                <Trash2 size={16} /> Xoá hết đồ đạc
              </button>
              <div className="menu-sep" role="separator" />
              {/* AGPL-3.0 §13: users of the hosted app can get its source */}
              <a role="menuitem" href={SOURCE_URL} target="_blank" rel="noopener noreferrer" onClick={close}>
                <Code size={16} /> Mã nguồn (AGPL-3.0)
              </a>
            </>
          )}
        </Menu>
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
