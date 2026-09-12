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
All 12 upstream presets SHALL be offered. `validateParams` SHALL enforce a
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

### Requirement: Tracks ports the graded solver faithfully

The port SHALL implement `tracks_solve` with its exact deductive power and rung
order at each difficulty. At Easy: edge/square flag propagation
(`update_flags`), row/column track-count deductions (`count_clues`), and
immediate loop avoidance over a `Dsf` (`check_loop`). At Normal
(`DIFF_TRICKY`), additionally: single-track reasoning (`check_single`),
loose-end reasoning (`check_loose_ends`), and the one-way neighbor deduction
(`check_neighbours(false)`). At Tricky (`DIFF_HARD`), additionally: the two-way
neighbor deduction (`check_neighbours(true)`) and the bridge-parity argument
(`check_bridge_parity`) over the shared `findLoops` bridge finder. The solver
SHALL return impossible / unique / non-converged verdicts identical to the C
solver on every board, reproducing C's edge-processing order where a later
deduction reads state an earlier one mutated. The solver SHALL be reused by
`solve()` and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Tricky is solved
- **THEN** the Tricky solver reaches the unique solution
- **AND** the Normal solver fails to converge on it

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong track marks
- **THEN** the returned move yields the unique solution

### Requirement: Tracks generation is byte-identical to upstream

`newDesc` SHALL reproduce upstream `new_game_desc` byte-for-byte for the same
seed: `lay_path` (a random walk from a random left-edge entrance to a bottom
exit), clue-number derivation, rejection of boring boards and (under
`single_ones`) consecutive/exit 1-clues, `add_clues` (lay clues until soluble
at exactly the target difficulty, then strip redundant clues, re-running the
solver on each candidate), and the 4×4 Normal/Tricky → Easy fallback. A gated
differential test SHALL assert byte-equal descs against C-recorded fixtures
across all three difficulties and non-preset sizes, and that the TS solver
grades each C board at its recorded difficulty.

#### Scenario: Differential fixtures match

- **WHEN** `newDesc` runs with a fixture's params and seed
- **THEN** the emitted desc equals the C-recorded desc byte-for-byte
- **AND** the TS solver grades the C board at the recorded difficulty
