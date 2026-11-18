# trace-candidate-plans

**Status: filed by `trace-a-chain-from-its-reads` (2026-11-18)**, an engine
lack that change measured.

## Why

The notes games' Check & save (`candidateJudge` over `candidate-plan.ts`:
ABCD, Adjacent, Group, Keen, Mathrax, Rome, Salad, Seismic, Solo, Towers,
Unequal) never names where a chained move's chain began. The candidate plan
hands the judge no trace, so `Judging.traced` is `null` and the verdict says
only "a few steps on". Measured 2026-11-18 on each game's default board,
with each of the hint's moves made alone on the board as dealt: 256 chained
verdicts across these games named no start.

The ladder builders hand the judge a trace (`Judging.traced`: the graph, the
firings taken, and the marks made again). The judge replays the walk,
leaving out one candidate firing at a time, and names the earliest the move
needs (`docs/hints.md` § "Judging the last move"). That needs no technique
to say what it read, so a plan that keeps its firings in order, and can
make its marks again, can trace too.

## What changes

- The candidate plan records each firing it takes, in a `FactGraph` and as
  `LadderWalk.taken` does, and hands `candidateJudge` a trace.
- The plan's setup and note steps change what a rung reads, so each becomes
  either a firing of the graph or part of the replay's `between`.
- The measurement re-run per game. The guards in `move-judge.test.ts` are
  extended to a notes game where that would catch something Unruly's does
  not.

## Impact

`candidate-plan.ts`, `candidate-judge.ts`, possibly `move-judge.ts`. The
judge's words do not change.
