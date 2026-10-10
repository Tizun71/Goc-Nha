# Let Claude edit the room (MCP)

Góc Nhà ships an [MCP](https://modelcontextprotocol.io) server, so Claude Desktop and Claude Code can read and change the room live. Every change goes through the app's store. You see each change happen, and you can undo it with Ctrl+Z. A batch of AI changes is one undo step.

```
Claude Desktop / Claude Code ──stdio──> packages/mcp-server ──WebSocket──> hub in the Vite dev server (/__dmr) ──> app in the browser
```

## Setup

1. Run `pnpm dev` and open http://localhost:5173. When a Claude client is attached, the toolbar shows "AI đã kết nối".
2. Connect a client:
   - **Claude Code**: the project's `.mcp.json` registers the server. Start `claude` in the repository root and approve `design-my-room`.
   - **Claude Desktop**: add this to `claude_desktop_config.json` and restart Claude Desktop. Replace `<path-to-repo>` with the absolute path of your clone.

     ```json
     {
       "mcpServers": {
         "design-my-room": {
           "command": "node",
           "args": ["<path-to-repo>/packages/mcp-server/src/server.ts"]
         }
       }
     }
     ```

     The config file is at `%APPDATA%\Claude\claude_desktop_config.json` on Windows (Microsoft Store install: `%LOCALAPPDATA%\Packages\Claude_*\LocalCache\Roaming\Claude\claude_desktop_config.json`) and at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS.

You can connect both clients at the same time. The server needs Node 22.6 or newer, because it runs the TypeScript file directly. Set `DMR_APP_URL` if the app runs somewhere other than http://localhost:5173 (see `.env.example`).

## Tools

| Tool            | What it does                                                    |
| --------------- | --------------------------------------------------------------- |
| `get_room`      | Read the room size, wall directions, all items and layout problems |
| `list_catalog`  | List the furniture kinds with their sizes                       |
| `check_layout`  | Report overlaps, items outside the room, blocked doors, tight passages and floor coverage |
| `snapshot`      | PNG of the 2D plan or the isometric view                        |
| `set_lighting`  | Set the time of day and switch lamps on or off                  |
| `set_room`      | Change the room size or compass direction                       |
| `add_item`      | Add one item                                                    |
| `update_item`   | Move, resize, rotate or recolour one item                       |
| `remove_item`   | Remove one item                                                 |
| `apply_changes` | Apply several changes as one undo step                          |
| `undo`, `redo`  | Step through the history                                        |

You can position items with `place`: against a wall (`wall`), relative to another item (`next_to`, for example a chair in front of a desk, facing it), or on any free spot (`free`).

## Where the code lives

- `packages/core/src/ops/ops.ts`: the editing logic. Pure functions with unit tests.
- `apps/web/src/ai/bridge.ts`: runs requests in the browser against the store.
- `apps/web/dev/ai-bridge-hub.ts`: the Vite plugin that relays messages. It runs only in the dev server.
- `packages/mcp-server/src/server.ts`: the MCP tool definitions.
