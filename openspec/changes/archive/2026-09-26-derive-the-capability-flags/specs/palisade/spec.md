## MODIFIED Requirements

### Requirement: Palisade game implements the Game interface

The engine SHALL provide a registered `palisade` game implementing
`Game<PalisadeParams, PalisadeState, PalisadeMove, PalisadeUi, PalisadeDrawState, PalisadeMistake>`:
a region-division puzzle (Nikoli's "Five Cells") in which numeric clues count
the walls around each cell, and the player draws walls so the grid divides into
connected regions of exactly `k` cells with every clue equal to its cell's wall
count. Params SHALL be `w`, `h`, and `k` (region size), encoded `{w}x{h}n{k}`.
Four presets — 5×5n5, 6×8n6, 8×10n8, 12×15n10, upstream's sizes turned to
draw taller than wide — SHALL be offered, and
the type summary SHALL render via the `width`/`height`/`region-size` config
keys. `validateParams` SHALL require `k ≥ 1`, `w ≥ 1`, `h ≥ 1`, `k` dividing
`w·h`, `k < w·h`, and (for full validation) reject `k = 2` unless `w` or `h` is
1. The game SHALL provide `statusbarText`, `solve` and `textFormat`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 8, h: 6, k: 6 }` are encoded
- **THEN** the result is `8x6n6`
- **AND** decoding `8x6n6` round-trips the params
- **AND** decoding a bare `5` yields `{ w: 5, h: 5, k: 5 }` (upstream lenience)

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `k` not dividing `w·h`, or `k = w·h`,
  or `k = 2` on a board wider and taller than 1
- **THEN** it returns a non-null error string
