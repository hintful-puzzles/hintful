# close-trace-gaps

**Status: filed by `trace-a-chain-from-its-reads` (2026-11-18)**, an engine
lack that change measured.

## Why

Check & save names where a chained move's chain began by replaying the walk
on the board as dealt, leaving out one candidate firing at a time, and
naming the earliest the move cannot be made without (`docs/hints.md`
§ "Judging the last move"). Measured 2026-11-18, every judging game's
default board, the hint's moves each made alone from the board as dealt:
of the ladder walks' chained verdicts, 363 still name no start. Loopy 168
(none named), Pattern 61 of 104, Pearl 32 of 46, Galaxies 28 of 53, Slant
22 of 43, Sticks 14 of 35, Subsets 12 of 28, and a few each in Unruly,
Magnets, Map, Clusters, Spokes and Filling.

The judge can come up empty for four reasons, and which one applies to each
of these is not yet known:

- **The replay with every firing does not reach the move.** A builder
  writes marks outside the walk's firings: Pearl's `stepOf` draws the line
  a pearl carries on (`carryOn`, `m.place`), which no firing records. A
  step's own writes should be recorded as a firing of the graph (as
  `placingRung` records its culls), or made by one.
- **The fact is not found among the firing's facts** (`chainOf` returns
  `null`), or the move is reached by the first firing.
- **The candidates are cut off** (`MOST_TRIED`, `MOST_OFFERS`) before the
  one the move needs.
- **Every candidate can be left out**, since another path reaches the move
  too. Then naming none is right, and the count shows it.

## What changes

- A diagnosis per game, using `auditChains` (`ChainAudit.whole`, `tried`,
  `offers`), saying which reason holds for each.
- Each reason that is the engine's, mended in the engine. A game's own
  write is recorded through an engine hook, not per-game bookkeeping.
- The measurement re-run, per game, and a cross-game guard if one would
  catch a regression no cheaper test does.

## Impact

`move-judge.ts`, `ladder-runtime.ts`, the edge and firing builders, and the
games named. The judge's words do not change; more verdicts name a start.
