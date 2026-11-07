# describe-dominoes-rectangles-and-galaxies

**Status: filed by `describe-dominoes-rectangles-galaxies-and-fills`
(2026-11-07)**, which split at its start and took Filling. The rest of step
9 of `describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files
step 10, `describe-lines-and-loops`, when it is archived, or the part of
itself it splits off first.

## Why

Dominosa, Rect and Galaxies run hand-written ladders, and each a second one
for the hint (`design.md` § "Edge, line and division games"). Rect's
`TIER_RUNGS` and Dominosa's `firstFiring` are hand copies of a ladder order a
description states. The language has an answer on the edges
(`value.sort: edge`) and regions as the groups the open edges join
(`through(c, O)`), as Separate and Palisade state them, and a region's size
and room to grow, as Filling states them; what these games read beyond that
is theirs to add: dominoes and barriers (Dominosa), rectangles as a derived
sort (Rect), point reflection over a half-grid (Galaxies).

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

Separate's lessons are in `describe-edges-and-divisions`' proposal,
Palisade's in `describe-divisions`' and Filling's in
`describe-dominoes-rectangles-galaxies-and-fills'` (all archived); all of
them bind here. The ones a division game meets first:

- **A region is `through(c, O)`, `O` the edges known open**, bound once by
  `=` (`docs/descriptions.md` § "The formula syntax").
- **A solve opens edges as it concludes them, so a group bound at the top of
  a technique goes stale within its own run**: read a group only while no
  open edge leads out of it (§ "A statement's order is behavior").
- **An edge inside one group is decided by a rung of its own** (Palisade's
  `inside`), where upstream's union-find joined squares without a mark; and
  a board is solved where its walls, every other edge read open, pass the
  answer check.
- **A search over a division joins whole groups**: the branch that joins two
  groups opens every edge between them.
- **A ruling out a hint never shows reads only what the board shows**
  (Filling's `tooBig`, `noRoom`, `tooFar`), so the step that places by it can
  name the squares that pin it; and a square a region cannot do without is a
  cut of the squares it could reach (`cuts`), so a technique floods again
  only from those.
- **Compare where the ladders stop and what they read**, not only whether
  they finish; random clue sets graded by both ladders are the cheap check,
  with enough clues kept that most have one answer.

## Figures to re-check

Measured on `describe-dominoes-rectangles-galaxies-and-fills`' last commit
(2026-11-07), the `solver.ts` files: Dominosa 893 lines, Rect 559, Galaxies
832; Rect's `hint.ts` 598, Galaxies' 544. Re-measure before designing
against any of these, and record the HEAD baseline at the session's start.
