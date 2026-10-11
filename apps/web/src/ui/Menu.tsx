// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

type Props = {
  /** Accessible name and tooltip of the trigger. */
  label: string
  /** Trigger content, usually an icon. */
  trigger: ReactNode
  /** 'menu': a list of actions with arrow-key focus. 'dialog': free content such as help text. */
  kind?: 'menu' | 'dialog'
  align?: 'left' | 'right'
  triggerClassName?: string
  children: (close: () => void) => ReactNode
}

/** A small popover opened from a toolbar button. Closes on Escape, outside click, or after an action. */
export function Menu({ label, trigger, kind = 'menu', align = 'right', triggerClassName = 'icon', children }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const triggerId = `${id}-trigger`

  // looked up by id rather than a ref, because `close` is handed to children during render
  const close = () => {
    setOpen(false)
    document.getElementById(triggerId)?.focus()
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    // move focus into the popover so keyboard users land on the first action
    const pop = popRef.current
    ;(pop?.querySelector<HTMLElement>('[role="menuitem"]') ?? pop)?.focus()
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close()
      return
    }
    if (kind !== 'menu' || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return
    e.preventDefault()
    const items = [...(popRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length
    items[next]?.focus()
  }

  return (
    <div className="menu" ref={rootRef} onKeyDown={onKeyDown}>
      <button
        id={triggerId}
        className={triggerClassName}
        aria-label={label}
        title={label}
        aria-haspopup={kind === 'menu' ? 'menu' : 'dialog'}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>
      {open && (
        <div id={id} ref={popRef} className={`menu-pop ${align}`} role={kind} aria-label={label} tabIndex={-1}>
          {children(close)}
        </div>
      )}
    </div>
  )
}
