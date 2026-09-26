## MODIFIED Requirements

### Requirement: Map game implements the Game interface

The engine SHALL provide a registered `map` game implementing
`Game<MapParams, MapState, MapMove, MapUi, MapDrawState, MapMistake>`: color
every region of a map so that no two adjacent regions share a color, given some
regions pre-colored as immutable clues. Params SHALL be `w`, `h`, `n` (number
of regions) and `diff` (one of Easy, Normal, Tricky, Unreasonable), encoded
`{w}x{h}n{n}` with a full-form `d{char}` difficulty suffix (chars `e`/`n`/`h`/`u`).
`decodeParams` SHALL be lenient: an omitted `xH` defaults height to width, an
omitted `nN` defaults `n` to `w*h/8`, a `.` in the region count is tolerated
(truncated), and an unknown difficulty char is ignored. Six presets (15×20 with
30 regions at each difficulty, and 25×30 with 75 regions at Normal and Tricky),
upstream's landscape sizes turned to draw taller than wide, SHALL be offered. `validateParams` SHALL enforce `w ≥ 2`,
`h ≥ 2`, `n ≥ 5`, `n ≤ w*h`, and the width×height overflow guard. The game SHALL provide `solve` and `textFormat`, and SHALL drive a
completion flash suppressed after Solve.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 20, h: 15, n: 30, diff: Normal }` are encoded in full
- **THEN** the result is `20x15n30dn` and decoding it round-trips the params

#### Scenario: Lenient decode

- **WHEN** `decodeParams` is given `12` (no height, no region count, no
  difficulty)
- **THEN** it yields `w = 12`, `h = 12`, `n = 12*12/8`, and the default
  difficulty

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given fewer than five regions, or more regions
  than grid squares
- **THEN** it returns a non-null error string
