// SPDX-License-Identifier: AGPL-3.0-or-later

import { useId, useState } from 'react'

type Props = {
  label: string
  value: number
  min?: number
  max?: number
  suffix?: string
  /** Show the allowed range under the input. Off for fields where it is obvious (angles). */
  showRange?: boolean
  onCommit: (v: number) => void
}

function parse(text: string) {
  return text.trim() === '' ? NaN : Number(text.replace(',', '.'))
}

/** Number input that commits on blur or Enter, so typing "120" is one undo step, not three. */
export function NumberField({ label, value, min, max, suffix = 'cm', showRange = true, onCommit }: Props) {
  const [text, setText] = useState(String(Math.round(value)))
  // resync when the value changes from outside (dragging, undo)
  const [seen, setSeen] = useState(value)
  if (seen !== value) {
    setSeen(value)
    setText(String(Math.round(value)))
  }
  const helpId = useId()

  const commit = () => {
    const n = parse(text)
    if (!Number.isFinite(n)) return setText(String(Math.round(value)))
    const v = Math.round(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n)))
    setText(String(v))
    if (v !== Math.round(value)) onCommit(v)
  }

  // shown while typing; on commit the value is clamped into range, as before
  const n = parse(text)
  const range = min !== undefined && max !== undefined ? `${min}–${max} ${suffix}` : null
  const error = !Number.isFinite(n)
    ? 'Nhập một số'
    : (min !== undefined && n < min) || (max !== undefined && n > max)
      ? `Từ ${min ?? '…'} đến ${max ?? '…'} ${suffix}`
      : null

  return (
    <label className={`field ${error ? 'invalid' : ''}`}>
      <span>{label}</span>
      <div className="field-input">
        <input
          inputMode="numeric"
          value={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || (showRange && range) ? helpId : undefined}
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
      {error ? (
        <small id={helpId} className="field-error" role="alert">
          {error}
        </small>
      ) : (
        showRange && range && <small id={helpId}>{range}</small>
      )}
    </label>
  )
}
