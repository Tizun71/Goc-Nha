# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Góc Nhà is a browser room planner (2D Konva editor + isometric three.js view) with an MCP server so Claude can edit the room live. pnpm monorepo, Node >= 22.6, pnpm 10.

## Commands

```bash
pnpm dev                 # web app + AI hub at http://localhost:5173
pnpm lint                # oxlint
pnpm typecheck           # tsc -b over all packages (project references)
pnpm test                # vitest run (projects: packages/*)
pnpm build               # tsc -b + vite build to apps/web/dist
pnpm mcp                 # start MCP server by hand (clients normally spawn it)

pnpm vitest run packages/core/src/layout/collision.test.ts   # single test file
pnpm vitest run -t "name of test"                            # single test by name
```

CI runs lint, typecheck, test, then `pnpm --filter @goc-nha/web build`. Run all four before pushing.

## Architecture

Rule: logic that does not need a browser lives in `@goc-nha/core` and has unit tests. All tests live in `packages/core`, next to the source (`foo.ts` + `foo.test.ts`).

- **`packages/core`** — pure TypeScript, no React/Konva/three.js. **No build step**: `package.json` `exports` point straight at `src/**/index.ts` (subpath entries like `@goc-nha/core/catalog`, `/ops`, `/layout`). Vite and `tsc` resolve sources directly. `draw2d` only uses the `CanvasRenderingContext2D` type, never runtime DOM.
- **`apps/web`** — React + zustand store (`src/store/store.ts`) holding room, items, selection, undo/redo (`past`/`future` snapshots of `RoomDoc`), and auto-save via `persist` (with `migrate` for old saves). Lighting/daylight is view state, not in undo history. The three.js iso view is lazy-loaded.
- **`packages/mcp-server`** — stdio MCP server; Node runs `src/server.ts` directly (type stripping, hence Node 22.6+). Holds no room state.

### AI edit flow

```
Claude ──stdio──> mcp-server ──WebSocket──> hub (/__dmr, Vite dev plugin apps/web/dev/ai-bridge-hub.ts) ──> browser apps/web/src/ai/bridge.ts
```

The browser store is the single source of truth. `bridge.ts` runs pure functions from `@goc-nha/core/ops` against current state, then applies the result via `commitDoc` as **one undo step**. The hub exists only in the dev server, so AI editing needs `pnpm dev` and an open browser tab. `DMR_APP_URL` overrides the app URL.

Adding an MCP tool touches three places: zod schema + `server.registerTool` in `packages/mcp-server/src/server.ts`, a handler in the method map in `apps/web/src/ai/bridge.ts`, and (for edits) logic plus tests in `packages/core/src/ops/ops.ts`. Update the tool table in `docs/mcp.md`.

### Furniture catalog

Each item is procedural: drawn in 2D and built as 3D boxes from its size. To add a kind (full guide: `docs/adding-furniture.md`):
1. Add it to `FloorKind` or `WallKind` in `packages/core/src/model/types.ts`.
2. Define it under `packages/core/src/catalog/kinds/` using helpers in `kinds/kit.ts` (draw2d, build3d, default/min/max size, category, layer).
3. Spread new definition files into `catalog/catalog.ts`.
4. `catalog.test.ts` checks every item draws/builds at default, min and max sizes.

Drawing conventions: floor items fill local `(0,0)–(w,d)`, back edge at `y=0`. Wall items run along `x ∈ [0,w]`, wall occupies `y ∈ [-T,0]`, `+y` into the room. `px` = one screen pixel in cm. Use `seededRandom` (`geometry/random.ts`) for variation so renders stay stable.

Layers (`model/layers.ts`): `solid` (only layer checked for overlaps and door swings), `rug` (under everything), `decor` (stands on solid item below), `ceiling`.

## Conventions

- All lengths are centimetres.
- UI text is Vietnamese; code, comments and docs are English.
- Every source file starts with `// SPDX-License-Identifier: AGPL-3.0-or-later`.
- TypeScript strict, avoid `any`.
- Conventional Commits; branches like `feat/...`, `fix/...`. Add user-visible changes to `Unreleased` in `CHANGELOG.md`.
- Visual style (cozy / kawaii / storybook; warm cream backgrounds, dark-brown `INK` outlines, playful illustration but precise numbers): see `docs/design.md`. Colour tokens live in `apps/web/src/styles/index.css` and `packages/core/src/catalog/draw2d.ts`.
