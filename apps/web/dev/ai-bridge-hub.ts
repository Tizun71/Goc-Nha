// SPDX-License-Identifier: AGPL-3.0-or-later

// Vite dev-server plugin: a small WebSocket hub at /__dmr that links the browser app
// (role=app) with any number of MCP servers (role=agent), e.g. one from Claude Desktop
// and one from Claude Code at the same time.

import type { Plugin } from 'vite'
import { WebSocketServer, type WebSocket } from 'ws'

type Pending = { agent: WebSocket; id: unknown }

export function aiBridgeHub(): Plugin {
  return {
    name: 'goc-nha-ai-hub',
    apply: 'serve',
    configureServer(server) {
      const wss = new WebSocketServer({ noServer: true })
      let app: WebSocket | null = null
      const agents = new Set<WebSocket>()
      const pending = new Map<string, Pending>()
      let seq = 0

      const send = (ws: WebSocket | null, msg: unknown) => {
        if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg))
      }
      const notifyApp = () => send(app, { type: 'agents', count: agents.size })

      server.httpServer?.on('upgrade', (req, socket, head) => {
        if (!req.url?.startsWith('/__dmr')) return // leave Vite's HMR socket alone
        wss.handleUpgrade(req, socket, head, (ws) => {
          const role = new URL(req.url!, 'http://localhost').searchParams.get('role')
          if (role === 'app') onApp(ws)
          else onAgent(ws)
        })
      })

      function onApp(ws: WebSocket) {
        if (app) send(app, { type: 'replaced' })
        app?.close()
        app = ws
        notifyApp()
        ws.on('message', (raw) => {
          const msg = JSON.parse(String(raw))
          if (msg.type !== 'response') return
          const p = pending.get(msg.id)
          if (!p) return
          pending.delete(msg.id)
          send(p.agent, { ...msg, id: p.id })
        })
        ws.on('close', () => {
          if (app !== ws) return
          app = null
          for (const [key, p] of pending) {
            send(p.agent, { type: 'response', id: p.id, error: 'The app was closed while handling the request' })
            pending.delete(key)
          }
        })
      }

      function onAgent(ws: WebSocket) {
        agents.add(ws)
        notifyApp()
        ws.on('message', (raw) => {
          const msg = JSON.parse(String(raw))
          if (msg.type !== 'request') return
          if (!app) {
            send(ws, { type: 'response', id: msg.id, error: 'APP_NOT_OPEN' })
            return
          }
          const key = `r${++seq}`
          pending.set(key, { agent: ws, id: msg.id })
          send(app, { ...msg, id: key })
        })
        ws.on('close', () => {
          agents.delete(ws)
          for (const [key, p] of pending) if (p.agent === ws) pending.delete(key)
          notifyApp()
        })
      }
    },
  }
}
