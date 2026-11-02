# describe-on-a-graph

**Status: filed by `describe-revealed-clues` (2026-11-01)**, step 6 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files
step 7, `describe-runs-sightlines-and-looks`, when it is archived.

## Why

Map deduces on a graph the board deals, its regions and which border which,
and runs a hand-written ladder (`solver.ts`, upstream's `map_solver`) beside
a description that states only its answer check. Every space the language
has is a grid: a cell's neighbors are its geometry's. The vocabulary Map
lacks is G: a space whose elements and adjacency the board deals.

## What Changes

- **G** in the description language, the ladder runtime and the checker: a
  space of elements the board deals, each with the elements it borders, the
  marks and the candidate walk keyed by element rather than by grid cell,
  and the checker's encoding of a dealt graph (every graph of a small size,
  or the boards the game deals, whichever the check can afford).
- **Map's ladder** stated, its tiers as upstream grades them (one color
  left, a shared pair, a region weighed against its neighbors); `solver.ts`'
  rungs retired, and the wing's solver half in `engine/wing.ts`, whose last
  solver caller is Map. The recursion tier stays the engine's search.

## Acceptance

Map runs its compiled ladder for its hint and its generator's grading; the
hand-written rungs removed; every technique checked sound; the boards dealt,
their tiers and the hint walks compared with HEAD and each difference
reported, with which saves or links no longer load; the guides updated;
step 7 filed.

## What step 5 learned that binds here

- A clue revealed in play needed no declaration: the game builds `Dealt`
  from its state. A dealt graph may be the same: ask what would read a
  declaration before adding one (`docs/descriptions.md` § "The file").
- A continuing walk (`ladderWalk`) asks every rung for all its firings each
  step; where a hint plans to the end of a board, that cost is paid once a
  step, and Mines left it for the first firing. Measure a hint's latency on
  the largest preset before choosing the driver.
- `subsets` over a set of `n` allows 2^`n` subsets; pin the size and bound
  `n` (`docs/descriptions.md` § "What a technique compiles to").
- The soundness check runs one game's techniques side by side
  (`CHECK_TECHNIQUES`), each run keeping the others' verdicts. A query that
  outgrows z3's heap hangs the run rather than failing it; watch for `OOM`
  and split it (`CHECK_SPLIT`, `docs/descriptions.md` § "Checking a
  technique sound").

## Figures to re-check

Measured on `describe-revealed-clues`' last commit (2026-11-01):
`map/solver.ts` 296 lines, `map/hint.ts` 505, `engine/wing.ts` 116.
Re-measure before designing against any of them.
