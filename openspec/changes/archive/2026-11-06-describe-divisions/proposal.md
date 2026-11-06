# describe-divisions

**Status: filed by `describe-edges-and-divisions` (2026-11-06)**, which
split at its start and took Separate. The rest of step 9 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). Split at its
start: it takes Palisade, and `describe-dominoes-rectangles-galaxies-and-fills`
takes Dominosa, Rect, Galaxies and Filling and files step 10,
`describe-lines-and-loops`, when it is archived.

## Why

Palisade ran upstream's six deductions as a hand-written sweep over a
union-find (`SolverCtx`), with a recording mode the hint narrated, beside a
description that stated only its help. What it reads beyond Separate's edges
and regions: a square's walls, the rim's included, and the edges round a
corner where four squares meet.

## What Changes

- **Palisade's ladder stated**: its regions are `through(c, O)`, `O` the
  edges known open; upstream's six deductions are six Easy rungs, and a
  seventh, `inside`, opens an edge whose two squares the open edges already
  join, which upstream's union-find joined without a mark. Unreasonable is
  the engine's search over them. A square's walls are a definition over
  `adj4`, and a corner's four edges are read through `corners` and
  `cells(p)`: the language needed nothing new.
- **`solver.ts` runs and walks the compiled ladder**: `SolverCtx`, the six
  sweeps and `deduceForcedEdges` are gone, the hint walks the ladder as
  Separate's does, and the answer check is the compiled one, a board solved
  where its walls, every other edge read open, pass it.
- **The hint teaches `inside`**: "This region already holds the squares
  either side of this edge, so it can't be a wall", in the help's list.
- **`edgeOf` is a lookup**: it recursed to order its squares, and was 14% of
  a Palisade deal.

## Acceptance

Palisade runs its compiled ladder for its hint and its generator's grading;
the hand-written rungs removed; every technique checked sound, each with a
planted defect that comes out unsound; the boards dealt, their tiers and the
hint walks compared with HEAD and each difference reported, with which saves
or links no longer load; large boards timed back to back with HEAD; the
guides updated; the running app checked; the rest of the step filed.

## What the comparison found

Recorded at HEAD (2c56c375) before any code moved: the four presets at both
tiers, six seeds each (48 boards), dealt, graded and walked from empty to
the end.

- **Boards and grades: 48 of 48 descs identical, every grade identical.**
  2,000 random clue sets on four shapes (a random division, each clue kept
  with a chance from 20% to 90%) get the same ladder verdict, the same
  answer and the same search verdict under both, the six the search gives
  up on included. The desc format is unchanged. **No save or link stops
  loading.**
- **Hint walks: 5 of 48 identical step for step, 11 the same length**, and
  every walk ends as HEAD's did, solved on Easy, refused on Unreasonable.
  The compiled walk takes the firing that carries on from the last steps,
  where HEAD's took its rounds in a fixed order, and 168 of about 5,250
  steps are `inside`, an edge HEAD left unmarked. Walls at a corner fell
  from 517 steps to 295 and walls between regions too big rose from 944 to
  1,158, the same edges reached by another rule first.
- **Time** (ms, mean of ten seeds, two runs back to back with a HEAD
  worktree):

  | Board | Deal HEAD | Deal now | Solve HEAD | Solve now |
  | --- | --- | --- | --- | --- |
  | 8×10 k8 Easy | 62–70 | 59 | 1.1 | 0.8 |
  | 8×10 k8 Unreasonable | 211–221 | 142–143 | 0.7 | 0.5 |
  | 12×15 k10 Easy | 483–488 | 521–561 | 4.0–4.4 | 3.6–4.0 |
  | 12×15 k10 Unreasonable | 1,662–1,702 | 1,168–1,173 | 2.6–2.7 | 2.1 |

  Before `edgeOf` was a lookup, 12×15 Easy deals took 1.2 to 1.3 times
  HEAD's. What is left of the gap was not traced: a profile of the deal
  puts the time in `numberExhausted` (15%), `notTooSmall` and the group
  lookups.

## What step 9 learned that binds here

Recorded for `describe-dominoes-rectangles-galaxies-and-fills`, whose
proposal carries them on:

- **A solve opens edges as it concludes them, so a group bound at the top of
  a technique goes stale within its own run.** `notTooSmall` grew a square
  its own earlier binding had joined to a group, as if alone, and opened a
  clueless 1×4 strip end to end; the checker cannot see it, since each
  binding is sound on the marks it read. A group is read only while no open
  edge leads out of it (`docs/descriptions.md` § "A statement's order is
  behavior").
- **An edge inside one group needs a rung**, where a hand-written solver's
  union-find joined squares without a mark: without `inside` a number would
  count that edge undecided where upstream counted it open.
- **`place` on an edge already known is true**, whatever it holds, so a
  rung does not find a wall inside a region; the verdict after the ladder
  does, as HEAD's did.

## Figures to re-check

Measured on this change's last commit (2026-11-06): Palisade's `solver.ts`
610 lines at HEAD, 595 now; `index.ts` 321 and 311.
