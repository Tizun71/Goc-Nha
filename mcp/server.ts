// MCP server for Góc Nhà. Claude Desktop / Claude Code start it over stdio; it forwards
// each tool call to the open app through the hub in the Vite dev server (see mcp/hub.ts).
// Run directly with Node 22.6+ (TypeScript type stripping): node mcp/server.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const APP_URL = process.env.DMR_APP_URL ?? 'http://localhost:5173'
const HUB_URL = APP_URL.replace(/^http/, 'ws') + '/__dmr?role=agent'
const TIMEOUT_MS = 20000

const NOT_RUNNING = `Góc Nhà is not running. Start it with "pnpm dev" in the design-my-room folder, then open ${APP_URL} in a browser.`
const NOT_OPEN = `The Góc Nhà dev server is running but the app is not open. Open ${APP_URL} in a browser and try again.`

// ---------- connection to the hub ----------

let socket: WebSocket | null = null
let seq = 0
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>()

function connect(): Promise<WebSocket> {
  if (socket && socket.readyState === WebSocket.OPEN) return Promise.resolve(socket)
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(HUB_URL)
    ws.onopen = () => {
      socket = ws
      resolve(ws)
    }
    ws.onerror = () => reject(new Error(NOT_RUNNING))
    ws.onclose = () => {
      if (socket === ws) socket = null
      for (const [id, p] of pending) {
        clearTimeout(p.timer)
        p.reject(new Error('Lost connection to Góc Nhà'))
        pending.delete(id)
      }
    }
    ws.onmessage = (ev) => {
      const msg = JSON.parse(String(ev.data))
      const p = pending.get(msg.id)
      if (!p) return
      pending.delete(msg.id)
      clearTimeout(p.timer)
      if (msg.error) p.reject(new Error(msg.error === 'APP_NOT_OPEN' ? NOT_OPEN : msg.error))
      else p.resolve(msg.result)
    }
  })
}

async function call(method: string, params: unknown = {}): Promise<unknown> {
  const ws = await connect()
  const id = ++seq
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`Góc Nhà did not answer "${method}" within ${TIMEOUT_MS / 1000}s`))
    }, TIMEOUT_MS)
    pending.set(id, { resolve, reject, timer })
    ws.send(JSON.stringify({ type: 'request', id, method, params }))
  })
}

/** Run a bridge call and turn the result (or error) into MCP tool content. */
async function tool(method: string, params?: unknown) {
  try {
    const result = await call(method, params)
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  } catch (e) {
    return { content: [{ type: 'text' as const, text: (e as Error).message }], isError: true }
  }
}

// ---------- schemas ----------

const wall = z.enum(['top', 'right', 'bottom', 'left'])

const placement = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('wall'),
      wall,
      align: z.enum(['start', 'center', 'end']).optional().describe('Where along the wall; default center. "start" is the wall\'s start corner (see instructions).'),
      offset: z.number().optional().describe('Exact distance in cm from the wall start corner to the item\'s edge; overrides align'),
      gap: z.number().optional().describe('Floor items: distance in cm between the wall and the item\'s back; default 0'),
    }),
    z.object({
      type: z.literal('next_to'),
      target: z.string().describe('id of a floor item to place against'),
      side: z.enum(['left', 'right', 'front', 'back']).describe("Side of the target, in the target's own frame (front = the side it faces)"),
      gap: z.number().optional().describe('Distance in cm from the target; default 0'),
      face: z
        .enum(['same', 'toward', 'away'])
        .optional()
        .describe('Orientation: same as the target (default), facing the target (e.g. a chair at a desk: side "front", face "toward"), or facing away'),
    }),
    z.object({ type: z.literal('free').describe('Find a free floor spot automatically, preferring spots against a wall') }),
  ])
  .describe('Smart placement; computes position (and rotation for floor items) for you. Prefer this over raw x/y.')

const itemFields = {
  x: z.number().optional().describe('Floor items: centre x in cm (0 = left wall, grows to the right)'),
  y: z.number().optional().describe('Floor items: centre y in cm (0 = top wall, grows downward)'),
  w: z.number().optional().describe('Length in cm (along the item\'s width / along the wall)'),
  d: z.number().optional().describe('Floor items: depth in cm, back to front'),
  h: z.number().optional().describe('Height in cm'),
  rotation: z.number().optional().describe('Floor items: degrees clockwise. 0 = back towards the top wall, front facing down the plan'),
  color: z.string().nullable().optional().describe('Hex colour like "#4f81bd"; null resets to the default'),
  wall: wall.optional().describe('Wall items: which wall'),
  offset: z.number().optional().describe('Wall items: cm from the wall start corner to the item\'s start edge'),
  elevation: z.number().optional().describe('Wall items: cm from the floor to the bottom of the item'),
  hinge: z.enum(['left', 'right']).optional().describe('Doors only'),
  opening: z.enum(['in', 'out']).optional().describe('Doors only: swing into the room or out'),
  place: placement.optional(),
}

const change = z.discriminatedUnion('op', [
  z.object({ op: z.literal('add'), kind: z.string(), ...itemFields }),
  z.object({ op: z.literal('update'), id: z.string(), ...itemFields }),
  z.object({ op: z.literal('remove'), id: z.string() }),
])

// ---------- server ----------

