// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState } from 'react'

type Props = {
  label: string
  value: number
  min?: number
  max?: number
  suffix?: string
  onCommit: (v: number) => void
}

/** Number input that commits on blur or Enter, so typing "120" is one undo step, not three. */
export function NumberField({ label, value, min, max, suffix = 'cm', onCommit }: Props) {
  const [text, setText] = useState(String(Math.round(value)))
  // resync when the value changes from outside (dragging, undo)
  const [seen, setSeen] = useState(value)
  if (seen !== value) {
    setSeen(value)
    setText(String(Math.round(value)))
  }

  const commit = () => {
    const n = Number(text.replace(',', '.'))
    if (!Number.isFinite(n)) return setText(String(Math.round(value)))
    const v = Math.round(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n)))
    setText(String(v))
    if (v !== Math.round(value)) onCommit(v)
  }

  return (
    <label className="field">
      <span>{label}</span>
      <div className="field-input">
        <input
          inputMode="numeric"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            if (e.key === 'Escape') {
              setText(String(Math.round(value)))
              ;(e.target as HTMLInputElement).blur()
            }
          }}
        />
        <em>{suffix}</em>
      </div>
      {min !== undefined && max !== undefined && (
        <small>
          {min}–{max}
        </small>
      )}
    </label>
  )
}
