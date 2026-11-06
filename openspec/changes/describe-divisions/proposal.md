# describe-divisions

**Status: filed by `describe-edges-and-divisions` (2026-11-06)**, which
split at its start and took Separate. The rest of step 9 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files
step 10, `describe-lines-and-loops`, when it is archived, or the part of
itself it splits off first.

## Why

Palisade, Dominosa, Rect, Galaxies and Filling run hand-written ladders, and
Dominosa, Rect and Galaxies a second one for the hint (`design.md` § "Edge,
line and division games"). Rect's `TIER_RUNGS` and Dominosa's `firstFiring`
are hand copies of a ladder order a description states. The language now
has an answer on the edges (`value.sort: edge`) and regions as the groups
the open edges join (`through(c, O)`), as Separate states them; what these
games read beyond that is theirs to add: a cell's edge count (Palisade),
dominoes and barriers (Dominosa), rectangles as a derived sort (Rect), point
reflection over a half-grid (Galaxies), and a region's size as a clue
(Filling).

## What Changes

- **What each game taken reads** in the description language, the ladder
  runtime and the checker.
- **The games' ladders stated**, their tiers as they grade them, and their
  hand-written rungs retired, the second hint ladders with them; Rect's
  `TIER_RUNGS` and Dominosa's `firstFiring` go.
- **Split at the start**, by game, if the session finds the step too large:
  the proposal is re-scoped to what it takes, and the rest filed as a change
  of its own.

## Acceptance

Each game taken runs its compiled ladder for its hint and its generator's
grading; the hand-written rungs removed; every technique checked sound,
each with a planted defect that comes out unsound; the boards dealt, their
tiers and the hint walks compared with HEAD and each difference reported,
with which saves or links no longer load; large boards timed back to back
with HEAD; the guides updated; the running app checked; the next step
filed.

## What step 9 learned that binds here

Steps 7 and 8's lessons are in `describe-loops-and-fleets`' and
`describe-fleets`' proposals, and Separate's in
`describe-edges-and-divisions`' (all archived); all of them bind here. The
ones a division game meets first:

- **A region is `through(c, O)`, `O` the edges known open**, bound once by
  `=`, and `A`, `B` bound by `=` from it: `x in A` and `A = B` are then a
  lookup of one shared list (`docs/descriptions.md` § "The formula syntax").
- **A search over a division joins whole groups**: the branch that joins a
  group to a square opens every edge between the two groups.
- **The generator steers by what the ladder read**: compare where the two
  ladders stop and what they read, not only whether they finish, or a deal
  that parts from HEAD's looks like a slower one. Time a board size over
  forty seeds where deals part; four showed a 2.4-fold gap that forty put
  within the noise.

## Figures to re-check

Measured on `describe-edges-and-divisions`' last commit (2026-11-06), the
`solver.ts` files: Palisade 610 lines, Dominosa 893, Rect 559, Galaxies
832, Filling 776; Rect's `hint.ts` 598, Galaxies' 544. Re-measure before
designing against any of these, and record the HEAD baseline at the
session's start.
