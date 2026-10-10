// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect } from 'react'
import { SHARE_PARAM, decodeShare, encodeShare, shareCodeFromHash } from '@goc-nha/core/serialization'
import { useStore } from '../store/store'

/** Build a link that opens the current room, then share or copy it. Returns a status message. */
export async function shareRoom(): Promise<string> {
  const { room, items } = useStore.getState()
  const url = `${location.origin}${location.pathname}#${SHARE_PARAM}=${await encodeShare({ room, items })}`
  // the native share sheet is the natural way on phones
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share({ title: 'Phòng của tôi trên Góc Nhà', url })
      return 'Đã chia sẻ link phòng'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return ''
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'Đã sao chép link phòng. Ai mở link sẽ thấy đúng phòng này.'
  } catch {
    prompt('Sao chép link phòng:', url)
    return ''
  }
}

async function openFromHash() {
  const code = shareCodeFromHash(location.hash)
  if (!code) return
  // drop the code from the address bar so a reload does not load the room again
  history.replaceState(null, '', location.pathname + location.search)
  try {
    const doc = await decodeShare(code)
    const hasItems = useStore.getState().items.length > 0
    if (hasItems && !confirm('Mở phòng được chia sẻ? Phòng hiện tại sẽ được thay (có thể hoàn tác bằng Ctrl+Z).')) return
    useStore.getState().loadDoc(doc)
  } catch (e) {
    alert(`Không mở được phòng được chia sẻ: ${(e as Error).message}`)
  }
}

/** Load a room from a share link on start and whenever the fragment changes. */
export function useShareLink() {
  useEffect(() => {
    void openFromHash()
    const onHash = () => void openFromHash()
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
}
