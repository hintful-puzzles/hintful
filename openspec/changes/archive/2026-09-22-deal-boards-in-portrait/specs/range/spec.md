## MODIFIED Requirements

### Requirement: Range game implements the Game interface

The engine SHALL provide a registered `range` game implementing
`Game<RangeParams, RangeState, RangeMove, RangeUi, RangeDrawState>`: the
Nikoli puzzle Kurodoko / Kuromasu, in which the player paints some white
squares black so that no two black squares are orthogonally adjacent, all
white squares stay connected, and every numbered clue equals the number of
white squares visible from it in a straight line (itself counted once,
`h + v - 1`). Params SHALL be `w` and `h`, encoded `{w}x{h}`. Four presets —
6×9, 8×12, 9×13, 11×16, upstream's sizes turned to draw taller than wide —
SHALL be offered. `validateParams` SHALL
reject non-positive dimensions, a `w + h` that overflows the cell encoding,
and (when `full`) the degenerate 1×1, 1×2, 2×1, and 2×2 grids that admit no
good puzzle. The game SHALL report `wantsStatusbar = false`,
`isTimed = false`, `canSolve = true`, and `canFormatAsText = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 13, h: 9 }` are encoded
- **THEN** the result is `13x9`
- **AND** decoding `13x9` round-trips the params
- **AND** decoding the bare `12` yields `{ w: 12, h: 12 }`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with full generation on a 2×2 grid, or
  with a non-positive dimension
- **THEN** it returns a non-null error string
