# Visual design

Góc Nhà should feel like opening a picture book about your own room: warm, soft, a little playful, and never like CAD software. The visual language combines three styles:

| Style                        | What we take from it                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| **Cozy Room Illustration**   | Warm light, wood and fabric tones, plants, lamps, "lived-in" small details            |
| **Kawaii Art**               | Round shapes, chunky outlines, soft pastel accents, small moments of delight          |
| **Storybook Illustration**   | Paper texture, hand-drawn feel, gentle narrative ("a corner of home"), calm layouts   |

The rule that holds them together: **the illustration is playful, the measurements are serious.** Sizes, warnings and numbers stay precise and readable. The charm lives in the room, the furniture and the empty states, not in the data.

The app icon (`apps/web/public/icon-512.png`) is the reference: an isometric corner with a dark brown outline, beige walls, a warm wood floor, a sun, a window and a plant.

## Principles

1. **Warm, not white.** Backgrounds are cream and paper, never pure `#fff` on large areas.
2. **Soft, not sharp.** Generous corner radii, round handles, no hard 1px boxes where a soft shadow works.
3. **Outlined, like a drawing.** Furniture and illustrations use one dark brown ink outline (`INK`), the way a storybook artist inks a sketch.
4. **Cute in small doses.** One kawaii touch per screen at most (a smiling plant in an empty state, a sleepy moon at night). Never on warnings or numbers.
5. **Light tells the time.** Morning, noon, afternoon and night change the mood of the room. This is the storybook "page turn" of the app.

## Colour

The app shell (toolbar, panels, menus) is a quiet design tool: warm paper canvas, near-white panels, one calm accent used on purpose. The charm lives in the room and the furniture, not in the chrome around it.

Tokens live in `apps/web/src/styles/index.css` (UI) and `packages/core/src/catalog/draw2d.ts` (drawing):

| Token            | Value     | Use                                                        |
| ---------------- | --------- | ---------------------------------------------------------- |
| `--bg`           | `#f5f1ea` | Canvas and app background (paper)                          |
| `--panel`        | `#fffdf9` | Toolbar and sidebars (warm white)                          |
| `--float`        | `#ffffff` | Popovers, floating controls and inputs over panels         |
| `--sunken`       | `#f3eee6` | Segmented control tracks, chips, hover                     |
| `--ink`          | `#2f2622` | Text                                                       |
| `--muted`        | `#74685e` | Labels and secondary text (AA on `--panel`)                |
| `--line`         | `#e6ded2` | Borders and dividers                                       |
| `--accent`       | `#2f6f5e` | The one primary action, active tab, focus ring             |
| `--accent-soft`  | `#e4efea` | Hover on catalog items, input focus halo                   |
| `--danger`       | `#c2413b` | Delete, layout problems                                    |
| `--ok`           | `#3c7a4a` | "All good" states                                          |
| `INK`            | `#3b2f2a` | Furniture outlines                                         |
| `FLOOR_COLOR`    | `#f4ede1` | Floor in the 2D plan                                       |

Rules:

- One primary button per screen area (toolbar: "Chia sẻ"). Everything else is a quiet default or ghost button.
- Measurements and selection on the canvas keep their own blue, so numbers never look like buttons.
- Body text on `--bg` and `--panel` must meet WCAG AA (4.5:1). White text only on `--accent` or darker.

## Typography

