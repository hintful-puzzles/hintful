## ADDED Requirements

### Requirement: Tracks solves with a graded deductive solver

The solver SHALL run its deductions in rung order at each difficulty. At Easy: edge/square flag propagation
(`update_flags`), row/column track-count deductions (`count_clues`), and
immediate loop avoidance over a `Dsf` (`check_loop`). At Normal
(`DIFF_TRICKY`), additionally: single-track reasoning (`check_single`),
loose-end reasoning (`check_loose_ends`), and the one-way neighbor deduction
(`check_neighbours(false)`). At Tricky (`DIFF_HARD`), additionally: the two-way
neighbor deduction (`check_neighbours(true)`) and the bridge-parity argument
(`check_bridge_parity`) over the shared `findLoops` bridge finder. The solver
SHALL return impossible / unique / non-converged verdicts. The solver SHALL be reused by
`solve()` and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Tricky is solved
- **THEN** the Tricky solver reaches the unique solution
- **AND** the Normal solver fails to converge on it

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong track marks
- **THEN** the returned move yields the unique solution

### Requirement: Tracks generates solver-gated boards reproducibly

`newDesc` SHALL generate the same board for the same seed: `lay_path` (a random walk from a random left-edge entrance to a bottom
exit), clue-number derivation, rejection of boring boards and (under
`single_ones`) consecutive/exit 1-clues, `add_clues` (lay clues until soluble
at exactly the target difficulty, then strip redundant clues, re-running the
solver on each candidate), and the 4×4 Normal/Tricky → Easy fallback.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Tracks description

### Requirement: Tracks renders rails, clues, drag previews and the completion flash

`redraw` SHALL render, using the `NARROW_BORDERS` geometry (zero gutter, a
one-tile margin holding the clue numbers and the A/B entrance/exit labels):
straight rails drawn with sleepers, curved rails, no-track crosses on squares
and edges, the in-progress drag preview (a newly-set piece in `COL_DRAGON`
blue, a cleared piece in `COL_DRAGOFF` light blue), row/column clue numbers
(red on a clue error), the cursor highlight, and the upstream completion flash
that travels along the finished track. The drawstate SHALL diff a per-cell
`Int32Array` of committed and drag flags plus a clue-error sidecar, with the
findMistakes overlay carried in the diff key.

#### Scenario: A completed row clue turns red when over-filled

- **WHEN** a row holds more track cells than its clue
- **THEN** that row's clue number renders in the error color

#### Scenario: A drag preview shows provisional pieces

- **WHEN** a left-drag is in progress over blank cells
- **THEN** the covered cells render their provisional track in the drag color

## MODIFIED Requirements

### Requirement: Tracks explains the next deduction

`hint(state)` SHALL refuse through `commonHintRefusal` when the board is solved
or `findMistakes` reports any mark, and otherwise return the forced deductions
from the player's current marks as an ordered plan, each step narrating **why**
its moves are forced from premises the sentence itself states.

The plan SHALL be produced by the *same* eight `DeductionTechnique` objects
`tracksSolve` runs, through one `runDeductionFixpoint` call, with a recorder
attached to the working `Board`: no rung is reimplemented for the hint, and the
generator's solve path SHALL remain unchanged. The ladder SHALL be capped at the board's
own difficulty rather than `DIFF_COUNT`, since that is the tier the generator
certified it soluble at.

One firing SHALL be one step: a rung SHALL return at its first premise that
changed the board when a recorder is attached, so a rung that scans the whole
grid cannot pile several independent deductions into one step. A step's move
MAY carry several ops when one premise forces them all, and `hintKeepTrack`
SHALL then verdict `"onTrack"` and shrink the step in place until the last of
them is placed.

Every change a rung makes SHALL be recorded, and the plan SHALL hide — apply to
its working board, but not show — a firing that declares no reason or whose
every change the player's board already decides, through the shared plan loop's
`showable` hook. A change is already decided when the game would refuse the
player its contrary: track on a side of a square marked empty or of the rim,
track as a third side of a finished piece, or "no track" on a square showing a
rail. Three rules of `update-flags` declare no reason for exactly that cause —
*a square with a track side is a track square*, *a blocked square's four sides
are blocked*, and *a finished piece's other two sides are blocked* — and every
reason-less firing SHALL be evident by that test.

#### Scenario: A hint explains a clue that is already met

- **WHEN** a line holds as many track squares as its clue allows and a hint is
  requested
- **THEN** the step's narration names that count, its move marks every other
  square in the line empty, and its evidence is exactly the clue's own track
  squares with the clue's digit recolored

#### Scenario: A finished piece's sides are never a step

- **WHEN** a finished piece's two free sides border squares the player has
  marked empty and a hint is requested
- **THEN** no step in the plan asks for either side to be blocked

#### Scenario: A hint runs from the player's own marks

- **WHEN** the player has made correct marks of their own and asks for a hint
- **THEN** the plan is deduced from those marks and its first step is a
  deduction that follows from them

#### Scenario: A hint refuses rather than reasoning from a wrong board

- **WHEN** a mark contradicts the unique solution and a hint is requested
- **THEN** the hint refuses with the collection's shared mistakes wording and
  produces no plan

#### Scenario: Following the plan solves the board at every tier

- **WHEN** a hint is requested, its first step applied, and the hint requested
  again, repeatedly, on a board of any tier
- **THEN** deduction never runs out before the board is solved

## REMOVED Requirements

### Requirement: Tracks ports the graded solver faithfully

**Reason**: It required verdicts identical to the C solver on every board, down to C's edge-processing order. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Tracks solves with a graded deductive solver", which keeps the rung ladder, the verdicts and their scenarios without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.

### Requirement: Tracks generation is byte-identical to upstream

**Reason**: It required `newDesc` to reproduce upstream `new_game_desc` byte-for-byte, asserted against C-recorded fixtures and C-graded boards. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Tracks generates solver-gated boards reproducibly", which keeps the generation algorithm and seed reproducibility without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.

### Requirement: Tracks renders to full parity with the C build

**Reason**: Its heading required rendering at parity with the C build, and its body a palette index-for-index with the C color enum. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Tracks renders rails, clues, drag previews and the completion flash", which keeps everything it rendered without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.
