## ADDED Requirements

### Requirement: Slant solves with a graded deductive solver

The solver SHALL apply the following deductions at each difficulty. At Easy: the clue-point counting deduction (a clue whose
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
impossible / unique / non-converged verdicts. The solver SHALL be reused by `solve()` and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong diagonals
- **THEN** the returned move list yields the unique solution

### Requirement: Slant generates solver-gated boards reproducibly

`newDesc` SHALL generate the same board for the same seed, by filled-grid growth over a shuffled square order (forced by the
vertex DSF where a loop would form, otherwise one `random_upto(rs, 2)`
draw), full clue derivation, a single clue-index shuffle, two-pass
solver-gated clue removal (pass 0 removes obvious starting points — 4s, 0s,
border 2s, corner 1s, or everything at Easy — pass 1 the rest), and
regeneration while the board is solvable one difficulty level down.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Slant description

### Requirement: Slant renders diagonals, clues, errors and the completion flash

`redraw` SHALL render: chessboard-colored thick diagonals (color parity
`(x^y)&1`), grid lines, corner dots where neighboring squares' diagonals
meet the tile, clue circles with parity-colored rings and ink numbers,
red error coloring for loop-edge slashes (including their corner dots) and
unmet clue circles, a filled-square background tint, the cursor highlight,
the grounded fade (per pref), and the upstream 3-phase completion flash.
The drawstate SHALL diff a `(w+2) × (h+2)` packed `Int32Array` covering the
border ring, with the findMistakes overlay carried in the diff key (a
packed bit of the per-frame-rebuilt word).

#### Scenario: A mistake overlay repaints an unchanged tile

- **WHEN** a tile is painted, `findMistakes` flags it, and `redraw` runs
  again with no tile change
- **THEN** the second paint renders the red mistake styling

#### Scenario: Border clue circles draw

- **WHEN** a clue sits on the outer border of the point grid
- **THEN** the border-ring tile pass draws its circle and number

## MODIFIED Requirements

### Requirement: Slant ships an explained deductive hint

The game SHALL implement `hint()` returning a plan of narrated steps computed
by the game's own solver techniques from the player's current position (the
solver seeded with the placed diagonals), refusing on a solved board and on a
board with detectable mistakes (coupling to the `findMistakes` overlay and the
banner). The plan SHALL be computed with the recorder off leaving the
generator's solve path unchanged.

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

## REMOVED Requirements

### Requirement: Slant ports the graded solver faithfully

**Reason**: It required verdicts identical to the C solver on every board, down to release-build `fill_square` semantics. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Slant solves with a graded deductive solver", which keeps the per-difficulty deductions and the verdicts without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.

### Requirement: Slant generation is byte-identical to upstream

**Reason**: It required `newDesc` to reproduce upstream `new_game_desc` byte-for-byte, asserted against C-recorded fixtures. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Slant generates solver-gated boards reproducibly", which keeps the generation algorithm and seed reproducibility without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.

### Requirement: Slant renders to full parity with the C build

**Reason**: Its heading required rendering at parity with the C build, and its body a palette index-for-index with the C color enum. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Slant renders diagonals, clues, errors and the completion flash", which keeps everything it rendered without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.