const server = new McpServer(
  { name: 'goc-nha', version: '1.0.0' },
  {
    instructions: `Edits the user's room in the Góc Nhà room planner app live; the user watches the changes and can undo them (Ctrl+Z).

Plan coordinates, all in centimetres:
- Origin is the top-left inside corner. x runs along the room length to the right, y along the width downward.
- Walls: top (y=0), right (x=length), bottom (y=width), left (x=0). Wall start corners go clockwise: top starts top-left, right starts top-right, bottom starts bottom-right, left starts bottom-left. A wall item's offset is measured from that start corner.
- Floor items: (x, y) is the centre of the footprint; w = length, d = depth. rotation is clockwise degrees; at 0 the back faces the top wall and the front faces down the plan. A bed's back is its headboard.
- Layers: most floor items are solid furniture and must not overlap. Rugs (layer "rug") lie under furniture, ceiling lights (layer "ceiling") hang from the ceiling, and decor (table lamps, plants) stands on whatever solid item is under its centre (a desk, a nightstand) or on the floor; these never count as overlaps. To put a table lamp on a nightstand, give it the nightstand's x/y.
- Compass: get_room gives the direction each wall faces (e.g. "Nam") and frontFaces/backFaces for every item. Use these for feng shui requests ("đầu giường hướng Đông").

Workflow:
1. Call get_room first (and list_catalog if you need kinds or size limits).
2. Make changes, ideally in one apply_changes call so the user can undo them in one step. Prefer "place" (wall / next_to / free) over computing x/y yourself.
3. Read the returned layout: fix overlaps, items outside the room, blocked door swings and tight passages (< 60 cm).
4. Call snapshot to look at the result before telling the user you are done.

Item labels are Vietnamese; answer the user in their language.`,
  },
)

server.registerTool(
  'get_room',
  {
    title: 'Get room',
    description: 'Current room size, compass directions of the walls, every item with its position and facing, and layout problems.',
    annotations: { readOnlyHint: true },
  },
  () => tool('get_room'),
)

server.registerTool(
  'list_catalog',
  {
    title: 'List furniture catalog',
    description: 'All item kinds that can be added, with Vietnamese labels, default sizes and allowed size ranges.',
    annotations: { readOnlyHint: true },
  },
  () => tool('list_catalog'),
)

server.registerTool(
  'check_layout',
  {
    title: 'Check layout',
    description: 'Overlaps, items outside the room, furniture blocking a door, tight passages and how much floor is covered.',
    annotations: { readOnlyHint: true },
  },
  () => tool('check_layout'),
)

server.registerTool(
  'snapshot',
  {
    title: 'Snapshot',
    description: 'PNG picture of the room: the 2D plan (default) or the isometric 3D view. Use it to check your changes visually.',
    inputSchema: { view: z.enum(['2d', 'iso']).optional() },
    annotations: { readOnlyHint: true },
  },
  async ({ view }) => {
    try {
      const img = (await call('snapshot', { view: view ?? '2d' })) as { data: string; mimeType: string }
      return { content: [{ type: 'image' as const, data: img.data, mimeType: img.mimeType }] }
    } catch (e) {
      return { content: [{ type: 'text' as const, text: (e as Error).message }], isError: true }
    }
  },
)

server.registerTool(
  'set_room',
  {
    title: 'Set room',
    description: 'Change the room size or orientation. north is the plan angle north points to (0 = north is up / the top wall faces north; 90 = north points right).',
    inputSchema: {
      length: z.number().optional().describe('cm, 100–2000 (x axis)'),
      width: z.number().optional().describe('cm, 100–2000 (y axis)'),
      height: z.number().optional().describe('cm, 200–500'),
      north: z.number().optional().describe('degrees, 0–359'),
    },
  },
  (args) => tool('set_room', args),
)

server.registerTool(
  'add_item',
  {
    title: 'Add item',
    description: 'Add one item. kind comes from list_catalog. Without a position or "place", a free floor spot is found automatically; wall items default to the middle of a wall.',
    inputSchema: { kind: z.string(), ...itemFields },
  },
  (args) => tool('add_item', args),
)

server.registerTool(
  'update_item',
  {
    title: 'Update item',
    description: 'Move, resize, rotate or recolour one item by id. Only the given fields change.',
    inputSchema: { id: z.string(), ...itemFields },
  },
  (args) => tool('update_item', args),
)

server.registerTool(
  'remove_item',
  {
    title: 'Remove item',
    description: 'Delete one item by id.',
    inputSchema: { id: z.string() },
    annotations: { destructiveHint: true },
  },
  (args) => tool('remove_item', args),
)

server.registerTool(
  'apply_changes',
  {
    title: 'Apply changes',
    description:
      'Apply several add / update / remove changes in order as ONE undo step. Later changes can refer to items changed earlier; to place something next to an item added in the same batch, do it in a second call (ids are returned).',
    inputSchema: { changes: z.array(change).min(1) },
  },
  (args) => tool('apply_changes', args),
)

server.registerTool(
  'set_lighting',
  {
    title: 'Set lighting',
    description:
      'Simulate daylight for a time of day (sun direction follows the room compass) and switch the room lights. Returns which windows get direct sun. Take a snapshot afterwards to see the light; the iso view shows sun patches and shadows.',
    inputSchema: {
      time: z.enum(['off', 'morning', 'noon', 'afternoon', 'night']).optional().describe('off = neutral lighting; morning 8:00, noon 12:00, afternoon 16:30, night 23:00'),
      lightsOn: z.boolean().optional().describe('Room lamps on/off; defaults to on at night when time changes'),
    },
  },
  (args) => tool('set_lighting', args),
)

server.registerTool(
  'undo',
  { title: 'Undo', description: 'Undo the last change in the app (yours or the user\'s).' },
  () => tool('undo'),
)

server.registerTool(
  'redo',
  { title: 'Redo', description: 'Redo the last undone change.' },
  () => tool('redo'),
)

await server.connect(new StdioServerTransport())
