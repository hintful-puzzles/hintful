# describe-galaxies

**Status: filed by `describe-rectangles-and-galaxies` (2026-11-07)**, which
split at its start and took Rect. The rest of step 9 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files
step 10, `describe-lines-and-loops`, when it is archived.

The HEAD baseline (2026-11-07, `f19700c9`): Galaxies' `solver.ts` 832
lines, `hint.ts` 544; now 538 and 404, beside the compiled module.

## What was done (2026-11-07)

- **Galaxies runs its compiled ladder** for the hint, the generator's
  grading and the engine's answer search: `dotTile`, `split`, `separate`,
  `enclosed`, `soleOwner`, `onlyReach`, `exclave`, `mirrorWall`, all
  Normal. The hand-written rungs, the private recursion, `planLadder` and
  the hint's second order are gone. Unreasonable is the engine's search
  (budget 2,000), branching on the square with the fewest dots left, the
  set `onlyReach` reads.
- **The language** gained the centers sort (`centers`, `cells(p)`,
  `opp(c, p)`) and a mark on the cells that names a clue (`notation: "one
  of clues(kind)"`, read `arrow(c)`, made by `mark(c, q)`, with a `means`
  the checker holds every named square to). The answer is the walls, as in
  Palisade and Rect; a verdict reads the lines off the arrows once every
  square has one.
- **`ladderWalk` takes roles**: `dotTile` is a `prerequisite` and
  `mirrorWall` a `fallback`, the hint's order before.
- **`soleOwner` is the drag's own test**: by the dots, and by the finished
  galaxies (a region walled in round one dot, symmetric about it), never by
  the arrows, so the help's "dragging from it will ring exactly one dot"
  holds. A guard in `galaxies-hint.test.ts` asks `legalDotsFor` at every
  such step; stated by the arrows instead, it fails on the first board.
- **Soundness**: each technique sound at order 3 and its plant caught
  (`results-describe-galaxies.txt`), the slowest 6.9 s.

## What the comparison with HEAD found

Twenty seeds a class, nine classes from 5×5 to 15×15 and 13×17, both
tiers:

- **Boards dealt**: identical but for four of twenty 15×15 Unreasonable,
  where HEAD's recursion gave up (`Unfinished`) on boards the search proves
  to have one answer, so the generator kept an earlier board.
- **Tiers both ways**: every HEAD board grades at its tier under the
  ladder. Every new board grades at its tier under HEAD's solver but those
  four. **Saves and links**: none stops loading.
- **Hint walks** on HEAD's boards: 176 of 180 identical step for step; every
  Normal board solved and every Unreasonable one refused at the same step
  count, but one 10×10 that walks 12 steps further.
- **Deal time** (back to back, two runs each, mean ms, HEAD then now): 5×5
  to 10×10 Normal the same (3 to 9); 5×5 Unreasonable 141 and 176, 7×7 45
  and 49, 10×10 81 and 93; 13×17 Normal 38 and 61; 15×15 Normal 36 and 65;
  15×15 Unreasonable 203 and 283, its slowest board 0.96 s and 3.1 s (a
  board HEAD does not deal). A profile of twenty 15×15 Normal deals puts
  the ladder at 48% of a deal and `soleOwner` at 28%, of which `near` is
  17%: `near` and `room` are kept for the board and made again for each
  board the generator tries, the cost `keep-board-definitions-across-boards`
  is filed for. `reach`, kept for the marks, is 13%.

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
