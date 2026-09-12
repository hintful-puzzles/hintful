## ADDED Requirements

### Requirement: Bridges solves with a graded multi-stage deductive solver

The solver SHALL run upstream's `solve_sub` stages, gated by difficulty, and
return an impossible / ambiguous / solved verdict. Easy SHALL run stage 1
(force bridges an island must place because its remaining count equals its
available adjacent space, and forbid bridges into a satisfied island). Normal
SHALL additionally run stage 2 (per-direction minimum/maximum reasoning using
each neighbor's own remaining capacity). Tricky SHALL additionally run stage 3
(the dsf connected-subgroup deductions — forbid a bridge that would seal off a
subgroup that cannot then be satisfied, and, when `allowloops` is false, forbid a
bridge that would complete a premature loop). The solver is purely deductive
(no guess-and-verify recursion — upstream `solve_sub`'s `depth` is unused). The
solver SHALL maintain the per-cell possible/maximum-bridge counts
(`map_update_possibles`) as deductions are applied.

#### Scenario: A generated board is uniquely solvable at its difficulty

- **WHEN** a board generated at difficulty `d` is solved from the clue-only state
- **THEN** the solver returns solved at `d`, and a Normal/Tricky board is not fully
  solved at the tier below it

### Requirement: Bridges generates boards soluble at exactly their difficulty

The generator SHALL place a random initial island, grow the map by repeatedly
selecting an island and direction and joining or expanding to a new island,
until the island-density target is met, then derive the clue counts and reject
boards not soluble at exactly the target difficulty, retrying until one is found.

#### Scenario: A generated board is graded at its requested difficulty

- **WHEN** `newDesc` is run for a preset
- **THEN** the solver grades the board it produces at exactly the requested
  difficulty

### Requirement: Bridges renders islands and bridges with a show-hints preference

The renderer SHALL draw islands as circles bearing their count, single and double
bridges (horizontal and vertical), the in-progress drag preview line,
no-line/mark indicators, the keyboard cursor ring, and the win flash. The `findMistakes` overlay SHALL reuse the red
`COL_WARNING` channel (no extra palette entry), so it lives in the render diff
key and repaints clean when cleared. The game SHALL expose a `show-hints` boolean
preference (upstream `PREF_SHOW_HINTS`) through the `Game.prefs` hook; when on,
faint `COL_HINT` lines SHALL indicate forced or forbidden bridges.

#### Scenario: The show-hints preference toggles the hint overlay

- **WHEN** the `show-hints` preference is turned on
- **THEN** the renderer emits `COL_HINT` hint lines that are absent when it is off

## MODIFIED Requirements

### Requirement: Bridges explains the next deduction

`hint(state)` SHALL refuse through `commonHintRefusal` when the board is solved
or `findMistakes` reports a wrong bridge, and otherwise return the forced
deductions from the player's own bridges as an ordered plan, each step narrating
**why** its moves are forced from premises the sentence itself states.

The plan SHALL be produced by the *same three* `DeductionTechnique` objects
`solveFromScratch` runs, through one `runDeductionFixpoint` call, with a recorder
attached to the `Solver`: no rung is reimplemented for the hint, and the
generator's solve path SHALL remain unchanged by recording. The ladder SHALL be capped at the board's
own difficulty rather than the top rung, since that is the tier the generator
certified it soluble at.

One firing SHALL be one step: a stage SHALL stop at the first island that moved
when a recorder is attached, and a rung holding more than one teachable rule
SHALL return at the first of them that changed the board, so a stage that sweeps
sixty-seven islands cannot pile several independent deductions into one step. A
step's move MAY carry several bridges when one premise forces them all, and
`hintKeepTrack` SHALL then verdict `"onTrack"` and shrink the step in place —
judging a bridge count as progress when it moves toward what the step asks for,
because one drag adds one bridge rather than the whole count, and accepting the
span from either end, because the player drags from whichever island they like.

The working copy SHALL resume from the player's bridges rather than clearing
them, and SHALL first mark every island whose bridges already meet its clue, so
a resumed position is the position the certified ladder was certified on.

Every change a rung makes SHALL be recorded, and the plan SHALL hide — apply to
its working board, but never show — a firing that declares no reason. Exactly
one rule declares none: stage 1's *this island now has all its bridges, mark it
complete*, which is bookkeeping the fork's own auto-mark aid already draws and
which the win condition does not read. Stage 3's per-direction **maximum** is
likewise applied without being offered, because upstream gives the player no way
to write one down; it emits no move at all, and the ladder runs on until it has
one.

Where a rung can be forced by more than one cause, the firing SHALL carry which:
stage 3's block is narrated as a finished group sealed off or as a named island
left short of its clue, read while the trial still stands, because rolling it
back destroys both answers.

#### Scenario: A hint explains an island with exactly enough room left

- **WHEN** an island's remaining count equals the bridges it can still take and a
  hint is requested
- **THEN** the step's narration states that count, its move draws exactly that
  many bridges, and the island it names is the one the hint recolors

#### Scenario: A bookkeeping mark is never a step

- **WHEN** a deduction satisfies an island and the solver marks it complete
- **THEN** no step in the plan asks the player to mark it, and the plan still
  reaches a solved board

#### Scenario: A hint runs from the player's own bridges

- **WHEN** the player has drawn correct bridges of their own and asks for a hint
- **THEN** the plan is deduced from those bridges and its first step is a
  deduction that follows from them

#### Scenario: A hint refuses rather than reasoning from a wrong board

- **WHEN** a bridge contradicts the unique solution and a hint is requested
- **THEN** the hint refuses with the collection's shared mistakes wording and
  produces no plan

#### Scenario: A hint says so honestly when the annotation is what is wrong

- **WHEN** an island is marked complete before it is, so `findMistakes` reports
  nothing and the deduction still contradicts itself
- **THEN** the hint refuses with the collection's unlocalized-contradiction
  wording, which asks the player to undo rather than promising a highlight

#### Scenario: Following the plan solves the board at every tier

- **WHEN** a hint is requested, its first step applied, and the hint requested
  again, repeatedly, on a board of any tier
- **THEN** deduction never runs out before the board is solved

## REMOVED Requirements

### Requirement: Bridges ports the graded multi-stage solver faithfully

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. It required the solver to implement upstream `solve_sub` "with the exact deductive power" and return a verdict "identical to the C solver on every board". The requirement is restated under a name that does not assert fidelity to upstream, which a `MODIFIED` block cannot rename.

**Migration**: Replaced by "Bridges solves with a graded multi-stage deductive solver", which keeps the three stages, the purely deductive rule and its scenario that a board is solvable at its own tier and not below. `bridges-differential.test.ts` stays as a refactoring net.

### Requirement: Bridges generates byte-identical descriptions to the C build

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. It required the generator to reproduce the C description byte-for-byte, spelled out upstream's exact draw order, and asserted equality with the C-recorded descriptions.

**Migration**: Replaced by "Bridges generates boards soluble at exactly their difficulty", which keeps the growth algorithm and the exact-difficulty acceptance. The frozen fixture in `bridges-differential.test.ts` stays as a refactoring net; a deliberate divergence retires it.

### Requirement: Bridges renders to upstream parity with a show-hints preference

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. It required upstream's tile geometry and a palette mirroring upstream's color enum index-for-index — which the palette no longer does (`COL_POSSIBLE` sits at 6 and `COL_HINT` at 10). The requirement is restated under a name that does not assert fidelity to upstream, which a `MODIFIED` block cannot rename.

**Migration**: Replaced by "Bridges renders islands and bridges with a show-hints preference", which keeps what is drawn, the `COL_WARNING` mistake overlay and the `show-hints` preference.
