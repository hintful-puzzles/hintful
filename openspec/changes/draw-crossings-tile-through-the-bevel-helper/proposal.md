# draw-crossings-tile-through-the-bevel-helper

**Status: scaffolded, not started (2026-10-04).** Found by
`read-bevels-off-the-frames`.

## Why

The `ts-engine` requirement on the raised bevel has a scenario "No game
re-derives the bevel", and Crossing does. `drawBevelTile` in
`src/games/crossing/render.ts` draws the same two triangles as
`drawRaisedBevel` (read 2026-10-04), with a border of `floor(ts / 10)` where the
shared `raisedBevelWidth` is `max(1, floor(ts / 16))`. So Crossing's walls and
placed digits have a thicker bevel than every other raised tile, and its
border reaches zero below a tile size of 10, the case the shared formula's
floor exists for.

The scan that holds the scenario (`src/engine/raised-bevel.test.ts`) cannot
see it. It matches the source text `COL_LOWLIGHT, COL_LOWLIGHT` followed by
`COL_HIGHLIGHT, COL_HIGHLIGHT`, and Crossing's helper takes its colors as
parameters named `low` and `high`. This is the name-keyed scan of
`AGENTS.md` § "Method" again.

## What Changes

To be designed. The shape to try first:

- Crossing draws its tile through `drawRaisedBevel` and sizes the inner fill
  with `raisedBevelWidth`. The pressed-in form passes the two colors the other
  way round, as it does today. Its clip and its `tx + 1` inset stay
  Crossing's own.
- The scan is re-founded on shape. `bevelPairs` in
  `src/puzzle/bevel-order.test.ts` already finds a bevel on the frames
  whatever its colors are called. Which games emit one without calling the
  helper is the population the scenario means; ask whether the source scan is
  still needed beside it.

## Acceptance

Player-visible: Crossing's bevels get thinner (a 32-pixel tile goes from 3
pixels to 2). Look at it in both schemes before deciding it is better; if the
thicker border is what makes a placed digit read as placed, the answer may be
to keep Crossing's width and say why in the requirement.
