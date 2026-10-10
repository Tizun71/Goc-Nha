import type { RoomDoc } from '@goc-nha/core/model'
import { serializeDoc } from '@goc-nha/core/serialization'

function download(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  a.click()
}

export function exportJson(doc: RoomDoc) {
  const blob = new Blob([serializeDoc(doc)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  download(url, 'goc-nha-phong-cua-toi.json')
  URL.revokeObjectURL(url)
}

export function exportPng(dataUrl: string) {
  download(dataUrl, 'goc-nha-phong-cua-toi.png')
}
