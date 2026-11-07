# describe-galaxies

**Status: filed by `describe-rectangles-and-galaxies` (2026-11-07)**, which
split at its start and took Rect. The rest of step 9 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files
step 10, `describe-lines-and-loops`, when it is archived.

## Why

Galaxies runs a hand-written ladder (`solver.ts`, upstream's `solver_state`
rules and a private recursion at Unreasonable), and its hint orders the
same rules again (`hint.ts`, `RUNGS` picked in a second order). A
description states the rules and the reasoning once, and the checker proves
each technique sound.

## What Changes

- **What Galaxies reads** in the description language, the ladder runtime
  and the checker: its dots sit on squares, edges and corners, so a region
  is read against the dot at its center, and a square's partner is its
  point reflection through that dot. The answer is the edges (`value.sort:
  edge`) and a region `through(c, O)`, as in Palisade and Rect; the
  association a player draws (a square's arrow to a dot) is a mark that
  means something of the answer, and a board has more dots than a 32-bit
  set of values holds, so a square's dot is not a cell's value.
- **The ladder stated**, its tiers as it grades them, and its hand-written
  rungs and the hint's second order retired; Unreasonable dealt where the
  ladder stops and the engine's search finds one answer, the private
  recursion retired with it.

## Acceptance

Galaxies runs its compiled ladder for its hint and its generator's grading;
the hand-written rungs removed; every technique checked sound, each with a
planted defect that comes out unsound; the boards dealt, their tiers and
the hint walks compared with HEAD and each difference reported, with which
saves or links no longer load; large boards timed back to back with HEAD;
the guides updated; the running app checked; step 10 filed.

## What step 9 learned that binds here

Separate's lessons are in `describe-edges-and-divisions`' proposal,
Palisade's in `describe-divisions'`, Filling's in
`describe-dominoes-rectangles-galaxies-and-fills'`, Dominosa's in
`describe-dominoes-rectangles-and-galaxies'` and Rect's in
`describe-rectangles-and-galaxies'` (all archived once this is open); all
of them bind here. The ones Galaxies meets first:

- **A region is `through(c, O)`, `O` the edges known open**, bound once by
  `=`; a solve opens edges as it concludes them, so read a group only while
  no open edge leads out of it.
- **A player's notation is what a hint may conclude.** Rect's player draws
  only lines, so its ladder concludes a whole rectangle or a line, never a
  lone open edge; Galaxies' player draws walls and arrows, so its marks are
  both.
- **A definition read inside a loop over other elements is kept for each
  argument** while no value is placed (Rect's `fits`); bind the thing a
  firing is about, and read a cheap necessary condition before a walk.
- **Compare tiers both ways**, and time HEAD's generator in the same run,
  catching a give-up.

## Figures to re-check

Measured 2026-11-07 on `describe-rectangles-and-galaxies`' first commit:
Galaxies' `solver.ts` 832 lines, `hint.ts` 544. Re-measure before
designing against them, and record the HEAD baseline at the session's
start.
