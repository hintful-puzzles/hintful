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

## What was done (2026-11-07)

Split at the start: this change took **Path**, and filed the other seven as
`describe-pearl-tracks-spokes-bridges-net-tents-and-loopy`.

- **The ladder.** It is `path.description.yaml` in four rungs, compiled to
  `path.compiled.ts`:
  - Easy is `forced`.
  - Normal is `lineBreaks` and `pairBreaks`, which split HEAD's `breaks`.
  - Tricky is `weighed`.
- **Retired.** Both the hint and the generator run the compiled ladder.
  `ladderWalk` with `writes` replaces the hand-written rungs and the
  recording pass. `solver.ts` went from 786 lines to 510.
- **The hint.** It keeps the game's words. `clashOf` reads off the board
  what a Check's tried lines break, so `hint.ts` went from 232 lines to 344.
- **The language.** `through` over an inline `{e in edges where …}` walks
  from its cell alone (`throughWhere`). Galaxies' compiled module took the
  same walk, and its tests pass.
- **Soundness.** All four techniques are sound, and each plant came out
  unsound:
  - `forced`, `lineBreaks` and `pairBreaks` take seconds.
  - `weighed` took 2 minutes at each step, proved whole; its plant took
    11 s and 7 s.
  - `results-describe-path.txt` holds the verdicts.

**Compared with HEAD.** 20 seeds of each of 13 classes, 260 boards, both
modes, Easy to Unreasonable:

- **Boards and tiers.** Every board dealt is identical, so no save or link
  stops loading. Every board grades at the same tier under either ladder.
- **Hint walks.** Every walk ends the same way: solved, or refused at the
  same position on Unreasonable. `weighed` fires 263 times on both.
- **Where the walks differ.** HEAD's 1,456 `breaks` steps are now 772
  `lineBreaks` and 670 `pairBreaks`, with 6 more `forced`. Only the order
  of the steps differs.
- **The stale binding.** Grading HEAD's boards found it: `pairBreaks` first
  bound its three edges once and read them stale after it drew one, and
  called 21 of the 260 boards impossible. The soundness check judges one
  binding and passed it. The generator dropped every board it misgraded, so
  the new deals alone showed nothing.
- **The guard.** `path.test.ts` now grades three such boards. With the
  re-check removed, all three fail.

**The checker.** Its value set held only `0..top` and dropped a computed
member past it without a word. Path's first `weighed` coded each pair as a
number, and so read as unsound. A brute force over every 3×3 Pairs answer
and every subset of its marks (10,816 firings) found no wrong conclusion.
The checker now refuses such a member, with a message (`heldByTop`, over
`bounds` read off the term). `weighed` is stated over cells. `CHECK_MODEL=1`
prints the counterexample.

**Time, back to back with HEAD, the same 260 deals.**

| Class | HEAD mean | New mean | HEAD max | New max |
| --- | --- | --- | --- | --- |
| Pairs 7x7 Tricky | 181 ms | 328 ms | 404 ms | 617 ms |
| Pairs 8x12 Tricky | 157 ms | 314 ms | 575 ms | 1,355 ms |
| Pairs 10x15 Tricky | 188 ms | 278 ms | 471 ms | 653 ms |
| Pairs 7x7 Unreasonable | 70 ms | 144 ms | 176 ms | 409 ms |
| Path 6x6 Normal | 14 ms | 41 ms | 38 ms | 95 ms |
| Path 7x9 Tricky | 217 ms | 507 ms | 630 ms | 1,202 ms |
| Path 8x8 Tricky | 301 ms | 678 ms | 819 ms | 1,894 ms |

- **Speed.** A deal takes about twice as long. A profile puts 41% in
  `lineBreaks` and 28% in the inline edge walk. The worst deal is under
  2 s, and it runs in the worker.
- **Size.** The compiled code is about 15.5 KB minified and gzipped against
  HEAD's 4.6 KB of rungs.
- **What would help.** `keep-board-definitions-across-boards` is the engine
  work that would claw this back. No per-game tuning was done.

**The running app.** On a pinned 7x7 Tricky board, the hint walked to the
finish: every sentence read right, including two `weighed` steps and a
`pairBreaks` step. Each showed its tried lines thin and its numbers
outlined. A fresh 8x8 Path Tricky deal hinted cleanly, with no console
errors.

## Figures to re-check

Measured 2026-11-07 on `describe-galaxies`' commit, `solver.ts` then
`hint.ts` lines: Path 786 and 232, Pearl 820 and 503, Tracks 1,117 and
434, Spokes 797 and none, Bridges 1,011 and 389, Net 435 and 316, Tents
866 and 447, Loopy 1,773 and 893. Re-measure before designing against
them, and record the HEAD baseline at the session's start.
