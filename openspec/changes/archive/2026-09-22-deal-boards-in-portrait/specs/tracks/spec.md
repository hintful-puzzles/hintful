## MODIFIED Requirements

### Requirement: Tracks game implements the Game interface

The engine SHALL provide a registered `tracks` game implementing
`Game<TracksParams, TracksState, TracksMove, TracksUi, TracksDrawState,
TracksMistake>`: lay a single continuous train track from an entrance on the
left edge to an exit on the bottom edge of a `w × h` grid, using only straight
and curved rails that neither cross nor form a loop, so every row and column
clue counts the number of track-bearing cells in that row/column. Params SHALL
be `w`, `h`, `diff` (Easy / Normal / Tricky) and `single_ones` (disallow
consecutive 1-clues), encoded `{w}x{h}` with a full-form `d{e|t|h}` difficulty
suffix and an `o` suffix when `single_ones` is false (square shorthand `{n}`).
Upstream's 12 presets SHALL be offered, its landscape sizes turned to
draw taller than wide (8×10, 10×15). `validateParams` SHALL enforce a
minimum size of 4×4. The game SHALL report `canSolve = true` and
`canFormatAsText = true`, and SHALL drive a completion flash suppressed after
Solve.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 8, diff: DIFF_TRICKY, single_ones: false }` (the
  Normal tier) are encoded in full
- **THEN** the result is `10x8dto` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a grid smaller than 4×4
- **THEN** it returns a non-null error string
