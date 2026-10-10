# Adding a furniture type

Every item is drawn in code from its size, in 2D (Canvas) and in 3D (boxes for three.js). To add a new kind:

1. Add the kind to `FloorKind` or `WallKind` in `packages/core/src/model/types.ts`.
2. Write its definition in the matching file under `packages/core/src/catalog/kinds/`: the 2D drawing, the 3D boxes, the default, minimum and maximum sizes, the catalog category, and the layer (floor items only). Use the helpers in `kinds/kit.ts`.
3. Spread the definitions into `packages/core/src/catalog/catalog.ts`, if the file is new.
4. Run `pnpm test`. `catalog/catalog.test.ts` checks that every item draws and builds at its default, minimum and maximum sizes.
5. Run `pnpm dev`, add the item from the catalog, resize it, and check it in the isometric view.

## Drawing conventions

- All lengths are in centimetres.
- Floor items draw in their local frame: they fill `(0,0)–(w,d)`, with the back edge at `y = 0` and the front at `y = d`.
- Wall items run along `x` in `[0, w]`. The wall occupies `y` in `[-T, 0]`, and `+y` points into the room.
- `px` is the size of one screen pixel in centimetres. Use it for crisp line widths.
- Use `seededRandom` from `geometry/random.ts` for variation, so that an item looks the same on every render.

## Front clearance

If the item needs free floor in front of it to be used (doors, drawers, a chair that slides back), add it to `FRONT_CLEARANCE` in `packages/core/src/layout/clearance.ts`. The layout check then warns when a wall or solid furniture other than seating stands in that zone.

## Layers

- `solid`: furniture. The only layer that is checked for overlaps and door swings.
- `rug`: rugs. They lie under everything.
- `decor`: lamps, plants, blankets, cushions and small appliances. They stand on the solid item below them.
- `ceiling`: ceiling lights and hanging planters.
