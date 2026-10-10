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

### Current tokens

Defined in `apps/web/src/styles/index.css` and `packages/core/src/catalog/draw2d.ts`:

| Token          | Value     | Use                         |
| -------------- | --------- | --------------------------- |
| `--bg`         | `#f7f4ee` | App background (cream)      |
| `--panel`      | `#ffffff` | Panels                      |
| `--ink`        | `#2b2420` | Text                        |
| `--muted`      | `#7a6f66` | Secondary text              |
| `--line`       | `#e7e0d6` | Borders                     |
| `--accent`     | `#2563eb` | Selection, measurements     |
| `--danger`     | `#dc2626` | Delete, problems            |
| `INK`          | `#3b2f2a` | Furniture outlines          |
| `FLOOR_COLOR`  | `#f4ede1` | Floor in the 2D plan        |

### Target palette

The cream base and brown ink already fit. The cold blue accent and pure white panels do not. Proposed tokens:

| Token            | Value     | Role                                                      |
| ---------------- | --------- | --------------------------------------------------------- |
| `--bg`           | `#f7f1e6` | Paper. Optional faint paper-grain texture                 |
| `--panel`        | `#fffaf2` | Panels, sheets (warm white)                               |
| `--ink`          | `#3b2f2a` | Text and outlines (same as `INK`, one ink for everything) |
| `--muted`        | `#8a7a6c` | Secondary text                                            |
| `--line`         | `#eadfce` | Soft borders                                              |
| `--accent`       | `#e8875b` | Terracotta: primary buttons, selection                    |
| `--accent-soft`  | `#fbe3d6` | Selected backgrounds, hover                               |
| `--measure`      | `#4a8fb8` | Dimension lines and distance labels (kept distinct from accent so numbers stay readable) |
| `--leaf`         | `#7fb069` | Success, plants, "all good"                               |
| `--sun`          | `#f6c35b` | Sun, lamps, highlights                                    |
| `--blush`        | `#f4b6c2` | Kawaii accent: cheeks, hearts, tiny decorations only      |
| `--night`        | `#3d3a5c` | Night mode overlay base                                   |
| `--danger`       | `#d9534f` | Problems. Warm red, still clearly a warning               |

Contrast rule: body text on `--bg` and `--panel` must meet WCAG AA (4.5:1). `--accent` is for fills with `--ink` or white bold text, not for small text on cream.

## Typography

- **UI and numbers:** keep a clean, rounded sans. Recommended: [Nunito](https://fonts.google.com/specimen/Nunito) or [Quicksand](https://fonts.google.com/specimen/Quicksand) for UI, both with full Vietnamese support. Use tabular figures for all sizes in cm.
- **Headings and brand:** a soft display face with storybook character, for example [Baloo 2](https://fonts.google.com/specimen/Baloo+2) (Vietnamese support). Only for the logo, panel titles and empty states.
- Never use a script or handwriting font for labels, sizes or warnings.

## Shape and depth

| Element            | Rule                                                                  |
| ------------------ | --------------------------------------------------------------------- |
| Buttons, inputs    | Radius 12px. Pill (999px) for toggles and segmented controls          |
| Cards, panels      | Radius 16px. Bottom sheet on mobile: 20px top corners                 |
| Shadows            | Soft and warm: `0 4px 14px rgba(59, 47, 42, 0.10)`. No black shadows  |
| Borders            | 1.5px in `--line`, or none when a shadow already separates            |
| Resize handles     | Round dots with a white fill and an ink outline, not squares          |

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

1. Swap the CSS tokens in `apps/web/src/styles/index.css` to the target palette, radii and shadows.
2. Load the fonts and switch numbers to tabular figures.
3. Round the resize handles and restyle the measurement labels with `--measure`.
4. Replace emoji with one icon set.
5. Add empty-state illustrations and the add-item pop animation.
