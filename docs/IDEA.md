# Góc Nhà: the idea

> **Plan your room before you buy furniture.** (*Xếp phòng trước khi mua đồ.*)

Góc Nhà ("a corner of home") is a browser-based room planner. You enter your room's real size in centimetres, place furniture at its real size, and check the layout in 2D and in an isometric 3D view, with daylight for any time of day. Claude can also act as a co-designer: it reads and edits the room live through MCP.

For setup, the feature list and the code structure, see [README.md](../README.md). This document covers why the product exists and where it could go.

## Problem

- People buy a bed, wardrobe or desk and then find that it does not fit, blocks a door, or makes the room feel cramped.
- The usual method is a tape measure, a sketch on paper, and guessing.
- Small rooms leave very little margin for error. Rented rooms, student rooms and first apartments in Vietnamese cities are often 10–20 m².
- Existing planners are often heavy, paid, desktop-only, or built for Western homes and products. Few of them work in centimetres first, have a Vietnamese interface, or model the local sun path.

## Solution

1. Enter the room's length, width and height in cm.
2. Pick furniture from a catalog and drop it into the room. Every item is drawn from its dimensions, so it stays correct when you resize it.
3. Check the layout:
   - Overlap warnings, items outside the room, furniture in a door's swing.
   - Live distances to the walls and snapping to walls and other items.
   - An isometric 3D view from all four corners.
   - Daylight by compass direction and time of day (morning, noon, afternoon, night), with lamps for the evening.
4. Export the plan as PNG or JSON, or ask Claude to rearrange it.

## Target users

- Renters and students in small rooms who want the most from little space.
- People who are moving and want to know what fits before they buy or ship furniture.
- Young couples furnishing a first home on a budget.
- Decorators of cosy corners ("góc chill"): a reading nook, a coffee corner, a vinyl corner, a desk setup.

## What makes it different

- **Procedural furniture.** About 90 items in 12 catalog sections. Each item is drawn in code from its size, so details reflow when you resize it: wardrobe doors are added as it gets wider, and a bed gets two pillows from 120 cm.
- **Layer model.** Rugs lie under furniture, decor stands on whatever solid item is below it, and ceiling lights hang from the ceiling. Only solid furniture is checked for collisions, so the warnings stay meaningful.
- **Light and orientation.** You set the compass direction of the room. The sun follows a typical Vietnamese sun path and only enters through windows. At night the room goes dark and the lamps light it.
- **AI co-designer through MCP.** Claude Desktop or Claude Code connects to the running app. Claude can read the room, check the layout, take snapshots, and add, move or remove items. Each batch of AI changes is one undo step, so the user stays in control.
- **Vietnamese first.** The interface is in Vietnamese. Catalog search ignores accents and accepts Vietnamese or English names.
- **Lightweight.** Runs in the browser, saves to localStorage, and needs no account.

## Current status

Done:

- 2D editor (Konva): drag, resize, rotate with 90° snapping, duplicate, delete, undo/redo.
- Isometric 3D preview (three.js) built from the same data, with real shadows.
- Catalog of beds, storage, tables, seating, lighting, textiles, rugs, plants, wall decor, lifestyle corners, doors, windows and appliances.
- Collision, out-of-room and door-swing warnings.
- Compass and daylight simulation.
- Auto-save, JSON import/export, PNG export.
- MCP server with these tools: `get_room`, `list_catalog`, `check_layout`, `snapshot`, `set_lighting`, `set_room`, `add_item`, `update_item`, `remove_item`, `apply_changes`, `undo`, `redo`.
- Unit tests for the catalog, collision, snapping, compass, sun, units and AI operations.

In progress:

- **Mobile and touch layout.** The canvas fills the screen. The panels (furniture, room, properties) open in a bottom sheet from a tab bar. Quick actions (rotate, duplicate, edit, delete) float over the selected item. The hints describe touch gestures (tap, drag, pinch to zoom) instead of keyboard shortcuts.
- **More catalog items**, for example a rope shelf for the wall.

## Roadmap ideas

These are ideas, not commitments.

- **Share a room** with a link, so a partner, landlord or friend can see the plan.
- **Templates and presets:** typical room sizes and starter layouts (student room, studio, bedroom with a work corner).
- **Non-rectangular rooms:** L-shapes, columns, alcoves and sloped ceilings.
- **Real products:** link catalog items to real products with their real sizes, photos and prices.
- **Budget:** a running total of the items in the plan.
- **AI layout from a prompt:** for example "a 3×4 m bedroom with a desk by the window and space for a yoga mat", and Claude proposes several layouts to compare.
- **PWA and offline use:** install on a phone and measure the room on site.
- **Measure from a photo or AR** to fill in the room size faster.

## Business angle

- The core planner stays free.
- Possible revenue: affiliate links and partnerships with furniture shops and marketplaces, where Góc Nhà sends buyers who already know the item fits.
- Possible premium features: AI-generated layouts, more styles and catalog packs, high-resolution renders.

## Open questions

- How far can the product go with rectangular rooms only?
- Where do accurate dimensions for real products come from: shop feeds, manual entry, or user submissions?
- Hosted AI inside the app, or bring your own Claude through MCP? There are trade-offs in cost, setup and reach.
- Is mobile the main way to plan, or a companion to the desktop editor?