- **UI and numbers:** keep a clean, rounded sans. Recommended: [Nunito](https://fonts.google.com/specimen/Nunito) or [Quicksand](https://fonts.google.com/specimen/Quicksand) for UI, both with full Vietnamese support. Use tabular figures for all sizes in cm.
- **Headings and brand:** a soft display face with storybook character, for example [Baloo 2](https://fonts.google.com/specimen/Baloo+2) (Vietnamese support). Only for the logo, panel titles and empty states.
- Never use a script or handwriting font for labels, sizes or warnings.

## Shape, spacing and depth

| Element            | Rule                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| Spacing            | 4px scale (`--s1` 4 … `--s6` 24)                                             |
| Buttons, inputs    | 32px high (40px on touch), radius `--r-md` 10px                              |
| Segmented controls | Sunken track, the active option is a raised white chip                       |
| Popovers, cards    | Radius `--r-lg` 14px                                                         |
| Shadows            | Only on floating layers (`--shadow-float`, `--shadow-pop`). Panels use lines |
| Hierarchy          | Type, spacing and dividers. No cards nested in cards                         |
| Focus              | Every control shows a 2px `--accent` ring on `:focus-visible`                |

## Layout

- Canvas first. Toolbar on one line: view · light · history, then help, export, share (primary) and a "⋯" menu for file actions.
- Left sidebar has two tabs, "Nội thất" (library) and "Phòng" (size, direction, starter rooms). Right sidebar is the inspector: room overview when nothing is selected, the item's properties when something is.
- Both sidebars collapse to a 44px rail; the room refits to the space.
- Keyboard shortcuts live in the help popover, not on screen.

## Illustration and furniture

The 2D plan and the catalog thumbnails are the heart of the style. They are drawn in code (`packages/core/src/catalog/`), so these rules apply to every new kind (see [adding-furniture.md](adding-furniture.md)):

- **Outline:** one `INK` stroke around every shape, slightly heavier on the silhouette than on inner details.
- **Fill:** flat colours with one lighter tone for the top or highlight (`shade(color, +0.08)`). No gradients except light pools from lamps.
- **Corners:** round every rectangle a little (`r` in `box()`), so wood and fabric look soft.
- **Details that make it cozy:** pillows on beds, books with mixed colours (`BOOK_COLORS`), leaves on plants, folds on blankets. Use `seededRandom` so each item looks hand-made but stays the same on every render.
- **Kawaii touches (optional, small):** a tiny face on a plant pot or a bean bag in thumbnails and empty states only, never in the room plan itself, where it would distract from the layout.
- **Isometric view:** same palette, warm ambient light, soft shadows. It should look like a storybook diorama of the room.

## Light and time of day

| Time       | Mood                                                         |
| ---------- | ------------------------------------------------------------ |
| Morning    | Pale gold light, long soft sun patches                       |
| Noon       | Bright, short patches, the most neutral colours              |
| Afternoon  | Warm orange light, cozy                                      |
| Night      | Room dims to `--night`, lamps glow in `--sun`, a small moon  |

## Iconography

- Rounded line icons with a 2px stroke in `--ink`, or small filled illustrations in the palette.
- Replace mixed emoji in the toolbar and tab bar over time with one consistent icon set, so the UI looks drawn by one hand.

## Motion

- Short and soft: 150–250 ms, `ease-out`.
- A small "pop" (scale 0.95 → 1) when an item is added from the catalog.
- The bottom sheet slides up with a gentle overshoot.
- Respect `prefers-reduced-motion`: turn off pop and overshoot.

## Empty states and copy

- Tone: warm and encouraging, in Vietnamese, like a friend helping you set up a room. For example: "Phòng còn trống, thêm chiếc giường đầu tiên nhé!"
- Empty states can carry one small storybook illustration (an empty corner with a sleepy cat or a plant).
- Warnings stay plain and exact: "Chồng lên đồ khác", "Chặn cửa", never a cute phrasing.

## Do and don't

| Do                                                     | Don't                                                    |
| ------------------------------------------------------ | -------------------------------------------------------- |
| Cream and paper backgrounds                            | Large pure-white or grey "dashboard" surfaces            |
| One brown ink for outlines and text                    | Black outlines or many outline colours                   |
| Round corners and soft warm shadows                    | Sharp boxes and hard black shadows                       |
| Kawaii details in thumbnails and empty states          | Faces or stickers on warnings, numbers or the plan       |
| Precise, readable dimensions in a distinct colour      | Decorative fonts for measurements                        |

## Rollout

1. ~~Swap the CSS tokens in `apps/web/src/styles/index.css`~~ (done: hybrid shell tokens above).
2. Load the fonts and switch numbers to tabular figures.
3. Round the resize handles and restyle the measurement labels with `--measure`.
4. ~~Replace emoji with one icon set~~ (done: lucide).
5. Add empty-state illustrations and the add-item pop animation.
