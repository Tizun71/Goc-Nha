// SPDX-License-Identifier: AGPL-3.0-or-later

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { aiBridgeHub } from './dev/ai-bridge-hub.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), aiBridgeHub()],
  // fixed port so the MCP server knows where to find the app
  server: { port: 5173, strictPort: true },
  build: {
    // three.js alone is ~950 kB minified; it stays in the lazy IsoPreview chunk, off the first load
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        // vendor chunks change less often than app code, so browsers keep them cached
        codeSplitting: {
          groups: [
            { name: 'konva', test: /node_modules[\\/](konva|react-konva)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|zustand)[\\/]/ },
          ],
        },
      },
    },
  },
})
