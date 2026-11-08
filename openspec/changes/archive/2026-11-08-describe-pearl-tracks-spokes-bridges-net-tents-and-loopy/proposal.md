# describe-pearl-tracks-spokes-bridges-net-tents-and-loopy

**Status: filed by `describe-lines-and-loops` (2026-11-07)**, which split at
its start and took Path. The rest of step 10 of `describe-the-whole-catalog`'s
plan (`design.md` § "The plan"). It waited for `make-descriptions-zero-cost`,
now archived (2026-11-08): a game that comes out slow is made cheaper in
the engine or the compiler as it is described, timed against the commit
before, not against its hand-written ladder (`docs/descriptions.md`
§ "What a technique compiles to"). Seven games is more than one session describes. Split at the start
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

## What was done (2026-11-08)

Split at the start: this change took **Spokes alone** and filed the other six
as `describe-bridges-loopy-net-pearl-tracks-and-tents`. Spokes and Bridges
were to share "graphs derived from the grid", but they do not:

- Spokes' links are a fixed geometry, each square joined to the eight
  around it.
- Bridges' spans are decided by the deal and hold a count of bridges.

So Bridges needs its own addition to the language.

- **The language.** `edges: king` adds the diagonals to a space's edges.
  `crossedBy(e)` is the diagonal a diagonal crosses. The runtime's edge
  tables, `through` and the kept groups walk them. A first name,
  `crossing`, shadowed Black Box's definition of that name.
- **The ladder.** `spokes.description.yaml` is compiled to
  `spokes.compiled.ts`, in five rungs:
  - Easy is `saturation`, `twoOnes` and `exhaustion`.
  - Normal is two Checks. `lineBreaks` replaces HEAD's look-ahead on a
    line, and `spareBreaks` replaces it on a rule-out, now tried from
    either end.
  - A link to a full hub, or across a drawn diagonal, counts as closed, as
    a player sees it. HEAD's "overfilled" and "crossing" breaks are gone
    with it.
- **Unreasonable.** HEAD's unbounded contradiction look-ahead is now the
  engine's search (`searchAnswers`), dealt within `DEALING_BUDGET`. The
  hint walks the ladder alone and stops where it does.
- **Retired.** `SpokesScratch`, the rungs, the recount and the look-ahead
  are gone, and so is `index.ts`' second list of rungs. `solver.ts` went
  from 797 lines to 555. The tallies the renderer reads moved to
  `render.ts`.
- **Soundness.** All five techniques are sound, and each plant came out
  unsound:
  - `lineBreaks` was proved whole in 93 s.
  - `spareBreaks` was not proved whole in its ten minutes. It held on the
    16 boards the check asked, so its verdict is `held`.
  - `results-describe-spokes.txt` holds the verdicts.

**Compared with HEAD.** Measured on 222 boards that HEAD dealt, in eight
classes: 4x4, 5x7 and 7x7, Easy and Normal, and 4x4 and 5x7 Unreasonable.

- **Tiers.** Every board grades at the same tier under either ladder.
- **Hint walks.** Every walk ends the same way. Easy and Normal walks are
  solved. Unreasonable walks stop short, and the hint refuses.
- **Where the walks differ.** They take 1% to 39% fewer steps, because no
  step crosses out a link the player sees is closed: Easy's `exhaustion`
  steps fell from 499 to 202 at 5x7. HEAD's `breaks` became `lineBreaks`
  and `spareBreaks`.
- **Boards dealt.** The same seeds deal the same boards at Easy and at 4x4.
  At 5x7, 5 of 20 Normal boards and 12 of 20 Unreasonable ones differ,
  because the strip loop asks each step of a ladder that decides
  differently. No board's verdict differs where both deal it.
- **Saves and links.** A link holds only the numbers. Every board HEAD
  dealt loads and grades as before, so nothing stops loading.

**Time, back to back with HEAD, 20 deals a preset** (`deal-compare`):

| Preset | HEAD mean | New mean | HEAD max | New max |
| --- | --- | --- | --- | --- |
| 4x4 Easy | 1.7 ms | 1.1 ms | 2.9 ms | 2.8 ms |
| 4x4 Normal | 27 ms | 16 ms | 60 ms | 38 ms |
| 4x4 Unreasonable | 531 ms | 186 ms | 2,477 ms | 833 ms |
| 5x7 Easy | 24 ms | 6.5 ms | 28 ms | 13 ms |
| 5x7 Normal | 337 ms | 128 ms | 575 ms | 223 ms |
| 5x7 Unreasonable | 3,833 ms | 1,706 ms | 8,677 ms | 4,379 ms |

- **Speed.** A deal takes 0.43 of the time overall, and a solve 0.55.
  Three statements bought it:
  - The `joined` rule binds its lines once, as `L`. Stated inside
    `through`, it walked once a pair of hubs, which was three quarters of
    an Easy deal at 6.9 times HEAD.
  - `twoOnes` binds the hub count once.
  - `shortH` counts a hub's own lines once.
- **Size.** The compiled module is 4.0 KB minified and gzipped, with
  `solver.ts` 2.7 KB, against HEAD's 2.6 KB solver.

**The running app.** On a pinned 4x4 Normal board the hint walked to
the finish ("Superb!"). Every sentence read right, including both Checks'
("Ruling this spoke out would leave the outlined 4 no spare spoke and the
outlined 5 too few spokes, so it must be a line"). The tried spoke was
highlighted and the hubs outlined, and the console showed no errors.

## Figures to re-check

Measured 2026-11-07 on `describe-lines-and-loops`' commit, `solver.ts` then
`hint.ts` lines: Pearl 820 and 503, Tracks 1,117 and 434, Spokes 797 and
none, Bridges 1,011 and 389, Net 435 and 316, Tents 866 and 447, Loopy
1,773 and 893. Re-measure before designing against them, and record the
HEAD baseline at the session's start.
