# describe-edges-and-divisions

**Status: filed by `describe-fleets` (2026-11-06)**, which closed step 8.
Step 9 of `describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It
files step 10, `describe-lines-and-loops`, when it is archived, or the part
of itself it splits off first.

## Why

Separate, Palisade, Dominosa, Rect, Galaxies and Filling run hand-written
ladders, and Dominosa, Rect and Galaxies a second one for the hint
(`design.md` § "Edge, line and division games"). What they read that the
language lacks: a value on the edges between squares that the answer is
(E), and a division of the board into regions, each a group (D), with the
connectivity step 8 built (`connected`, `cuts`, `through`, stretches).
Rect's `TIER_RUNGS` and Dominosa's `firstFiring` are hand copies of a ladder
order a description states.

## What Changes

- **E and D** in the description language, the ladder runtime and the
  checker, as far as these games read them.
- **The six games' ladders stated**, their tiers as they grade them, and
  their hand-written rungs retired, the second hint ladders with them;
  Rect's `TIER_RUNGS` and Dominosa's `firstFiring` go.
- **Split at the start**, by game, if the session finds the step too large:
  the proposal is re-scoped to what it takes, and the rest filed as a change
  of its own. Separate is the cheapest division game (`design.md`).

## Acceptance

Each game taken runs its compiled ladder for its hint and its generator's
grading; the hand-written rungs removed; every technique checked sound,
each with a planted defect that comes out unsound; the boards dealt, their
tiers and the hint walks compared with HEAD and each difference reported,
with which saves or links no longer load; large boards timed back to back
with HEAD; the guides updated; the running app checked; the next step
filed.

## What step 8 learned that binds here

Steps 7 and 8's earlier lessons are in `describe-loops-and-fleets`' and
`describe-fleets`' proposals (archived), all of which bind here; what Boats
added:

- **Run the frozen upstream boards against the first working ladder.**
  Boats' four Hard fixtures stalled where its trial missed what HEAD's
  validator read whole: boats the supposition closes elsewhere, the fleet's
  counts left rather than lengths full, and water at a supposed segment's
  corners. Walking HEAD's hint on the stalled board, in a HEAD worktree,
  named the step each time.
- **Solve every board HEAD dealt at its own grade**, not only the frozen
  ones: five Easy boards stalled because HEAD's verdict called a board won
  once the fleet was placed, the water unmarked, as the game does.
- **The checker deals a board clue with any values**: a guarantee the game
  keeps (a fleet names each length once) is a rule, or a technique reading
  it comes out unsound.
- **State as a rule a count the rules imply only through a sum**: z3 ran
  past 25 minutes deriving Boats' fleet total at order 4, and took 210 s
  with it stated (`docs/descriptions.md` § "Checking a technique sound").
  A region's size in a division game is the same shape.
- **A zero-parameter definition that counts over the board is computed at
  each read**: bind it first by `=` (`M = top`); Boats' two costliest rungs
  fell below the trials.
- **A library name spelled as a definition fails as a sort error**
  (`ends`, `across`): rename it.
- **Seeding runs the techniques run on placing**: where the player should
  see what one decides about their own marks, seed before setting `placing`
  and state a rung that decides the same.

## Figures to re-check

Measured on `describe-fleets`' last commit (2026-11-06): none designed
against yet. Re-measure each game's hand-written ladder and hint files before
designing, and record the HEAD baseline at the session's start.
