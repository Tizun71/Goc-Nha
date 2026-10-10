import { useSyncExternalStore } from 'react'

/** Phone and small tablet layout: canvas full screen, panels in a bottom sheet. */
export const MOBILE_QUERY = '(max-width: 960px)'
/** Finger input: bigger handles, touch hints instead of keyboard shortcuts. */
export const TOUCH_QUERY = '(pointer: coarse)'

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
