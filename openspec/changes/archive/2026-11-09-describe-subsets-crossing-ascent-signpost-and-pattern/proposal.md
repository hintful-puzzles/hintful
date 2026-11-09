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

## What was done

- **The split**: this change took Pattern alone. Signpost, Ascent, Crossing
  and Subsets each read a construct of their own and are filed as
  `describe-subsets-crossing-ascent-and-signpost`, with what each needs.
- **The language**: a clue may be a list of numbers (`list: true`), at a
  line, compared whole; `run_lengths(L, S)` is the lengths of `S`'s runs
  along `L`. An `exists fill` of a line whose only test is its runs compiles
  to `runFits`, a dynamic program over where each run starts, and its pinned
  form to that program's projection, every square answered in one pass. Its
  answers are held equal to listing every filling, in
  `describe-runtime.test.ts`. The checker deals a list clue as a length and
  members, and reads `run_lengths` as each way the set may meet the line.
- **Pattern is described** (`pattern.description.yaml`): one technique,
  `line`, which settles each stretch of a line's undecided squares that every
  fit agrees on. It is sound at order 3, and its plant (a square no fit can
  make `d` read as one every fit does) is unsound. The hand-written line
  solver, its packings and its four rungs are retired; the reason a step
  gives (overlap, out of reach, a line with no clues, every fit agrees) is
  read off the packings at the firing, as the hint's words were before. An
  immutable clear square in a desc's suffix is now a clear square to the
  solver; upstream's solver read it as undecided.
- **Compared with HEAD** (20 deals a menu cell at 10×10, 10×15, 15×15, 20×25
  and 30×30, Easy and Unreasonable, 200 boards): every deal is the same and
  every tier agrees; status reads every solution solved and a wrong filling
  of each not. Every Easy walk finishes on both sides, 34,869 steps against
  34,876. The steps are as HEAD's sentences are; their kinds moved a little
  (overlap 16,766 against 16,931, out of reach 16,369 against 16,762, every
  fit agrees 1,734 against 1,183), since a stretch is now what the fits
  settle, not what one technique found first. **The hint's order moved**:
  rows before columns, and the walk continues from the cells it decided, as
  every described game's does, rather than starting again from the first
  column. No save or link changes: the desc and the moves are as they were.
- **Timed back to back with HEAD**: a deal costs 21 ms against 9 at 30×30
  Easy, and 111 ms against 27 at 30×30 Unreasonable, the worst preset; a
  20×25 Unreasonable deal 50 ms against 15. A whole hint walk costs about
  10 ms, 1.2× HEAD's. The DP was profiled to this from six times HEAD's cost;
  what is left is the ladder's generic binding over every line and value.

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
