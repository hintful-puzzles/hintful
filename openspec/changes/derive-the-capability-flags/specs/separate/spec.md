## MODIFIED Requirements

### Requirement: Separate game implements the Game interface

The engine SHALL provide a registered `separate` game implementing
`Game<SeparateParams, SeparateState, SeparateMove, SeparateUi, SeparateDrawState>`:
the grid-partition puzzle ("Block Puzzle") on a `w × h` grid in which every cell
holds one of `k` letters, each letter occurring `w·h/k` times, and the player
divides the grid into disjoint connected `k`-ominoes such that each region
contains exactly one of each letter. Params SHALL be `w`, `h`, and `k`
(positive integers), encoded `{w}x{h}n{k}` with a bare `{w}` decoding to a
square `w × w` grid with `k = w`. `validateParams` SHALL reject a non-positive
dimension, a `k` that does not divide `w·h`, an unreasonably large `w·h`, and (on
a full validation) `k` equal to the whole grid. The game SHALL offer a menu of
presets, provide `solve` and `textFormat`, and drive a
solve-completion flash.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, h: 6, k: 4 }` are encoded
- **THEN** the result is `6x6n4`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `5` yields `{ w: 5, h: 5, k: 5 }`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with a non-positive dimension, or a `k`
  that does not divide `w·h`
- **THEN** it returns a non-null error string
