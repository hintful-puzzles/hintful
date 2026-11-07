# describe-pearl-tracks-spokes-bridges-net-tents-and-loopy

**Status: filed by `describe-lines-and-loops` (2026-11-07)**, which split at
its start and took Path. The rest of step 10 of `describe-the-whole-catalog`'s
plan (`design.md` § "The plan"). **It waits for `make-descriptions-zero-cost`**
(the owner, 2026-11-07: the description layer is to cost near nothing
before more games are described), and is timed against that change's
target. Seven games is more than one session describes. Split at the start
by what each game adds to the language, not by game alone: the graphs
derived from the grid (Spokes, Bridges), Loopy's tilings and edge marks,
Net's rotations, and the line games on the square grid (Pearl, Tracks,
Tents). Take the first group and file the rest. The last of them files step
11, `describe-the-remaining-number-games`, when it is archived.

## Why

Pearl, Tracks, Spokes, Bridges, Net, Tents and Loopy each run a hand-written
ladder, and Spokes, Net and Loopy order their rungs a second time for the
hint (the survey, `design.md` § "Edge, line and division games"). A
description states the rules and the reasoning once, and the checker proves
each technique sound.

## What Changes

- **What the line games read** in the description language, the ladder
  runtime and the checker: a graph derived from the grid (Spokes' king
  links, Bridges' spans) and Loopy's tilings, marks on the edges (Loopy's
  dlines). An answer on the edges that is a line is built (Path's).
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

## What Path learned that binds here

The lessons of step 9's changes and of `describe-lines-and-loops` (archived)
all bind here. The ones a line game meets first:

- **Grade the boards HEAD deals with the new ladder, not only the new
  deals.** A technique that binds a set once and places inside a loop over
  it reads the set stale (`docs/descriptions.md` § "A statement's order
  is behavior"). The soundness check judges one binding, and the
  generator drops what it misgrades, so only HEAD's boards showed Path's
  `pairBreaks` calling 21 of 260 inconsistent.
- **A line's piece is `through(c, {e in edges where value(e) = 1})`**,
  stated inline: it walks from `c` alone, and under `with` it is the only
  way that does not test every edge of the board (`throughWhere`).
- **A Check's words can stay the game's presentation**: Path's `clashOf`
  finds what a tried line breaks for the hint's sentence, and the hint
  throws where a Check breaks nothing, so the walks guard it.
- **`ladderWalk`'s `writes`** keys the walk's continuity on something other
  than the cells a firing wrote (Path's numbers).
- **The checker's set of numbers holds only the board's values**, and
  refuses a computed member past them (`docs/descriptions.md`). Path's
  `weighed` first coded its pairs as numbers, and the dropped members read
  as unsound; it is stated over cells. Where a verdict surprises, run with
  `CHECK_MODEL=1` and check the counterexample against the code by brute
  force before changing the technique.

## Figures to re-check

Measured 2026-11-07 on `describe-lines-and-loops`' commit, `solver.ts` then
`hint.ts` lines: Pearl 820 and 503, Tracks 1,117 and 434, Spokes 797 and
none, Bridges 1,011 and 389, Net 435 and 316, Tents 866 and 447, Loopy
1,773 and 893. Re-measure before designing against them, and record the
HEAD baseline at the session's start.
