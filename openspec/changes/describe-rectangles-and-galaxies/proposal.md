# describe-rectangles-and-galaxies

**Status: filed by `describe-dominoes-rectangles-and-galaxies` (2026-11-07)**,
which split at its start and took Dominosa. The rest of step 9 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files
step 10, `describe-lines-and-loops`, when it is archived, or the part of
itself it splits off first.

## Why

Rect and Galaxies run hand-written ladders, and each a second one for the
hint (`design.md` § "Edge, line and division games"). Rect's `TIER_RUNGS` is
a hand copy of a ladder order a description states. The language has an
answer on the edges (`value.sort: edge`), regions as the groups the open
edges join (`through(c, O)`), a region's size and room to grow, and a
technique that runs as a value is placed (`on: place`); what these games read
beyond that is theirs to add: rectangles as a derived sort (Rect), point
reflection over a half-grid (Galaxies).

## What Changes

- **What each game taken reads** in the description language, the ladder
  runtime and the checker.
- **The games' ladders stated**, their tiers as they grade them, and their
  hand-written rungs retired, the second hint ladders with them; Rect's
  `TIER_RUNGS` goes.
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
Palisade's in `describe-divisions'`, Filling's in
`describe-dominoes-rectangles-galaxies-and-fills'` and Dominosa's in
`describe-dominoes-rectangles-and-galaxies'` (all archived); all of them bind
here. The ones these games meet first:

- **A region is `through(c, O)`, `O` the edges known open**, bound once by
  `=`; a solve opens edges as it concludes them, so read a group only while
  no open edge leads out of it.
- **Speed is in the shapes the compiler recognizes**
  (`docs/descriptions.md` § "What a technique compiles to"): bind the thing a
  firing is about rather than each place it shows, pin a clue in a binder
  over the cells, and read a cheap necessary condition before a walk.
  Dominosa's first statement dealt its order-9 Tricky boards ten times
  slower than HEAD, and these brought it to twice.
- **A rung a description cannot afford may be read differently, never
  dropped**: where a tier's hand-written rung is cheap by a structure the
  language lacks, look for the shape that states it, and add to the
  compiler what any game could use (Dominosa's union over a subset's
  members).
- **Compare tiers both ways**: HEAD's boards graded by the new ladder, and
  the new boards graded by HEAD's solver, at a few sizes; and time HEAD's
  generator in the same run, catching a give-up, which HEAD's can reach.

## Figures to re-check

Measured on `describe-dominoes-rectangles-and-galaxies`' last commit
(2026-11-07), the `solver.ts` files: Rect 559 lines, Galaxies 832; Rect's
`hint.ts` 598, Galaxies' 544. Re-measure before designing against any of
these, and record the HEAD baseline at the session's start.
