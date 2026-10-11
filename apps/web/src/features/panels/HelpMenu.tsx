// SPDX-License-Identifier: AGPL-3.0-or-later

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CircleQuestionMark } from 'lucide-react'
import { Menu } from '../../ui/Menu'
import { TOUCH_QUERY, useMediaQuery } from '../../hooks/useMediaQuery'

/** Keyboard shortcuts, or touch gestures on touch screens, in a popover instead of always on screen. */
export function HelpMenu() {
  const touch = useMediaQuery(TOUCH_QUERY)
  return (
    <Menu label="Hướng dẫn thao tác" trigger={<CircleQuestionMark size={16} />} kind="dialog">
      {() => (
        <div className="help">
          <h3>{touch ? 'Thao tác' : 'Phím tắt'}</h3>
          {touch ? (
            <ul className="shortcuts">
              <li>Chạm món đồ để chọn, kéo để di chuyển</li>
              <li>Kéo nền bằng một ngón để di chuyển</li>
              <li>Chụm/mở hai ngón để zoom</li>
            </ul>
          ) : (
            <ul className="shortcuts">
              <li><kbd>R</kbd> xoay 90° (<kbd>Shift</kbd>+<kbd>R</kbd> ngược lại)</li>
              <li><kbd>Del</kbd> xoá</li>
              <li><kbd>Ctrl</kbd>+<kbd>D</kbd> nhân bản</li>
              <li><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd> hoàn tác / làm lại</li>
              <li>
                <kbd>
                  <ArrowLeft size={12} />
                  <ArrowUp size={12} />
                  <ArrowRight size={12} />
                  <ArrowDown size={12} />
                </kbd>{' '}
                dịch 1 cm (<kbd>Shift</kbd> 10 cm)
              </li>
              <li><kbd>Esc</kbd> bỏ chọn</li>
              <li>Cuộn chuột để zoom, kéo nền để di chuyển</li>
              <li>Kéo đồ từ thư viện thả thẳng vào phòng</li>
            </ul>
          )}
        </div>
      )}
    </Menu>
  )
}
