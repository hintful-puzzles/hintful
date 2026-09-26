## MODIFIED Requirements

### Requirement: Pattern game implements the Game interface

The engine SHALL provide a registered `pattern` game implementing
`Game<PatternParams, PatternState, PatternMove, PatternUi, PatternDrawState>`:
the nonogram (Pattern / Picross / Paint-by-numbers) on a `w × h` grid in which
each cell is `Full` (black) or `Empty` (background) so that each row and column
matches its sequence of run-length clues. Params SHALL be `w` and `h` (positive
integers), encoded `{w}x{h}` with a bare `{w}` decoding to a square `w × w`
grid. The upstream presets (10×10, 15×15, 20×20, 25×25, 30×30) SHALL be offered.
`validateParams` SHALL reject a non-positive dimension and an unreasonably large
`w·h`. The game SHALL provide `solve` and `textFormat`, and SHALL drive a solve-completion flash.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 20, h: 15 }` are encoded
- **THEN** the result is `20x15`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `10` yields `{ w: 10, h: 10 }`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with a non-positive dimension or a grossly
  oversized `w·h`
- **THEN** it returns a non-null error string
