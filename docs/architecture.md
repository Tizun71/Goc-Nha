# Architecture

Góc Nhà is a pnpm monorepo with three workspace packages. The rule is simple: logic that does not need a browser lives in `@goc-nha/core`, and it has unit tests.

```
            ┌──────────────────────┐
            │    @goc-nha/core     │  pure TypeScript, no React / Konva / three.js
            └──────────┬───────────┘
                       │ imported by
            ┌──────────▼───────────┐       WebSocket (dev only)      ┌──────────────────────┐
            │    @goc-nha/web      │ ◄──── hub at /__dmr ──────────► │ @goc-nha/mcp-server  │ ◄── stdio ── Claude
            └──────────────────────┘                                 └──────────────────────┘
```

## `packages/core`

Each folder has an `index.ts` and is a public entry point, for example `@goc-nha/core/catalog`.

| Module          | Responsibility                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `model`         | Types (`Room`, `FloorItem`, `WallItem`, `RoomDoc`) and layers (`layerOf`, `supportOf`, `isSolid`)  |
| `geometry`      | Wall frames, footprints, door swing polygons, units and formatting, seeded random numbers          |
| `orientation`   | Compass bearings, sun path and window sun patches, room lights                                     |
| `layout`        | Collision and issue detection, snapping to walls and items                                         |
| `catalog`       | Furniture definitions: sizes, categories, 2D drawing (`draw2d`) and 3D boxes (`build3d`), per kind under `kinds/` |
| `serialization` | JSON export format, parsing and migration of old saves                                             |
| `ops`           | Room-editing operations used by the AI bridge: placement, validation, layout reports              |

The package has no build step. Its `exports` point at the TypeScript sources, and Vite and `tsc` resolve them directly. `draw2d` only uses the `CanvasRenderingContext2D` type, so it stays free of runtime DOM access.

## `apps/web`

| Folder               | Responsibility                                                         |
| -------------------- | ---------------------------------------------------------------------- |
| `src/store`          | zustand store: room, items, selection, lighting, undo/redo, auto-save  |
| `src/features/editor`| Konva 2D canvas, item nodes, measurements, 2D lighting, PNG export     |
| `src/features/iso`   | three.js isometric preview, loaded lazily                              |
| `src/features/panels`| Toolbar, room form, catalog and properties panels                      |
| `src/ai`             | Browser side of the AI bridge                                          |
| `src/app`            | App-wide hooks such as keyboard shortcuts                              |
| `src/hooks`, `src/lib` | Small React hooks and DOM helpers                                    |
| `dev`                | Vite plugin for the WebSocket hub (dev server only)                    |

## `packages/mcp-server`

A stdio MCP server. It defines the tools with zod schemas and forwards each call to the hub, which relays it to the open app. The server holds no room state: the browser store is the single source of truth, so AI changes and user changes share one undo history.

## Data flow for an AI change

1. Claude calls a tool, for example `add_item`.
2. `mcp-server` sends a request over WebSocket to the hub in the Vite dev server.
3. The hub forwards it to the browser, where `ai/bridge.ts` runs the matching function from `@goc-nha/core/ops` against the current store state.
4. The store applies the result as one undo step, and the bridge sends the answer back along the same path.
