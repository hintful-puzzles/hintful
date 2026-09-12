## MODIFIED Requirements

### Requirement: Slant game implements the Game interface

The engine SHALL provide a registered `slant` game implementing
`Game<SlantParams, SlantState, SlantMove, SlantUi, SlantDrawState>`: fill
every square of a `w × h` grid with a `/` or `\` diagonal so that every
numbered vertex clue (0–4, on the `(w+1) × (h+1)` point grid) is met by
exactly that many incident diagonals and the diagonals form no closed loop.
Params SHALL be `w`, `h` and `diff` (Easy / Normal), encoded `{w}x{h}d{e|h}`
(short form `{w}x{h}`, square shorthand `{n}`). All 6 upstream presets
(5×5, 8×8, 12×10 × Easy/Normal) SHALL be offered. `validateParams` SHALL
enforce minimum size 2×2. The game SHALL report `canSolve = true` and
`canFormatAsText = true` and SHALL drive a solve-completion flash suppressed
after Solve.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 12, h: 10, diff: DIFF_HARD }` (the Normal tier) are
  encoded in full
- **THEN** the result is `12x10dh` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 1-wide or 1-high grid
- **THEN** it returns a non-null error string

### Requirement: Slant ports the graded solver faithfully

The port SHALL implement the upstream solver with its exact deductive power
at each difficulty. At Easy: the clue-point counting deduction (a clue whose
remaining lines equal zero or its remaining undecided neighbors fills all
of them) and immediate loop avoidance (a square whose one orientation would
close a loop takes the other). At Normal, additionally: single-pair
equivalence tracking around clue points (two adjacent undecided
equivalent squares count jointly as one line; a 2-clue with two undecided
adjacent neighbors marks them equivalent), slash-value propagation through
equivalence classes, dead-end avoidance (never connect two non-border
vertex groups that each have at most one remaining exit), and the v-shape
bitmap deductions (placed slashes, 1-clues and 3-clues rule out v-shapes;
2-clues propagate ruled-out v-shapes to their far side; a square pair with
both v-shapes ruled out becomes equivalent). The solver SHALL return
impossible / unique / non-converged verdicts identical to the C solver on
every board, including release-build `fill_square` semantics (its
conflict and loop early-outs exist only under `SOLVER_DIAGNOSTICS` and are
NOT active). The solver SHALL be reused by `solve()` and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong diagonals
- **THEN** the returned move list yields the unique solution

### Requirement: Slant ships findMistakes

`findMistakes(state)` SHALL re-solve the board's clues with the Normal solver
and, when a unique solution exists, return one mistake per square whose
placed diagonal differs from that solution (blank squares are never
mistakes), rendered with the existing red error styling; it SHALL return an
empty list when the board is not uniquely solvable.

#### Scenario: A wrong diagonal blocks Check & Save

- **WHEN** a square holds the diagonal opposite to the unique solution and
  `findMistakes` runs
- **THEN** exactly that square is reported and rendered red

#### Scenario: Blank squares are not mistakes

- **WHEN** the board is partially filled with only correct diagonals
- **THEN** `findMistakes` returns an empty list

### Requirement: Slant ships an explained deductive hint

The game SHALL implement `hint()` returning a plan of narrated steps computed
by the game's own solver techniques from the player's current position (the
solver seeded with the placed diagonals), refusing on a solved board and on a
board with detectable mistakes (coupling to the `findMistakes` overlay and the
banner). The plan SHALL be computed with the recorder off leaving the
generator's solve path byte-identical (the byte-match differential unchanged).

Each step SHALL name its technique and, for the glance-able techniques
(clue-counting, loop avoidance, dead-end avoidance), meet the Palisade quality
bar: lead with the recognizable indication, state why the move is forced,
conclude in the necessity voice. One deduction firing = one journey; a clue
firing that forces several squares SHALL be one multi-leg journey
(`continuesPrevious` legs), not several independent hints. The equivalence
technique (a square locked to the same slant as an already-filled square) MAY
use the honest non-local "locked-slant" narration — naming the technique and
citing the anchor square without reconstructing the full v-shape/pairing chain
— since it is not a single glance-able step and Slant has no on-board mark to
externalize the chain. No displayed step SHALL be a generic, un-narrated
fallback: the plan draws only on the four move-producing techniques of the
ported solver.

#### Scenario: A clue-counting firing is explained and grouped

- **WHEN** the plan reaches a clue whose remaining lines equal its remaining
  empty neighbors (or is already satisfied)
- **THEN** one journey fills all forced neighbors, its opening leg naming the
  clue and why the count forces the slant, concluding with a necessity modal,
  and continuation legs flagged `continuesPrevious`

#### Scenario: Loop and dead-end firings name the connectivity reason

- **WHEN** the plan reaches a square forced by simple loop avoidance or by
  dead-end avoidance
- **THEN** the step's narration explains that the ruled-out slant would close a
  loop (or seal points off from the grid's edge), and its evidence shades the
  connected chain / trapped components involved

#### Scenario: Refusal on a wrong board

- **WHEN** `hint()` is invoked on a board where `findMistakes` is non-empty
- **THEN** it refuses with an error and the mistake overlay is displayed

#### Scenario: The plan completes deductive boards

- **WHEN** the plan is computed on any generated Easy or Normal board
- **THEN** following it step-by-step solves the board with no un-narrated step
