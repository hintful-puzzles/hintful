# make-descriptions-zero-cost

**Status: filed on the owner's word (2026-11-07). It goes next, before the
rest of step 10** (`describe-pearl-tracks-spokes-bridges-net-tents-and-loopy`
waits on it). It takes in `keep-board-definitions-across-boards`, whose
measurements are below.

## Why

The owner, on `describe-lines-and-loops`' result that Path's deals take
about twice as long: "I'm not ok with 'deals take about twice as long' — I
would prefer as much as possible that we aim to have the description layer
be a near-zero-cost-abstraction, and I'd want us to spend time to get that
right before we continue. The download size improvement would be important
too, but is secondary."

A description states a game's rules and reasoning once and is checked
sound. The compiled ladder should cost what the hand-written ladder it
replaced cost, so a game never pays for being described.

## What is measured already

- **Path** (2026-11-07, `31019ce6` against `2483da52`, back to back, the
  same 260 boards):
  - Each class's mean deal is 1.5 to 3 times HEAD's. 8x8 Path Tricky went
    from 301 ms to 678 ms (max 819 ms to 1,894 ms); 7x9 Path Tricky from
    217 ms to 507 ms.
  - A profile puts 41% of a deal in `lineBreaks` and 28% in the inline edge
    walk (`throughWhere`).
  - The full table is in the archived proposal of `describe-lines-and-loops`.
- **Rect** (2026-11-07 at `05ba50d4`, 20 deals, 6,417 boards): `allowed(q)`
  was made 183 k times and `near(c)` 1.04 M times. Together they take about
  24% of the deals' time. They are kept per board, so a generator trying
  many boards that differ in one clue makes them again for each.
  `ladderFinishes` and `searchAnswers` each build their own board from the
  same clues.
- **Galaxies** (twenty 15×15 Normal deals): `near(c)` and the `room(q)` it
  reads are 17% of a deal, made again for each board as the generator moves a
  dot.
- **Size:** Path's compiled ladder is about 15.5 KB minified and gzipped,
  against the 4.6 KB of the rungs it replaced.

## How the census is taken (2026-11-07)

The owner asked that it not be done by timing every game again against its
last hand-written commit. It is taken from three sources, none of which
needs an old worktree:

1. **The archive already holds the back-to-back timing.** Every
   `describe-*` change from `describe-group` on timed its games against the
   ladder they replaced, and recorded it in its report, design or proposal.
   What each says is in the table below. Those numbers are dated: the
   compiler has changed with every game since, so they show where a game
   stood, not where it stands.
2. **A profile at HEAD bounds what the description can cost.**
   `scripts/checks/deal-profile.test.ts` (`metrics/deal-profile.md`)
   profiles every described game's deals and hint walks in one run of
   about three minutes. It reports the share `f` of samples with a compiled
   module or the described runtime on the stack. Whatever runs outside that
   ran before too, so the description costs at most `1/(1−f) − 1`. That
   clears a game, with no A/B, wherever `f` is under 9%.
3. **The same profile names the hot runtime functions across games**, and
   those are where a compiler fix pays at every game at once.

A game is timed back to back against its hand-written commit only where all
three leave it open, and at the end, for the games a fix moved.

### What it found

- **Cleared by the profile: every planning game's deals and walks.**
  Cube, Flip, Flood, Inertia, Netslide, Numgame, Pegs, Same Game, Sixteen,
  Slide, Sokoban and Untangle deal with no described code on the stack
  (0.0%), and walk with 0 to 3% (bound ≤ 3%). Fifteen and Twiddle deal in
  1 and 7 ms, which is too little to measure. Seismic deals at 2.1%
  (bound 2%), because its generator does not run the compiled ladder.
  Guess's deal runs no described code, and its walk is 22% described
  code in 54 ms.
- **Within 10% when measured, and not refuted since:** ABCD, Black Box,
  Bricks, Clusters, Magnets, Palisade, Range, Rome, Unruly and Seismic
  (several were faster). These are re-timed only if a fix changes their
  modules materially.
