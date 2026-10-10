// SPDX-License-Identifier: AGPL-3.0-or-later

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { aiBridgeHub } from './dev/ai-bridge-hub.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), aiBridgeHub()],
  // fixed port so the MCP server knows where to find the app
  server: { port: 5173, strictPort: true },
})
