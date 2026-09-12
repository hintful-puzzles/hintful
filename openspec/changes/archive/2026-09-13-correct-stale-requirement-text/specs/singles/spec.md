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
`wantsStatusbar = false`, `isTimed = false`, `canSolve = true`, and
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

### Requirement: Singles deductive solver

The game SHALL provide a deductive solver reproducing the upstream techniques:
the auto-cascade (a black forces its neighbors white; a circled cell forces
same-numbered cells in its row/column black), `singlesep`, `doubles`, `corners`,
`offsetpair` (Normal and above), `allblackbutone`, and `removesplits` (Normal
and above). It SHALL detect impossibility (e.g. a white cell with no white
escape, or a contradiction in the cascade). `solve` SHALL attempt to solve the
current state and then the initial state, returning the move that completes the
board or an error when neither can be solved, and SHALL mark the state as
solved-with-help.

#### Scenario: Solver completes a generated board

- **WHEN** a board generated at a given difficulty is solved by the solver from
  its initial numbers
- **THEN** the solver fully determines every cell (black or white) with no errors

#### Scenario: Solve reports failure on an unsolvable position

- **WHEN** `solve` is called on a board the solver cannot complete
- **THEN** it returns a non-null error and applies no move

### Requirement: Singles generator produces unique, difficulty-graded boards

`newDesc` SHALL generate a board by constructing a Latin rectangle, adding black
squares at random with solver assistance (forced whites laid between
placements), and assigning numbers under the black squares so the solution stays
unique. It SHALL accept the board only when it is solvable at the requested
difficulty and *not* solvable one difficulty level below (with the sneaky
generation-artifact deduction enabled), regenerating otherwise. Difficulty SHALL
downgrade to Easy when `min(w, h) < 4`. The generation SHALL be RNG-faithful to
upstream so that, over the bit-identical `random.ts`, the produced desc matches
the C reference byte-for-byte for the same seed.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated at difficulty D
- **THEN** the solver solves it at D
- **AND** (for Normal) the solver fails to solve it at the level below D even
  with the sneaky deduction

#### Scenario: Desc matches the C reference byte-for-byte

- **WHEN** `newDesc` runs for a seed and params recorded from the C build
- **THEN** the produced desc equals the recorded C desc exactly
