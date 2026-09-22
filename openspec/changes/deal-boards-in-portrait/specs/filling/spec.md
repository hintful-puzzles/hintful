## MODIFIED Requirements

### Requirement: Filling game implements the Game interface

The engine SHALL provide a registered `filling` game implementing
`Game<FillingParams, FillingState, FillingMove, FillingUi, FillingDrawState>`:
the Nikoli puzzle Fillomino on a `w × h` grid in which every cell is filled with
a number `n` such that each maximal orthogonally-connected region of equal
numbers contains exactly `n` cells. Params SHALL be `w` and `h`, encoded
`{w}x{h}`, with presets 7×9, 9×13 (default), and 13×17: upstream's sizes turned to
draw taller than wide. `validateParams` SHALL
require `w ≥ 1`, `h ≥ 1`, and `w·h` not unreasonably large. The game SHALL
report `wantsStatusbar = false`, `isTimed = false`, `canSolve = true`, and
`canFormatAsText = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 13, h: 9 }` are encoded
- **THEN** the result is `13x9`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `9` yields a 9×9 square grid

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `w < 1` or `h < 1`
- **THEN** it returns a non-null error string
