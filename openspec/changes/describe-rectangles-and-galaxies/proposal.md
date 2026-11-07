# describe-rectangles-and-galaxies

**Status: filed by `describe-dominoes-rectangles-and-galaxies` (2026-11-07);
split at its start (2026-11-07) and took Rect.** Galaxies is filed as
`describe-galaxies`, the rest of step 9 of `describe-the-whole-catalog`'s
plan (`design.md` § "The plan"), which files step 10 when it is archived.

The HEAD baseline (2026-11-07, `a1e2f914`): Rect's `solver.ts` 559 lines,
`hint.ts` 598. Mean deal in ms over six seeds: 7×7 Easy 2, 11×11 Easy 2,
15×15 Easy 4, 19×19 Easy 7, 15×15 Normal 40, 19×19 Normal 182, 11×11
Unreasonable 31; Patches 7×7 Easy 7, Normal 19, Unreasonable 29, 9×12
Normal 123.

## What was done (Rect, 2026-11-07)

- **Rect runs its compiled ladder** for the hint, the generator's grading
  and the answer search: `fit`, `uncovered`, `boxed`, `reach`, `overlap`
  (Easy), `starve`, `line` (Normal). `solver.ts`'s upstream solver and
  `hint.ts`'s hand-written rungs and `TIER_RUNGS` are gone; `isSolved` is
  the compiled answer check.
- **The language** gained the rectangle sort (`rects`, `cells`, `width`,
  `height`, `inner`, `rim`), and the compiler three shapes any game can use:
  a definition that reads no marks is kept for the board; a rectangle meeting
  or lying within another compiles to their corners; an answer check hoists
  what a rule binds, as a rung does. Each kept definition has a store of its
  own, and a rectangle's lists are kept per grid.
- **`boxed`** closes a fit whose rim is all lines, which HEAD's notion of an
  Easy Patches board needed; **`uncovered`** ends a search's dead branch
  where a square has no clue left (below).
- **Soundness**: each technique checked sound and its plant caught, plain
  and Patches. The checker keeps a definition read at plain elements for
  the board: without it `line`, which reads `sole(q)` inside a loop over a
  clue's rectangles, built its query past the heap at order 3, and with it
  `line` takes 22 s; `starve` under Patches, which ran to its ten minutes
  before, is proved whole in 41 s.

## What the comparison with HEAD found

Twenty seeds a class, eleven classes from 7×7 to 15×15 and Patches 7×7 and
9×12, at every tier:

- **Boards dealt**: identical at Easy and Normal; Unreasonable boards differ
  (the mender's search tries positions in another order), which breaks
  nothing, the app handing out boards, not seeds.
- **Tiers both ways**: every board of HEAD's grades at its tier under the
  ladder, and every new board at its tier under HEAD's solver.
- **Saves and links**: none stops loading. Before `uncovered`, two of HEAD's
  twenty Patches 7×7 Unreasonable boards, and 4 of 100 in a wider sample,
  lost their proved answer (the search needed up to 32,000 positions of its
  2,000), which would have cost them Check & Save's mistakes and Solve; with
  it, all 100 and both are proved within 2,000.
- **Hint walks**: as many steps within three a class; the order of the
  steps differs, as the ladder's order is not HEAD's hint's.
- **Deal time** (2026-11-07, back to back with HEAD, mean of six seeds, ms,
  HEAD then now): Easy 7×7 to 19×19 the same (2 to 8); 15×15 Normal 43 and
  47; 19×19 Normal 191 and 182; Patches 7×7 Easy 7 and 10, Normal 23 and
  41; 9×12 Normal 131 and 346. Unreasonable is slower: 11×11 31 and 283;
  Patches 7×7 29 and 110; four seeds each of 12×14 (26 to 197 against 210
  to 1,438) and 15×15 (58 to 212 against 423 to 2,109). The cost is a kept
  definition rebuilt after every placement; `keep-definitions-across-placements`
  is filed for it.

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
