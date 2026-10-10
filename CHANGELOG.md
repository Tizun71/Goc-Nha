# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Open-source release under AGPL-3.0-or-later, with contributing guide, code of conduct, security policy and CI.
- Source link in the toolbar.

### Changed

- The code is now a pnpm monorepo: `@goc-nha/core`, `@goc-nha/mcp-server` and `@goc-nha/web`.

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
