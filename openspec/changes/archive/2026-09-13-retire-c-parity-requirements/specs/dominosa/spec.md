## ADDED Requirements

### Requirement: Dominosa solves with a graded deductive solver

The solver SHALL grade by difficulty, as upstream's `run_solver` does, returning
the impossible / unique / ambiguous (0 / 1 / 2) verdict. Easy SHALL perform the
domino-single-placement and square-single-placement deductions. Normal SHALL
additionally perform square-single-domino, domino-must-overlap, the two
local-duplicate deductions, and the parity deduction (a domino whose placement
would split the unfilled area into two odd-sized regions is ruled out, detected
by bridge-finding over the placement graph). Tricky SHALL additionally perform set
analysis without doubles; `Unreasonable` SHALL additionally perform set analysis
with doubles and the forcing-chain deduction (parity-linked chains of forced
placements, using a flip DSF). The solver SHALL track the maximum difficulty
level actually used.

The forcing-chain deduction SHALL remain in the solver, so the generator grades
on it and every description is unchanged; it SHALL NOT be recorded by the hint's
deduction pass, because a closure over all placements is a search and no hint
narrates a search on any tier.

#### Scenario: A generated board is uniquely solvable at its difficulty

- **WHEN** a board generated at difficulty `d` is solved from empty
- **THEN** the solver returns unique (1) and reports `max_diff_used == d`, and —
  for a board above Easy — fails to reach a unique solution (returns 2) when
  capped at the difficulty one level below `d`

### Requirement: Dominosa renders dominoes, barriers and overlays under the web geometry

The renderer SHALL draw the rounded-corner domino ends (circles plus rectangles
per upstream `draw_tile`), the clue numbers, the barrier edge lines, the two
value-highlight colors, the red clash fill, the half-grid cursor corners, and
the completion flash, using the web build's `NARROW_BORDERS` geometry
(`BORDER = −DOMINO_GUTTER`). Every
per-square overlay (domino type / clash / highlight / edge / cursor / flash /
mistake) SHALL be part of the render diff key so it repaints and clears
correctly.

#### Scenario: A clash renders red

- **WHEN** the same domino value is placed in two locations
- **THEN** both placements render with the clash color rather than the normal
  domino color

## MODIFIED Requirements

### Requirement: Dominosa provides an explained deductive hint

The `dominosa` game SHALL implement `Game.hint(state)`, returning a narrated
plan computed from the player's current board by running the ported deductive
solver one firing at a time (seeded from the placed dominoes). Each step SHALL
carry a forced move and an explanation of *why* it is forced (the Palisade
quality bar):

- a **placement** step when a domino has exactly one remaining spot (the move
  places that domino), or when a square can pair with only one domino;
- a **barrier** step when a deductive technique proves a spot cannot hold a
  domino (the move draws that barrier edge), narrated by the technique
  (duplicate-forcing, must-overlap, odd-region parity, set analysis, forcing
  chain). Barriers ruled out by one firing SHALL group into one
  `continuesPrevious` journey, and a barrier the player has already drawn SHALL
  be skipped for display while still advancing the deduction.

`hint()` SHALL refuse (`{ ok: false, error }`, lighting the `findMistakes`
overlay) when the board is already solved, contains a mistake, or is an
Ambiguous (not uniquely solvable) board with no forced deduction to teach. The
recorder SHALL be gated so the generator's `runSolver` path is unchanged.

#### Scenario: A hint refuses on a solved board

- **WHEN** `hint` is called on a completed board
- **THEN** it returns `{ ok: false }` with a non-empty message

#### Scenario: A placement hint names the forced domino and explains why

- **WHEN** a domino has exactly one remaining spot on the current board
- **THEN** the next hint step's move places that domino and its explanation
  states, in the necessity voice, that it is the only spot left

#### Scenario: The plan solves the board from any mid-game position

- **WHEN** a non-mistaken, non-Ambiguous board is advanced by applying one
  freshly-recomputed hint step at a time
- **THEN** every step makes progress and the board reaches solved

## REMOVED Requirements

### Requirement: Dominosa ports the graded solver faithfully

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. It required the solver to implement upstream `run_solver` "with its exact deductive power" and return a verdict "identical to the C solver on every board". The requirement is restated under a name that does not assert fidelity to upstream, which a `MODIFIED` block cannot rename.

**Migration**: Replaced by "Dominosa solves with a graded deductive solver", which keeps every tier's deductions, the forcing-chain rule and the exact-difficulty scenario. The frozen differential stays as a refactoring net.

### Requirement: Dominosa renders to upstream parity under the web geometry

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. It required a palette mirroring upstream's color enum index-for-index. The requirement is restated under a name that does not assert fidelity to upstream, which a `MODIFIED` block cannot rename.

**Migration**: Replaced by "Dominosa renders dominoes, barriers and overlays under the web geometry", which keeps what is drawn, the geometry and the render diff key.
