## MODIFIED Requirements

### Requirement: Magnets game implements the Game interface

The engine SHALL provide a registered `magnets` game implementing
`Game<MagnetsParams, MagnetsState, MagnetsMove, MagnetsUi, MagnetsDrawState, MagnetsMistake>`:
fill a `w × h` grid of pre-laid 2×1 dominoes so that each domino is either a
magnet (one `+` cell and one `−` cell) or neutral (both cells blank), no two
orthogonally-adjacent cells share a polarity, and each row and column contains
exactly its clue count of `+` and of `−` cells. Some dominoes MAY be fixed
singleton squares that are permanently neutral. Params SHALL be `w`, `h`,
`diff` (Easy / Normal) and `stripclues` (boolean), encoded `{w}x{h}` with a
full-form `d{e|t}` difficulty suffix and an `S` strip-clues suffix (square
shorthand `{n}`). All 8 upstream presets SHALL be offered. `validateParams`
SHALL enforce `w ≥ 2`, `h ≥ 2`, a per-difficulty minimum size (Easy: `w ≥ 3`
or `h ≥ 3`; Normal: `w ≥ 5` or `h ≥ 5`) and the area bound. The game SHALL
report `canSolve = true` and `canFormatAsText = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 9, diff: DIFF_TRICKY, stripclues: true }` (the
  Normal tier) are encoded in full
- **THEN** the result is `10x9dtS` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 4×4 grid at Normal difficulty
- **THEN** it returns a non-null error string (Normal needs a side ≥ 5)

### Requirement: Magnets ports the graded solver faithfully

The port SHALL implement upstream `solve_state` with its exact deductive power
at each difficulty, returning the impossible / ambiguous / solved
(−1 / 0 / 1) verdict identical to the C solver on every board. The Easy tier
SHALL perform: set-and-hold of initial givens, force-by-flags, the
neither-can-be-a-magnet neutral deduction, the row/column count-full pass
(color complete ⇒ exclude the rest; remaining unset all needed ⇒ set them),
and the odd-length-section deduction. The Normal tier SHALL additionally
perform: the advanced-full in-row domino-polarization pass, the
single-neutral-left exclusion, and the two count-dominoes passes
(all-remaining-dominoes-magnet ⇒ no neutral; one placeable end ⇒ set it). The
solver SHALL propagate a deduction across a domino to its partner (an
excluded color on one end excludes the opposite color on the other).

#### Scenario: A generated board is uniquely solvable at its difficulty

- **WHEN** a board generated at difficulty `d` is solved from empty
- **THEN** the solver returns solved (1) at `d`, and — for a Normal board —
  fails to fully solve (0) at Easy
