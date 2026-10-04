# draw-crossings-tile-through-the-bevel-helper

Found by `read-bevels-off-the-frames`.

## Why

The `ts-engine` requirement on the raised bevel has a scenario "No game
re-derives the bevel", and Crossing did. `drawBevelTile` in
`src/games/crossing/render.ts` drew the same two triangles as
`drawRaisedBevel`, with a border of `floor(ts / 10)` where the shared
`raisedBevelWidth` is `max(1, floor(ts / 16))`. So Crossing's walls and placed
digits had a thicker bevel than every other raised tile, and its border reached
zero below a tile size of 10, the case the shared formula's floor exists for.

The scan that held the scenario (`src/engine/raised-bevel.test.ts`) could not
see it. It matched the source text `COL_LOWLIGHT, COL_LOWLIGHT` followed by
`COL_HIGHLIGHT, COL_HIGHLIGHT`, and Crossing's helper took its colors as
parameters named `low` and `high`. This is the name-keyed scan of
`AGENTS.md` § "Method" again.

Moving Crossing showed a second thing. Crossing, Inertia and Sokoban keep a grid
line at each tile's top and left, and all three beveled the whole tile and
clipped the line off, then inset the face from the unclipped box. That takes a
pixel from the right and bottom borders only: the left and top were
`raisedBevelWidth` wide and the right and bottom one less, which is nothing at
all below a tile size of 32. It was upstream's arithmetic in all three, and the
helper could not fix it because the inner fill was each caller's.

## What Changes

- **`drawRaisedTile(dr, body, tileSize, face, highlight, lowlight)`** in
  `engine/draw.ts` draws the bevel and the face. The six games that drew a
  raised tile call it; none computes a bevel width or an inner rectangle.
  `drawRaisedBevel` stays for Pegs, whose relief has no face.
- **Crossing** draws walls and placed digits through it, at the shared width.
  Its private clip and its first full-tile fill are gone: the body is the box
  inside the grid line, so nothing is drawn outside it.
- **Inertia and Sokoban** pass the box inside the grid line as the body, so
  their walls have the same border on all four sides.
- **The guard is re-founded on shape.** `src/puzzle/bevels.test.ts` (renamed
  from `bevel-order.test.ts`) reads each game's sample frames for bevels and
  counts the game's calls to the shared helpers while they are drawn; the two
  must be equal, for the raised tile and for the recessed frame. Seen red on
  Crossing (31 bevels, no calls) before Crossing moved.
- **`raised-bevel.test.ts` is retired.** Its key was two constant names, and
  the one game that re-derived the bevel did not use them. What it covered that
  the new guard does not is a bevel drawn only on a frame the sample does not
  take (a drag, a flash), and only when written with those two names.

## Decided

- **Crossing takes the shared width.** Looked at in the app in both schemes
  with digits placed: a placed digit still reads as raised and a wall as
  pressed in, and the tile matches the other raised tiles in the collection.
- **The width comes from the tile size, not the body.** Reading it off the
  body would be one argument fewer, but a body inside a grid line is one short
  of the tile size, so at a tile size of 32 Sokoban's walls would have had a
  1-pixel border where Mines' tiles have 2.

## Acceptance

Player-visible: Crossing's bevels are thinner (a 40-pixel tile goes from 4
pixels to 2) and even on all sides; Inertia's and Sokoban's walls gain a pixel
of lowlight on the right and bottom. Fifteen, Sixteen and Mines draw the same
operations as before, which their render snapshots hold.
