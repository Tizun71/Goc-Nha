// SPDX-License-Identifier: AGPL-3.0-or-later

/** A 2D view: `zoom` screen pixels per centimetre, `(x, y)` the screen position of the room origin. */
export type View = { zoom: number; x: number; y: number }

/**
 * Scale the view by `factor`, keeping the room point under the screen point `at` fixed,
 * with the zoom clamped to `[min, max]`.
 */
export function zoomAround(view: View, factor: number, at: { x: number; y: number }, min: number, max: number): View {
  const zoom = Math.min(max, Math.max(min, view.zoom * factor))
  const cm = { x: (at.x - view.x) / view.zoom, y: (at.y - view.y) / view.zoom }
  return { zoom, x: at.x - cm.x * zoom, y: at.y - cm.y * zoom }
}
