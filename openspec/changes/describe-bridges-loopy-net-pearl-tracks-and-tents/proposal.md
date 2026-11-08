# describe-bridges-loopy-net-pearl-tracks-and-tents

**Status: filed by `describe-pearl-tracks-spokes-bridges-net-tents-and-loopy`
(2026-11-08)**, which took Spokes alone. It is the rest of step 10 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). Six games is
more than one session describes. Split at the start by what each game adds
to the language, and take the first group:

1. Bridges' spans, a graph derived from the deal.
2. Loopy's tilings and edge marks.
3. Net's rotations.
4. The line games on the square grid: Pearl, Tracks and Tents.

File the rest. The last of them files step 11,
`describe-the-remaining-number-games`, when it is archived.

## Why

Pearl, Tracks, Bridges, Net, Tents and Loopy each run a hand-written
ladder. Net and Loopy also order their rungs a second time for the hint
(the survey, `design.md` § "Edge, line and division games"). A description
states the rules and the reasoning once, and the checker proves each
technique sound.

## What Changes

- **What the line games read** is added to the description language, the
  ladder runtime and the checker:
  - Bridges' spans. These are a graph whose edges the deal decides: an
    island links to the next island in each direction. An edge holds a
    count, 0 to 2.
  - Loopy's tilings, and marks on the edges (dlines).
  - Net's rotations.
- **Each game's ladder is stated**, with its tiers as it grades them. Its
  hand-written rungs and the hint's second order are retired. A tier past
  the ladder is dealt where the engine's search finds one answer.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's
grading, and its hand-written rungs are removed. Every technique is checked
sound, each with a planted defect that comes out unsound.

The boards dealt, their tiers and the hint walks are compared with HEAD,
and each difference is reported, with which saves or links no longer load.
Large boards are timed back to back with HEAD. The guides are updated and
the running app is checked.

## What Spokes learned that binds here

The lessons of `describe-lines-and-loops` (Path) and of
`describe-pearl-tracks-spokes-bridges-net-tents-and-loopy` (Spokes, both
archived) bind here.

- **A fixed geometry of edges is a space option.** Spokes' diagonals are
  `edges: king`, with `crossedBy(e)` for the diagonal a diagonal crosses
  (`docs/descriptions.md`). Bridges' spans are not fixed, since the deal
  decides them. Weigh a space built from the clues against stating a span
  as the run of cells between two islands.
- **A new library name must not shadow a description's definition.**
  `crossing` failed Black Box's description as a sort error, so it is
  `crossedBy`.
- **A rule's set is bound once at its top.** Spokes' `joined` stated
  `through(a, {e in edges where …})` for each pair of hubs. That walked
  once a pair, and took three quarters of an Easy deal. With the set bound
  as `L`, Easy deals took 0.28 of HEAD's time.
- **A count read inside a loop is bound ahead of it.** `N = hubs` at the
  front of `twoOnes` keeps it from being counted for every edge.
- **Several lines supposed are a definition's parameter**: `drawn(e, H)`,
  with `H` the set of edges supposed lines. Count a square's own lines
  once, then ask each edge only about the square across it. Restating
  `shortH` that way halved Spokes' Normal deals.
- **The hint stops where the ladder does.** The search beneath decides
  Unreasonable boards and contributes no step. `deduceHintPlan`'s status
  is "no hub unfinished", so a walk leaves edges that the player sees are
  closed unmarked. Spokes' walks took up to 39% fewer steps than HEAD's.
  Every walk ended the same way.

## Figures to re-check

Measured 2026-11-08 at this change's parent commit, `solver.ts` then
`hint.ts` lines:

| Game | `solver.ts` | `hint.ts` |
| --- | --- | --- |
| Pearl | 820 | 503 |
| Tracks | 1,117 | 434 |
| Bridges | 1,011 | 389 |
| Net | 435 | 316 |
| Tents | 866 | 447 |
| Loopy | 1,773 | 893 |

Re-measure before designing against them, and record the HEAD baseline at
the session's start.
