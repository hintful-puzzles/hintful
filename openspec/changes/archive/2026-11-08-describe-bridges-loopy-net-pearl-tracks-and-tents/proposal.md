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

## What was done (2026-11-08)

Split at the start: this change took **Bridges alone**. Loopy, Net, and the
line games Pearl, Tracks and Tents are filed as
`describe-loopy-net-pearl-tracks-and-tents`.

**Bridges' spans are runs of edges, not a space of their own.** The answer
is a count on each edge between squares. A shape rule makes a bridge run
straight on through a square with no island. Definitions that read no marks
name a line's far island and its edges (`far`, `mid`, `run`, `end`), kept
for the board. The ladder is seven techniques, at three tiers:

- Easy: `exactSpace` and `everyNeighbor`.
- Normal: `needsThisWay` and `sealing`, plus `loop` where loops are off.
- Tricky: `tooMany` and `mustReachOut`.

`solver.ts` fell from 1,011 lines to 662, and `hint.ts` from 389 to 375.
The `G_SWEEP` flag is gone, and the live warnings are `markWarnings` in
`moves.ts`.

**A read of a line holds edge by edge.** The checker allows consistent
marks that differ along a run. So a line's count is read from both of its
end edges (`has`, `allows`), and a group is shut off only where no bridge
known drawn leaves it (`closed(G)`). Read off one edge, `exactSpace` came
out unsound in every world (`docs/descriptions.md`).

**Checked sound.** Every technique comes out sound in all eight worlds
(`maxb` 1 to 4, with loops allowed and not). `sealing` and `tooMany` are
held on sampled boards. Each technique's plant comes out unsound in some
world (`results-describe-bridges.txt`).

**Compared with HEAD**, on 200 boards HEAD dealt, 20 a preset:

- **Tiers**: the same on all 200.
- **Hint walks**: every walk ends solved, as HEAD's does. The new walks take
  1.8% fewer steps (4,077 against 4,150).
- **Boards dealt**: the same seeds deal the same boards, and every board's
  verdict at every cap matches (`deal-compare`).
- **Saves and links**: unchanged. A link holds the clues, and the generator
  and the desc format did not change, so every save and link still loads.
- **Solve** now draws only the answer's bridges, and no crosses. A board the
  player had marked with crosses shows none once solved. The hint still
  writes crosses, as its steps.

**Time, back to back with HEAD, 10 deals a preset** (`deal-compare`, ms):

| Preset | HEAD mean | New mean | HEAD max | New max |
| --- | --- | --- | --- | --- |
| 7x7 Tricky | 3.2 | 8.1 | 7.7 | 20 |
| 10x10 Tricky | 3.8 | 11 | 6.6 | 20 |
| 13x17 Normal | 11 | 27 | 51 | 136 |
| 13x17 Tricky | 14 | 40 | 41 | 120 |
| All presets | 4.0 | 11 | 51 | 136 |

Deals take 2.7 times HEAD's and solves 2.9 times. The owner accepted that
(2026-11-08): a deal under 100 ms needs no work, and a large preset may take
up to a second, unless an optimization would clearly pay across many games.

**The compiler got cheaper for every game**, while Bridges was at 23 times
HEAD:

- A definition whose value is an element is kept, so `far(c, y)` is no
  longer a ray scanned at every read.
- A technique's binders share repeated terms, as its premise and
  conclusion already did.
- A definition that reads the candidates, of one or two elements, with loops
  nesting two deep, is kept by the rung reading it until a firing
  (`rungKept`). Kept that way, a single loop over a few cells cost Mosaic's
  deals a quarter more, so a definition with one loop is not kept.
- A set stated member by member is looped over with no array made.

Bridges' compiled module fell from 437 KB to 57 KB (10 KB gzipped). Its
`solver.ts` is 6.7 KB gzipped, so the two together are 16.7 KB, against
HEAD's 10.2 KB solver.

The other 21 games whose compiled modules changed were timed against HEAD
on the same boards. Their verdicts are identical, and their deals take 0.85
(Path) to 1.08 of HEAD's time.

Only the compiled code changed, not what any description states, so their
recorded soundness verdicts stand.

**The running app.** On 7x7 Easy and 10x10 Tricky boards, the hint was
walked to a solved board, through `exactSpace`, `everyNeighbor`,
`needsThisWay` and a `tooMany` limit of at most one. Each step drew its
ringed lines and its outlined island. Auto-solve and Show solution finish
the board.
