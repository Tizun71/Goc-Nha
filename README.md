<img src="public/brand-logo.png" alt="Góc Nhà" width="160" />

# Góc Nhà

*Xếp phòng trước khi mua đồ.* Enter your room's length and width, place furniture drawn in code at its real size (in centimetres), and check the layout in 2D or in an isometric 3D view, with daylight for any time of day.

The name means "a corner of home": the cosy spot you are planning, before you buy a single piece of furniture.

## Getting started

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm test     # unit tests (vitest)
pnpm build    # type check + production build
```

## Features

- Room length, width and height in cm, with a 10/50/100 cm grid.
- About 90 items in 12 catalog sections, with accent-insensitive search (Vietnamese or English names):
  - Beds: standard, platform, canopy, upholstered, storage, tatami, daybed.
  - Storage: wardrobe, armoire, chest of drawers, nightstand, bookshelf, fishbone bookshelf, open shelving, cabinet, floating shelf, safe, laundry basket, wall hook.
  - Tables: desk, writing desk, console, coffee, side and dining tables. Seating: chair, accent, lounge, rocking and reading chairs, bean bag.
  - Lighting: ceiling light, pendant, floor lamp, table lamp, candle holder, wall sconce, LED strip, string lights, fluorescent tube.
  - Textiles (throw and knitted blankets, duvet, cushions) and rugs (area, shag, jute, Persian, layered).
  - Plants and pots: monstera, fiddle leaf fig, snake plant, pothos, olive tree, bonsai, pampas grass, ceramic and terracotta pots, plant stand, hanging planter.
  - Wall decor: wall art, gallery wall, framed poster, canvas art, mirrors, wood panelling, floating frame, wall clock.
  - Lifestyle corners: book stack, coffee station and cart, espresso machine, mug shelf, record player, vinyl shelf, speaker, projector.
  - Doors, windows and curtains; air conditioner, fans and power outlets.
- Items sit on layers: rugs lie under furniture, decor (lamps, plants, blankets, cushions, small appliances) stands on whatever solid item is below it, and ceiling lights and hanging planters hang from the ceiling. Only solid furniture is checked for overlaps.
- Every item is drawn procedurally from its size, so details reflow when you resize it (for example, wardrobe doors are added as it gets wider, and a bed gets two pillows at 120 cm and wider).
- Resize with the handles or type exact sizes, rotate (with snapping to 90°), duplicate and delete.
- Snapping to walls and to the edges of other items, with live distances to the walls.
- Warnings for overlapping items, items outside the room and furniture that blocks a door's swing.
- Undo/redo, auto-save to localStorage, JSON export/import and PNG export.
- Compass: set which way the room faces (8 directions or exact degrees). The plan shows a compass rose and the direction of each wall, and the properties panel shows where a door, window or bed faces.
- Daylight simulation: pick morning, noon, afternoon or night. The sun's direction follows the room's compass (typical sun path for Vietnam). The plan shows sun patches through each window and a sun/moon marker; at night the room goes dark and the lamps light it. The isometric view casts real shadows, and sunlight only enters through windows. Lamps (ceiling light, table/wall lamps, LED strips, fluorescent tubes) can be switched on at any time.
- Isometric 3D preview (three.js) built from the same data, viewable from all four corners.

## Structure

```
src/
  model/      types and zustand store (undo/redo, persistence)
  furniture/  catalog, 2D drawing functions, 3D box builders
  editor/     Konva canvas, nodes, snapping and collision
  iso/        isometric preview
  ui/         toolbar and side panels
  lib/        geometry, units, import/export
```

To add a furniture type, add its kind to `model/types.ts`, then write its definition (2D drawing, 3D boxes, sizes, category and layer) in the matching file under `furniture/kinds/` and spread it into `furniture/catalog.ts`. `src/__tests__/catalog.test.ts` checks every item draws and builds at its default, minimum and maximum sizes.

## Let Claude edit the room (MCP)

The app ships an MCP server so Claude Desktop and Claude Code can read and change the room live. Every change goes through the app's store, so you see it happen and can undo it with Ctrl+Z (a batch of AI changes is one undo step).

```
Claude Desktop / Claude Code ──stdio──> mcp/server.ts ──WebSocket──> hub in the Vite dev server (/__dmr) ──> app in the browser
```

1. Run `pnpm dev` and open http://localhost:5173. The toolbar shows "AI đã kết nối" once a Claude client is attached.
2. Connect a client:
   - **Claude Code**: the project's `.mcp.json` registers the server. Start `claude` in this folder and approve `design-my-room` (the server's registration key; it shows up as Góc Nhà).
   - **Claude Desktop**: add this to `%APPDATA%\Claude\claude_desktop_config.json` (Microsoft Store install: `%LOCALAPPDATA%\Packages\Claude_*\LocalCache\Roaming\Claude\claude_desktop_config.json`; macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`) and restart Claude Desktop:

     ```json
     {
       "mcpServers": {
         "design-my-room": {
           "command": "node",
           "args": ["D:/Workspace/Start up/design-my-room/mcp/server.ts"]
         }
       }
     }
     ```

Both clients can be connected at the same time. The server needs Node 22.6 or newer (it runs the TypeScript file directly). Set `DMR_APP_URL` if the app runs somewhere other than http://localhost:5173.

Tools: `get_room`, `list_catalog`, `check_layout`, `snapshot` (PNG of the 2D plan or the isometric view), `set_lighting` (time of day, lamps on/off), `set_room`, `add_item`, `update_item`, `remove_item`, `apply_changes`, `undo`, `redo`. Items can be positioned with `place`: against a wall (`wall`), relative to another item (`next_to`, e.g. a chair in front of a desk facing it) or on any free spot (`free`).

The editing logic lives in `src/ai/ops.ts` (pure functions, unit tested); `src/ai/bridge.ts` runs requests in the browser and `mcp/hub.ts` relays messages.
"# Goc-Nha" 
