// SPDX-License-Identifier: AGPL-3.0-or-later

import type { RoomDoc } from '../model/types'
import { parseDoc } from './persist'

// A share link carries the whole room in the URL fragment, so it needs no server
// and the room never leaves the browser until the user sends the link.
// Format: JSON, compressed with deflate-raw, then base64url.

/** Fragment key of a share link: `#r=<code>`. */
export const SHARE_PARAM = 'r'

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(out).arrayBuffer())
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code: string): Uint8Array {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

/** Encode a room into a short, URL-safe code for a share link. */
export async function encodeShare(doc: RoomDoc): Promise<string> {
  const json = JSON.stringify({ app: 'goc-nha', version: 1, room: doc.room, items: doc.items })
  return toBase64Url(await pipe(new TextEncoder().encode(json), new CompressionStream('deflate-raw')))
}

/** Decode a share code; throws a readable error when the link is broken. */
export async function decodeShare(code: string): Promise<RoomDoc> {
  let text: string
  try {
    text = new TextDecoder().decode(await pipe(fromBase64Url(code), new DecompressionStream('deflate-raw')))
  } catch {
    throw new Error('Link chia sẻ bị hỏng hoặc thiếu')
  }
  return parseDoc(text)
}

/** Read the share code from a URL fragment such as `#r=abc`, or null when there is none. */
export function shareCodeFromHash(hash: string): string | null {
  return new URLSearchParams(hash.replace(/^#/, '')).get(SHARE_PARAM) || null
}
