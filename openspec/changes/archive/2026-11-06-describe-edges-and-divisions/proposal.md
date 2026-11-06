# describe-edges-and-divisions

**Status: filed by `describe-fleets` (2026-11-06)**, which closed step 8.
Step 9 of `describe-the-whole-catalog`'s plan (`design.md` § "The plan").
Split at its start: it takes Separate, and `describe-divisions` takes
Palisade, Dominosa, Rect, Galaxies and Filling and files step 10,
`describe-lines-and-loops`, when it is archived.

## Why

Separate ran a hand-written ladder (`SolverScratch`, a component-pair
`disconnect` matrix, three rungs) beside a description that stated only its
help. What it reads that the language lacked: an answer on the edges between
squares (E), and the regions those edges make, each a group (D).

## What Changes

- **An answer on the edges** (`answer.value.sort: edge`): `value(e)`,
  `known(e)` and `place(e, d)` read an edge, `CellMarks` holds a mark an
  edge, and the checker deals its answers on edges. A hint step on an edge
  names its two squares.
- **Separate's ladder stated**: its regions are `through(c, O)`, `O` the
  edges known open; `sharedLetter`, `walledApart` and `onlyWay` are its
  three rungs, all Easy; Unreasonable is the engine's search over them.
  `solver.ts` runs and walks the compiled ladder, and `SolverScratch`, the
  component matrix and the hand-written rungs are gone. The answer check is
  the compiled one.
- **Group membership is an identity test**: the compiled `edgeGroups` keeps
  each group as one shared list, so `x in through(c, O)` and `A = B` compare
  lists, and keeps the groups while `O` is unchanged.

## Acceptance

Separate runs its compiled ladder for its hint and its generator's grading;
the hand-written rungs removed; every technique checked sound, each with a
planted defect that comes out unsound; the boards dealt, their tiers and the
hint walks compared with HEAD and each difference reported, with which saves
or links no longer load; large boards timed back to back with HEAD; the
guides updated; the running app checked; the rest of the step filed.

## What the session did

Split by game: Separate alone, as `design.md` named it the cheapest division
game, and the language's two new constructs are enough to state it. What the
other five read beyond them (a cell's edge count, dominoes, rectangles, point
reflection, a region's size as a clue) is `describe-divisions`'.

## What the comparison found

Recorded at HEAD (a75b45aa) before any code moved: the four presets at both
tiers, six seeds each (48 boards), dealt, graded at each cap and walked from
empty to the end.

- **Boards and grades: 36 of 48 descs identical, every grade identical.**
  Eleven Unreasonable boards and `6x8k4d0#3` deal differently. When the
  ladder stops short, it stops with the same joins and walls as HEAD's
  (86 of 86 stuck letterings), but it may read a different letter as the
  one two groups share, as the groups it meets differ when the rungs fire in
  another order, and the generator only swaps letters no deduction read. All 48
  boards HEAD dealt solve at their own grade, 4,000 random letterings and
  2,880 letterings near HEAD's boards finish or stop alike under both
  ladders, and the desc format is unchanged. **No save or link stops
  loading.**
- **Hint walks: 15 of 36 identical step for step, 34 the same length**, and
  every walk ends as HEAD's did, solved on Easy, refused where Unreasonable
  needs the search. The rungs fire as often (shared letter 750→772, walled
  apart 183→190, only way 663→688 over boards partly different). Walks part
  on which edge a rung takes first: HEAD visited a square's lower edge before
  its right one, and the compiled ladder walks the edges in the space's
  order.
- **Deal time** (ms a deal, back to back with a HEAD worktree; four seeds,
  forty where marked):

  | Board | HEAD | Now |
  | --- | --- | --- |
  | 6×7 k6 Easy | 5 | 7 |
  | 6×7 k6 Unreasonable | 95 | 92 |
  | 10×10 k5 Unreasonable | 583 | 495 |
  | 12×12 k6 Easy | 1,277 | 854 |
  | 8×8 k8 Easy (40) | 136 | 175 |
  | 12×12 k8 Easy (40) | 7,086 | 9,081 |

  On the same boards a solve is as fast or faster (12×12 k8: 1,770 µs at
  HEAD, 1,135 now; 8×8 k8: 298 and 341). The 27 of 40 8×8 k8 deals that
  take HEAD's path are 19% slower (101 ms and 120). 12×12 k8 deals part from
  HEAD's on 39 of 40 seeds, each taking 0.1 to 17 s at either; the mean log
  ratio is 0.11 ± 0.19, within the noise. The first working ladder dealt
  3 to 12 times slower than HEAD; a profile named the group lookups, and
  keeping each group as one list, the groups between runs, a firing's
  reason once per firing, and `onlyWay`'s squares to those beside the group
  made up the difference.

## What step 9 learned that binds here

Steps 7 and 8's lessons are in `describe-loops-and-fleets`' and
`describe-fleets`' proposals (archived), all of which bind
`describe-divisions`; what Separate added:

- **A region is `through(c, O)`, `O` the edges known open**, bound once by
  `=`: the answer is the walls, and a group is what the open edges join.
  Bind `A` and `B` by `=` from it; `x in A` and `A = B` are then a lookup.
- **A search over a division joins whole groups**: a branch that joins a
  group to a square opens every edge between the two groups, or an edge
  left undecided inside the merged group loses answers (a tier test and a
  pasted board found it).
- **A comprehension's names shadow the binding's**: a membership shape that
  read `v_e` inside `between` captured the comprehension's own `e`.
- **A rung that reads a relation another rung keeps current may read it
  plainly**: `onlyWay` runs after `walledApart`, so a square walled from the
  group is one whose group is, and reading the edge alone keeps it sound and
  cheap.
- **Compare where the solvers stop, not only whether they finish**: the
  generator steers by what the ladder read, so the same fixpoint with
  another firing order deals other boards.

## Figures to re-check

Measured on this change's last commit (2026-11-06): Separate's
`solver.ts` 673 lines at HEAD, 475 now. Re-measure the five games' files
before designing against them.
