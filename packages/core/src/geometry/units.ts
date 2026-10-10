// SPDX-License-Identifier: AGPL-3.0-or-later

export function roundTo(value: number, step: number) {
  return Math.round(value / step) * step
}

/** "85 cm" below one metre, "2,4 m" above (Vietnamese decimal comma). */
export function formatCm(cm: number) {
  const v = Math.round(cm)
  if (Math.abs(v) < 100) return `${v} cm`
  const m = Math.round(v / 10) / 10
  return `${m.toString().replace('.', ',')} m`
}

export function formatSize(w: number, d: number) {
  return `${Math.round(w)} × ${Math.round(d)}`
}

export function areaM2(lengthCm: number, widthCm: number) {
  return Math.round((lengthCm * widthCm) / 1000) / 10
}
