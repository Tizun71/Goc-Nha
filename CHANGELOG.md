# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Open-source release under AGPL-3.0-or-later, with contributing guide, code of conduct, security policy and CI.
- Source link in the toolbar.
- Share a room with a link. The whole room is stored in the link itself, so it needs no account or server.
- Front clearance check: wardrobes, cabinets, chests of drawers and desks warn when a wall or furniture blocks the space they need in front. The zone is drawn while the item is selected.
- Shopping list with the real size of every item to buy, identical items counted together, ready to copy. Also available to Claude as the `shopping_list` MCP tool.
- Starter rooms: a student room, a bedroom with a work corner and a studio, each a clean layout to start from.
- The shopping list warns when an item cannot be carried through any door of the room in one piece.
- An empty room now shows a card to start from a starter room or the catalog.
- Ceiling check: furniture taller than the room, or decor that reaches above the ceiling on top of the item below it, is flagged.
- A "Cần xem lại" list in the properties panel shows every layout problem; click one to select that item.

### Fixed

- The tight-passage check no longer flags a chair tucked in at a desk or table.
- A broken or hand-edited save no longer crashes the app on start. Invalid items are dropped, duplicate ids are removed, and a broken room falls back to the default room. Opened files and share links get the same checks.

### Changed

- The code is now a pnpm monorepo: `@goc-nha/core`, `@goc-nha/mcp-server` and `@goc-nha/web`.
- Icons in the interface are now [Lucide](https://lucide.dev) icons instead of emoji, so they look the same on every device.

## [0.1.0] - 2026-10-10

### Added

- 2D room editor with real-size, procedurally drawn furniture (about 90 items in 12 sections).
- Isometric 3D preview with shadows.
- Snapping, live measurements and warnings for overlaps, items outside the room and blocked doors.
- Compass, daylight simulation with a Vietnamese sun path, and room lamps.
- Undo/redo, auto-save, JSON import/export and PNG export.
- Mobile layout with a bottom sheet and touch quick actions.
- MCP server so that Claude Desktop and Claude Code can edit the room live.

[Unreleased]: https://github.com/Tizun71/Goc-Nha/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Tizun71/Goc-Nha/releases/tag/v0.1.0
