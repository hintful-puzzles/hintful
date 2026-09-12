## MODIFIED Requirements

### Requirement: Tents game implements the Game interface

The engine SHALL provide a registered `tents` game implementing
`Game<TentsParams, TentsState, TentsMove, TentsUi, TentsDrawState, TentsMistake>`:
place tents on a `w × h` grid of fixed trees so that each tent is
orthogonally adjacent to a tree in a one-to-one tree↔tent matching, no two
tents are even diagonally adjacent, and each row/column contains exactly its
edge-clue number of tents. Params SHALL be `w`, `h` and `diff`
(Easy / Normal), encoded `{w}x{h}d{e|t}` (short form `{w}x{h}`, square
shorthand `{n}`). All 6 upstream presets (8×8, 10×10, 15×15 × Easy/Normal)
SHALL be offered. `validateParams` SHALL enforce minimum size 4×4. The game
SHALL report `canSolve = true` and `canFormatAsText = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 15, h: 15, diff: DIFF_TRICKY }` (the Normal tier) are encoded in full
- **THEN** the result is `15x15dt` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a grid smaller than 4×4
- **THEN** it returns a non-null error string

### Requirement: Tents ports the graded solver faithfully

The port SHALL implement upstream `tents_solve` with its exact deductive
power at each difficulty, returning the impossible / unique / non-converged
(0 / 1 / 2) verdict identical to the C solver on every board. It SHALL
perform: tent↔tree link deduction (a tent with one unattached adjacent tree,
and a tree with one candidate square, are linked); non-tent marking (a blank
with no adjacent unmatched tree, or diagonally adjacent to any tent); the
Normal-tier (`DIFF_TRICKY`) tree diagonal-pair elimination; and the row/column
combination-enumeration pass that places a tent or non-tent in any square
given the same state by every valid placement of the row's remaining tents
(with the Normal-tier adjacent-row influence). The solver SHALL be reused by
`solve()`, the generator's difficulty gate, and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong tents
- **THEN** the returned move yields the unique solution
