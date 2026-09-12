## REMOVED Requirements

### Requirement: Pearl game implements the Game interface

**Reason**: It names Pearl's tiers Easy and Tricky, and one scenario's heading
carries the retired word; the tiers are Easy and Normal. A scenario is matched by
its heading, so the heading cannot be corrected in place.

**Migration**: Replaced by "Pearl game is registered and implements the Game
interface", identical except for the tier names.

## ADDED Requirements

### Requirement: Pearl game is registered and implements the Game interface

The engine SHALL provide a registered `pearl` game implementing
`Game<PearlParams, PearlState, PearlMove, PearlUi, PearlDrawState, PearlMistake>`:
draw a single closed loop through grid cells so that it turns a right angle at
every black pearl (and goes straight through at least one cell on each side of
it) and passes straight through every white pearl (turning immediately before or
after). Params SHALL be `w`, `h`, `difficulty` (Easy or Normal) and `nosolve`
(allow an unsoluble board, default false), encoded `{w}x{h}` with a full-form
`d{char}` difficulty suffix and an `n` suffix when `nosolve` is set.
`validateParams` SHALL enforce `w ≥ 5`, `h ≥ 5`, that width×height does not
overflow, and that a Normal board has `w + h ≥ 11`. The 8 upstream presets
(6×6, 8×8, 10×10, 12×8 each at Easy and Normal) SHALL be offered. The game SHALL
report `canSolve = true` and `canFormatAsText = true`, and SHALL drive a
completion flash suppressed after Solve. The two upstream appearance styles
(traditional Masyu and loopy) SHALL be selectable via an `appearance`
preference (default traditional).

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, difficulty: DIFF_TRICKY, nosolve: false }` (the
  Normal tier) are encoded in full
- **THEN** decoding the result round-trips the params

#### Scenario: The Normal tier requires a large enough board

- **WHEN** `validateParams` is given a Normal board with `w + h < 11`, or any
  board with `w < 5` or `h < 5`
- **THEN** it returns a non-null error string

## MODIFIED Requirements

### Requirement: Pearl ports the deductive solver and solver-gated generator faithfully

The port SHALL implement `pearl_solve` as pure iterative constraint propagation
(no guessing or recursion) over the edge/square workspace: edge↔square
elimination, the black-pearl and white-pearl clue deductions, and shortcut-loop
detection over a union-find, with the Normal tier additionally applying the
premature-short-loop rules. It SHALL return the three-valued verdict
(inconsistent / unique / ambiguous), and a grading routine SHALL return the
easiest difficulty that yields a unique solution. The generator SHALL build a
random loop via the shared `generateLoop` (biased toward black-pearl corners),
derive a maximal clue set, gate on the solver finding a unique solution at the
requested difficulty (and failing one tier easier), then greedily minimize the
clues — reproducing the upstream RNG draw order byte-for-byte (including the
upstream `corners`-array quirk that consumes a shuffle sized by the straight
count, and the 5×5 Normal→Easy downgrade) — so that for a given seed and params
the produced desc and aux reproduce the C output exactly. `solve` SHALL return
the generator's aux when present, else re-solve from the clues.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated with `nosolve = false` and graded by the TS solver
- **THEN** the grading is a unique solution at exactly the requested difficulty

#### Scenario: Desc reproduces the C reference byte for byte

- **WHEN** `newDesc` runs for a fixture's seed and params
- **THEN** the produced desc and aux equal the recorded C values exactly, and the
  TS solver grades the decoded board at the C-recorded difficulty