- **Recorded slower than 10%, so they need fixing:**

  | Game | Recorded against the hand-written ladder | Where |
  | --- | --- | --- |
  | Slant | 3.4 to 12× | `describe-loops-and-fleets` |
  | Mines | 3.5 to 15× (deals); hints level | `describe-revealed-clues` |
  | Rect | Easy/Normal level; Patches 1.8 to 2.6×; Unreasonable 3.8 to 9× | `describe-rectangles-and-galaxies` |
  | Dominosa | 2 to 9× through Tricky | `describe-dominoes-rectangles-and-galaxies` |
  | Mosaic | 2 to 4× | `describe-the-king-move-games` |
  | Path | 2.2 to 2.9× | `describe-lines-and-loops` |
  | Star Battle | 1.5 to 2.9× | `describe-the-king-move-games` |
  | Solo | Killer 2.1 to 3.4×; no cages 0.7 to 1.4× | `describe-solo` |
  | Filling | 1.7 to 2.6× | `describe-dominoes-rectangles-galaxies-and-fills` |
  | Light Up | 1.3 to 3× | `describe-beams-and-tiles` |
  | Mathrax | 1.6 to 2.0× | `describe-mathrax` |
  | Sticks | 1.2 to 2× | `describe-sightlines-and-looks` |
  | Towers | 1.3 to 1.7× above Easy | `describe-towers` |
  | Galaxies | 1.1 to 1.8× past small Normal | `describe-galaxies` |
  | Keen | 1.27 to 1.58× from Hard; faster below | `describe-keen` |
  | Unequal | 1.38 to 1.46× | `describe-group`, `describe-salad` |
  | Boats | 10×10 1.5 to 9×; larger level | `describe-fleets` |
  | Singles | small presets 1.5 to 3×; 12×12 Easy +20% | `describe-connectivity` |
  | Adjacent | +6 to 21% | `describe-group` |
  | Separate | k8 +19 to 29% | `describe-edges-and-divisions` |
  | Map | up to +20% | `describe-on-a-graph` |
  | Salad | Number Ball Normal +19% | `describe-salad` |
  | Group | Tricky +8%, and +11 to 12% compiled-on-compiled since | `describe-group`, `describe-salad` |

- **A tiny function's self time is not a call's cost.** The profile put
  `CellMarks.value` (19 games) and `rung` (18) at 5 to 20% of a deal each.
  Both readings were wrong.
  - `rung`: profiled with `--no-turbo-inlining`, Sticks' `rung` fell from 20%
    to 6% and `value` rose from 7% to 16%. The wrapper's time was the
    technique and its reads, inlined into it.
  - `value`: the compiler now reads the grid and candidates in place
    (`marksRead` in `compile.ts`). Timed back to back on nine games
    (Boats, Path, Star Battle, Sticks, Unruly, Mosaic, Range, Filling and
    Light Up, the same boards, two rounds a side), Boats is about 9% faster
    and Filling 3%, and the rest are within noise. V8 was already inlining
    the call, so the loads it showed were the work itself.
  - The rule: a profile shows where the work is, not what it costs above
    the hand-written code. Only a timing on the same boards says that.
- **Slant, the worst game, examined on the same boards** against `611a8df6^`
  (2026-11-07):
  - A single solve is 2 to 8× the hand-written one (10×12 Hard: 0.17 ms
    against 1.33 ms), and a deal 9×. So the gap is in the solve, not in how
    often the generator calls it.
  - A solve runs about 56 rungs and makes 22 firings (`clue` alone runs 23
    times). The hand-written solver went round about as often, with three
    fused passes a round: its clue pass also did `pair` and `share`, and its
    square pass `loop` and `deadEnd`.
  - Sweeping every rung a round, rather than going back to the top after
    each firing, gave the same verdicts at the same cost. The ladder's order
    is not the multiplier.
  - The time is spread across the techniques (`clue` 22% self, `loop` 12%,
    `share` 7%, `pair` 6%, `deadEnd` 5%). Each recomputes per-point values
    (`open(k)`, `lines(k)`, the clue) that the fused pass computed once, and
    a value kept per marks is thrown away at every placement, which a solve
    makes as it goes.
  - `linked(k)` is caught up by scanning every square after each placement,
    O(cells) where the hand-written union-find was O(1). That is small at
    the menu's sizes (2 to 5%), and it is why Slant's gap grows with the
    board (12× at 30×30).
- **Hot runtime helpers by game count:** `clueAt` (4 games), `edgeOf` (3),
  `stretch` (3) and `throughWhere` (2), with Rect's kept `allowed` and
  `near`. Each is weighed by a timing on the same boards, never by its share
  of the profile.

## What Changes

- **The census above**, completed only where it leaves a game open. A walk
  is timed by the same profile.
- **Fix it in the compiler and the runtime, never per game.** The levers
  known now:
  - Board-kept values remade for every board a generator tries: keyed by
    what they read, made cheaper (a count over a rectangle as a prefix sum),
    or the board shared by its clues.
  - Inline set walks that a hand-written rung keeps incrementally.
  - What `with` inlines, and evaluates again, at every use.
- **Record each game's download size** against its hand-written rungs. A cut
  that comes cheaply comes here; the rest is `shrink-the-download`'s.

## The target

Each described game's deal time, mean and tail at its menu's sizes, within
about 10% of the hand-written ladder it replaced. A game past that is
brought to the owner with its profile and what would close the gap.

## Acceptance

- The census table for every described game, before and after.
- The boards dealt unchanged, and every soundness verdict and test unchanged.
- The guides updated with what a description must not do to stay cheap.
- An answer, brought to the owner, to how the cost stays near zero as the
  remaining games are described. A timing is not a gate on a busy machine;
  a structural rule or a cost the compiler reports may be.
