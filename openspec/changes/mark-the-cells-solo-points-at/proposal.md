# mark-the-cells-solo-points-at

## Why

Two of Solo's hint sentences point at a set of cells the frame never marks, so
the player is told to look at something that is not there:

- **The deduced extra-cage** (killer): *"Once the cages inside their region are
  counted, these cells must total 5, and only this cell is open: it must be
  5."* The step's evidence is `reason.cells`, and `cageIntersect` records
  `cells: [{ x, y }]` — the one open cell, which is also the target. The frame
  shows **one** shaded cell. Neither "their region" nor "these cells" has a
  referent, and the number is said twice because `clue === n` on this rung: the
  residual *is* the digit.
- **The locked pattern** (row-vs-column elimination on a single digit): *"A
  locked pattern of cells across these lines already accounts for 4, so we must
  cross out 4 here."* `set_`'s region-less call records `{ kind: "set" }` with
  no region, and `reasonArea` returns `[]` for it. The frame shows only the
  struck candidate. "These lines" and the pattern are both invisible.

This is the inverse of the defect `scripts/checks/hint-deixis.test.ts` hunts —
that sweep asks which sentences point *bare* while a second mark is displayed;
these point *specifically* while no mark is displayed — and it is why reading
the widened report found them (`read-the-widened-deixis-report`). Keying the
same corpus on a **plural** deictic instead found six shapes in 25,670 steps;
four are Loopy's, where the pair connector the move draws is the mark. These
two are the rest.

The Solo spec already says of a region elimination that "the region's cells are
shaded and the struck candidates marked in the hint color". Neither of these
rungs fires on a *region*, so neither is covered — but a hint that cites
evidence it does not show fails the hint bar either way: a player cannot
reproduce a deduction whose premise is off-screen.

## What changes

Both rungs record the cells their sentence speaks of, and the narration is
rewritten against what is then on the board.

- `cageIntersect` records the **region** it reasoned over (the solver already
  has it as `(i, n)`; `SoloRegion` is the type the other rungs use), and the
  evidence shades it. The sentence names the region by kind and states the
  arithmetic the player has to repeat — the region's total, less its whole
  cages and its filled cells — rather than saying a number twice.
- The region-less `set_` firing records the **pattern's own cells**, and the
  evidence shades them. The sentence then points at marks.

Each is pinned in `solo-hint.test.ts` next to the vocabulary that can judge it,
by walking to the firing and asserting the cells the sentence names are the
cells the step marks.

## What this does not do

- **Not a change to the region-carrying `set` arm.** *"Other cells in this row
  already account for 3 and 7"* already shades the row; marking the subset's
  own cells inside it would be an improvement, not a defect fix, and it would
  need its own reading of what a second evidence role should look like.
- **Not a new cross-game guard.** The probe that found these is a shape key
  ("a plural deictic, and how many places does the step mark?"), and its result
  over the whole corpus was six shapes. That is a population to read, not a
  gate to ratchet; what it found is recorded in the deixis sweep's header.
