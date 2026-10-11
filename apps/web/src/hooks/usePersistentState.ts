// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState } from 'react'

/**
 * useState remembered in localStorage, for per-viewer UI preferences (open tab, collapsed panel).
 * Falls back to the initial value when storage is unavailable or holds something else.
 */
export function usePersistentState<T extends string | boolean>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return initial
      const parsed: unknown = JSON.parse(raw)
      return typeof parsed === typeof initial ? (parsed as T) : initial
    } catch {
      return initial
    }
  })
  const set = (next: T) => {
    setValue(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // storage unavailable: the choice just isn't remembered
    }
  }
  return [value, set] as const
}
