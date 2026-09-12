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
(truncated), and an unknown difficulty char is ignored. All 6 upstream landscape
presets (20×15 with 30 regions at each difficulty, and 30×25 with 75 regions at
Normal and Tricky) SHALL be offered. `validateParams` SHALL enforce `w ≥ 2`,
`h ≥ 2`, `n ≥ 5`, `n ≤ w*h`, and the width×height overflow guard. The game SHALL
report `canSolve = true` and `canFormatAsText = true`, and SHALL drive a
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

### Requirement: Map ports the graded solver and solver-gated generator faithfully

The port SHALL implement `map_solver` with its full graded deductive power over
the region-adjacency graph: at Easy, place a region that has exactly one possible
color left; at Normal, additionally exclude a shared color pair from the common
neighbors of an adjacent same-two-possibilities pair; at Tricky, additionally run
the forcing-chain BFS; at Unreasonable, additionally recurse (guess and verify).
The solver SHALL return the three-valued verdict (impossible / unique / stuck-or-
ambiguous), and a grading routine SHALL return the easiest difficulty that yields
a unique solution. The generator (`new_game_desc`) SHALL be byte-faithful to the
C RNG draw order — voronoi region growth over the cumulative-frequency table, the
recursive four-coloring, the solver-gated clue reduction that never removes the
last region of a color, and the difficulty-floor retry loop — so that for a
given seed and params the produced desc and aux reproduce the C output exactly.
`solve` SHALL return the generator's aux when present, else re-solve from the
clues at maximum difficulty.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated for a given difficulty and graded by the TS
  solver
- **THEN** the grading is a unique solution at exactly the requested difficulty
  (or the generator's documented fallback for pathologically dense/sparse maps)

#### Scenario: Desc reproduces the C reference byte for byte

- **WHEN** `newDesc` runs for a fixture's seed and params
- **THEN** the produced desc and aux equal the recorded C values exactly, and the
  TS solver grades the decoded board at the C-recorded difficulty
