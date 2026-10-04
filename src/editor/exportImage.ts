import { useStore } from '../model/store'
import { WALL_THICKNESS as T } from '../lib/geometry'
import { stageHandle } from './viewport'

/** PNG data URL of the 2D plan (room, compass and items, without selection handles). Null if the plan is not mounted. */
export function renderPlanDataUrl(pixelRatio: number): string | null {
  const stage = stageHandle.current
  if (!stage) return null
  const ui = stage.findOne('.ui')
  ui?.hide()
  const { room } = useStore.getState()
  const z = stage.scaleX()
  const pad = T + 64 / z // room plus the compass, which sits outside the top-right corner
  const url = stage.toDataURL({
    x: stage.x() - pad * z,
    y: stage.y() - pad * z,
    width: (room.length + 2 * pad) * z,
    height: (room.width + 2 * pad) * z,
    pixelRatio,
  })
  ui?.show()
  return url
}
