# describe-lines-and-loops

**Status: filed by `describe-galaxies` (2026-11-07)**, step 10 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). Eight games
is more than one session describes; split at the start by game, as steps 7
to 9 did, take the first and file the rest. The last of them files step 11,
`describe-the-remaining-number-games`, when it is archived.

## Why

Path, Pearl, Tracks, Spokes, Bridges, Net, Tents and Loopy each run a
hand-written ladder, and Spokes, Net and Loopy order their rungs a second
time for the hint (the survey, `design.md` § "Edge, line and division
games"). A description states the rules and the reasoning once, and the
checker proves each technique sound.

## What Changes

- **What the line games read** in the description language, the ladder
  runtime and the checker: an answer on the edges that is a line rather
  than a wall, a graph derived from the grid (Spokes' king links, Bridges'
  spans) and Loopy's tilings, marks on the edges (Loopy's dlines).
- **Each game's ladder stated**, its tiers as it grades them, its
  hand-written rungs and the hint's second order retired; a tier past the
  ladder dealt where the engine's search finds one answer.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's
grading; the hand-written rungs removed; every technique checked sound,
each with a planted defect that comes out unsound; the boards dealt, their
tiers and the hint walks compared with HEAD and each difference reported,
with which saves or links no longer load; large boards timed back to back
with HEAD; the guides updated; the running app checked.

## What step 9 learned that binds here

The lessons of `describe-edges-and-divisions`, `describe-divisions`,
`describe-dominoes-rectangles-galaxies-and-fills`,
`describe-dominoes-rectangles-and-galaxies`,
`describe-rectangles-and-galaxies` and `describe-galaxies` (archived) all
bind here. The ones this step meets first:

- **The plan retires the runner's `prerequisite` and `fallback`; Galaxies
  now uses both**, through `ladderWalk`'s `roles` (`dotTile` first,
  `mirrorWall` last, its hint's order before). Tracks and Tents set them
  too, and Crossing's hint solver sets `fallback`. Retiring them means
  saying how each order is otherwise kept, or the hint teaches another
  order: decide which before retiring, and compare the walks.
- **Where a control already shows the player a move is forced, the rung
  that says so states the control's own test**, and a guard asks the
  control at each firing: Galaxies' `soleOwner` stated by the arrows fired
  where the drag rang two dots.
- **A board-kept definition is made again for every board a generator
  tries**: 17% of a 15×15 Galaxies deal (`keep-board-definitions-across-boards`).
- **A rung that is rare in the ladder's order may need a wider census**
  than the hint's walk: Galaxies' `enclosed` fires 72 times in 180 hint
  walks and in no solve of the census' first twelve boards.

## Figures to re-check

Measured 2026-11-07 on `describe-galaxies`' commit, `solver.ts` then
`hint.ts` lines: Path 786 and 232, Pearl 820 and 503, Tracks 1,117 and
434, Spokes 797 and none, Bridges 1,011 and 389, Net 435 and 316, Tents
866 and 447, Loopy 1,773 and 893. Re-measure before designing against
them, and record the HEAD baseline at the session's start.
