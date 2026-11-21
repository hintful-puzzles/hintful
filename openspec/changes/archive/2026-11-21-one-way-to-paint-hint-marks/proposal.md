## Why

`architectural-review-second-pass` item 4 (owner accepted every item,
2026-11-21). 64 games read a hint's marks through `stepMarks`, then paint
them in several forms. Measured at `22ba4e45f`, by which of `HintMarks`,
`MarkOutlines`, `OverlaySidecar` and `drawMarkSides` each game's non-test
source calls: none 26 (four through a shared renderer), `HintMarks` with
`OverlaySidecar` 14, `drawMarkSides` alone 11, `OverlaySidecar` with
`drawMarkSides` 5, `HintMarks` with `MarkOutlines` 3, other mixes 6. The
marks are one contract in every game, so a fix to how a mark looks should
reach every game.

## What Changes

- A census, as `engine-owns-the-redraw-loop` took: sort the forms into
  real variants (a ring around a cell, a band inside a tile, marks on
  edges, marks on tiles that move) and copies of one shape.
- One engine painter for each real variant; games move onto it in batches,
  each run in the app.
- Where games of one variant drew a mark differently, they now draw it the
  same way. That is player-visible and pre-approved for consistency (owner,
  2026-11-21).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

`engine-hints` or `engine-drawing` where a variant's look is stated;
the game specs where a game's marks change.

## Impact

`src/engine/render/hint-mark.ts`, `overlay-sidecar.ts`, the games'
`render.ts`, the skeletons, `docs/hints-marks.md`, `docs/rendering.md`,
render snapshots that move.
