# describe-ascents-hint: design

Read 2026-11-09 at `22599034`.

## Decisions

- **A step is a placing technique's firing on a reading.** Ascent's player
  marks no candidates and every step places, so the hint does not walk the
  ladder's strikes as steps (`ladderWalk`). It reads the board afresh through
  the ladder's striking techniques, `touch` (`onLine`, `nextTo`), `reach`
  (and `reach`) or `route` (and `overlap`, `overlapEdges`, to the fixpoint),
  and takes the first placement `onlySquare`, `deadEnd`, `onlyNumberNear` or
  `onlyNumber` makes on it (`readingOf` in `solver.ts`). The hint's techniques are those
  pairs, in HEAD's order and tiers: `touch`, `reach`, `deadEnd`,
  `onlyBeside`, `only`, `route`, `routeBeside`, `routeOnly`.
- **A dead end is a technique of the description**, Normal, after `reach`:
  a square with one neighbor open to the path holds whichever of 1 and the
  last alone can still go there. It reads only numbers, walls and arrows, so
  the ladder grades by what the hint teaches. Checked sound at orders 3 and 4
  on every ruleset; its plant, two open neighbors, is unsound at 4.
- **The Edges `lines` and `pointers` are narrations of `route` placements**,
  not readings: each of their premises is implied by `overlapEdges` at its
  fixpoint over `onLine`, so every square they single out the `route`
  reading also does. `lines` takes the `onlySquare` placement whose
  premises single it out most simply, and `pointers` the `onlyNumberNear`
  (Tricky) or `onlyNumber` (Hard) placement whose rivals each fail a
  premise, with fewest rivals, as HEAD chose.
- **A whole run stays a narration of the hint's.** Counting a run's routes is
  how a player sees several numbers at once; the ladder's placements reach
  each of them one at a time, and the count is checked against the placement
  that began it. Stated as a technique it would grade by a search the
  generator does not need.

## Measured against HEAD

- **Hint walks**: 200 boards HEAD deals (every preset, the hint test's
  custom shapes and 5x5 and 6x6 Edges at each tier, five seeds) walked to
  the end both ways: all 200 walks are the same, step for step, rung, move
  and words, with no refusal either side.
- **Deals** (`deal-compare`, 5 a preset, 80 boards): no board or verdict
  differs; deals 1.02× HEAD's time, solves 1.02×.
- **Large boards**, back to back, three seeds each: deals within 3% of HEAD
  (12x12 Classic Hard 300 ms, 15x15 Classic Normal 760, 12x12 Orthogonal
  Hard 280, 12x12 Hex Hard 115, 8x8 Edges Hard 12 to 90). The hint's first
  plan is 8 to 30 times faster (12x12 Classic Hard 60 to 100 ms, HEAD 270 to
  3,300; 15x15 Classic Normal 140, HEAD 1,150), since a reading is built once
  a board and a technique's firings are the compiled scan's.
