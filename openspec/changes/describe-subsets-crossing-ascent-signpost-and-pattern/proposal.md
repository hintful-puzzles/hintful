# describe-subsets-crossing-ascent-signpost-and-pattern

**Status: filed by `describe-the-remaining-number-games` (2026-11-08)**,
which took Undead alone. It is the rest of step 11 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"), the last.
It splits again at its start if the session finds it too large, filing the
rest as it goes. When the last of it is archived,
`describe-the-whole-catalog`'s task 4 (the engine's old layer, and the
guard) is next.

## Why

Subsets, Crossing, Ascent, Signpost and Pattern run hand-written ladders. A
description states the rules and the reasoning once, and the checker proves
each technique sound. Crossing keeps a second hint engine that its
description retires.

## What Changes

- **What these games read** is added to the description language, the ladder
  runtime and the checker: the plan names values (V), bijections, lists,
  matchings, walks and bitwise relations. Re-check each against the game's
  solver before building it; a scaffold's "why this is hard" can be false.
- **Each game's ladder is stated**, its tiers as it grades them and named as
  its menu names them, and its hand-written rungs are retired. A search the
  game keeps for grading (a forcing pass, a brute-force uniqueness check)
  stays the game's own, as Undead's does.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's grading,
and its hand-written rungs are removed. Every technique is checked sound, each
with a planted defect that comes out unsound. The boards dealt, their tiers,
completion and the hint walks are compared with HEAD, and each difference is
reported, with which saves or links no longer load. Large boards are timed
back to back with HEAD. The guides and help are updated and the running app
is checked.

## What Undead learned that binds here

The lessons in `describe-the-remaining-number-games`' predecessors'
proposals bind here, and these:

- **The order a ladder tries equals in is grading behavior** where a tier
  is bounded by passes. Undead's Easy is three sightline passes, and 5 of
  180 deals moved until the description tried its sightlines in upstream's
  order (fewest monsters first, then clockwise from the top left). Compare
  the deals before trusting a ladder that grades the same.
- **State first what the hint must say first**, where grading does not
  depend on it. Undead's sightline strikes everything its monster counts
  would, so with the counts stated after it no count ever fired; stated
  before, the walks are HEAD's.
- **The checker reads a walk a step at a time.** Enumerating every layout
  a sightline could pass ran z3 out of memory at order 3; a walk over the
  states a line can stand in (cell, heading, bent), each under the OR of
  the guards that bring it there, did not. Hold such a reading equal to
  the runtime's on every layout of a small board, in a test of its own.
- **A large `fill` is a z3 quantifier.** Past 4,096 assignments the checker
  binds one integer a member under `forall` or `exists`, rather than
  listing every assignment.
- **The checker's range binder counted only to the board's top value**
  before this change; it counts a range's numbers now. A technique that
  binds a number past the order is checked on all of them.
