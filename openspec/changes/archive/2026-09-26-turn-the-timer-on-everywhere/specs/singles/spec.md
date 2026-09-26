## MODIFIED Requirements

### Requirement: Singles game implements the Game interface

The engine SHALL provide a registered `singles` game implementing
`Game<SinglesParams, SinglesState, SinglesMove, SinglesUi, SinglesDrawState,
SinglesMistake>`: the Nikoli puzzle Hitori on a `w × h` grid of numbers, in
which the player blackens cells so that no number repeats among the remaining
(white) cells of any row or column, no two black cells are orthogonally
adjacent, and the white cells form one orthogonally-connected region. Params
SHALL be `w`, `h`, and `diff` (Easy or Normal), encoded `{w}x{h}d{c}` when full
(`c` = `e`/`k`) and `{w}x{h}` otherwise, with presets at 5×5, 6×6, 8×8, 10×10,
and 12×12 in both Easy and Normal. `validateParams` SHALL require `w ≥ 2`,
`h ≥ 2`, both `≤ 62`, and (when full) a known difficulty. The game SHALL report
`wantsStatusbar = false`, `canSolve = true`, and
`canFormatAsText = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 8, h: 8, diff: "tricky" }` (the Normal tier) are encoded
  with `full = true`
- **THEN** the result is `8x8dk`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `8x8`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `w < 2` or `h < 2`
- **THEN** it returns a non-null error string
