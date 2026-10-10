// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: ['packages/*'],
  },
})
