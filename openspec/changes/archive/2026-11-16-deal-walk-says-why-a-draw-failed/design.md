# deal-walk-says-why-a-draw-failed: design

## What `deal-walk` reported at HEAD (2026-11-16)

`DEAL_WALK_CELLS="6x6de 8x8de" DEAL_WALK_SEEDS=6 npm run deal-walk -- norinori`:

- `6x6de` 0.1 s, slowest 0.2, tries median 50, most 65, Easy 6
- `8x8de` 5 s, slowest 11, tries median 1435, most 3530, Easy 6

That is a count of draws and nothing on where each one ended. Norinori's
four measured attempts (`2026-11-16-add-norinori/design.md` § "Decisions",
"The deal") needed, besides the draws, the mends tried and how many came
right, and the squares left open where a mend gave up.

## Decisions

- **One census, `engine/deal-census.ts`, holds everything a deal counts**:
  each retry guard's tries (what `retry-limit.ts` tallied before), each draw
  thrown away by its stage, and how each mend ended. It is taken only under
  `takingCensus`, and every count is one `null` test where none is taken,
  so the app's deal pays nothing. `retryLimit` writes its tries into it.
- **A stage is named where the draw is thrown away**, by
  `drawRejected(stage)`, which returns `null` so that a draw function
  returning `null` writes `return drawRejected("…")`. A game adds no export
  and no counter of its own.
- **The engine's helpers that refuse a draw name their own stage**:
  `growFromSeeds` (a square walled off), `mergeToCount` (the joins stop
  short) and `solvableAtExactlyTier` (too easy, or not finished at the
  tier). A game that uses them is counted with zero lines.
- **A mend records why it ended and the fewest squares it left open**
  (`stalled`, `out of moves`, `no square can move`, the two ways a board too
  easy ends, or `mended`), with the board's squares. "Under which rungs" is
  the judge's tier, which is the cell's: the census does not run a second
  ladder to ask what the whole ladder would leave, since that would be a
  deal's cost paid inside the instrument and change its times.
- **`deal-walk` prints the census for a named cell only**, where the tries
  and tiers already are: the ladder's report is one line a ladder for every
  game, and stage counts there would bury the times. `DEAL_WALK_CELLS=presets`
  names a game's presets, so "each preset" needs no list typed by hand.

## Norinori's attempts, read from the counts

Each through `DEAL_WALK_CELLS`, 2026-11-16, the reverted generator a
constant changed for the run and put back. The tries at each cell matched
HEAD's to the draw (8x8 Easy: median 1435, most 3530), so counting moves no
board.

- **Smallest region three, no closed dominoes** (`CLOSED_AT_MOST_ONE_IN`
  infinite), 6x6 Easy, one deal: gave up at the 120 s deadline; 0 of 26,392
  mends came right, every one stalled with all 36 squares open. "No Easy
  rung has a first step on an empty board" is that last number.
- **Smallest region two**: the draws per board, which the tries already
  gave at HEAD. Not rerun.
- **Closed dominoes merged from single squares**: what it found (7 of 12
  regions two squares) is a property of the boards dealt, not of a draw
  thrown away, so the census does not show it, nor is it meant to.
- **The size cap at Easy** (`LARGEST_OVER_MEAN` infinite), 8x8 Easy, six
  deals: mends stalled with a median of 35 of 64 open (the design's "more
  than 20"); with the cap, draws move from mends to the joins
  (`divide: no join left before the count of regions` 1,930 uncapped,
  3,787 capped).

On the current generator, every preset (`DEAL_WALK_CELLS=presets`, three
deals each): about one mend in 300 to 600 comes right, almost every other
stalls, and the joins that stop short of the count are the stage that
throws away the most draws. Both are for `norinori-larger-boards`.
