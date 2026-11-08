# make-descriptions-zero-cost

**Status: concluded on the owner's word (2026-11-08)**, after a last hour
on known costs: what is left is done as work passes, not as an effort of its
own, and the census against the hand-written ladders is not redone
(`tasks.md`). Filed on the owner's word (2026-11-07), and refocused by them
the same day. It goes next, before the rest of step 10**
(`describe-pearl-tracks-spokes-bridges-net-tents-and-loopy` waits on it). It
takes in `keep-board-definitions-across-boards`, whose measurements are
below.

## Why

The owner, on `describe-lines-and-loops`' result that Path's deals take
about twice as long: "I'm not ok with 'deals take about twice as long' — I
would prefer as much as possible that we aim to have the description layer
be a near-zero-cost-abstraction, and I'd want us to spend time to get that
right before we continue. The download size improvement would be important
too, but is secondary."

And on the first round of fixes, which worked on Slant: "please don't worry
too much about Slant in particular, nor even just about the existing games
in the catalog; what I want is to improve the engine and description
language/interface so that things are as easy as they can be to develop and
maintain a much larger future catalog."

So the subject is the engine and the language, and the games are the test
bed. A description written plainly, by a porter who knows no rule about
cost, should compile to code that costs about what a careful hand-written
ladder costs. When it can't, the compiler should say so at `npm run
describe`, not leave it to a timing a session may never take.

## What the work so far shows

The sections below are the record of how the census was taken and what it
found. Their lessons for the engine:

- **The gap is in what the runtime keeps, and in the code generated per
  scan; it is not in the ladder's design.** Changing the order the ladder
  runs its rungs in did not change the cost. The hand-written solvers'
  advantage was state they kept up to date at each placement (groups, and
  totals per group), and a fused pass that read each element once for
  several deductions.
- **Keeping state is an engine mechanism, not a per-game trick.** The first
  instance is in: `CellMarks` logs its placements, `linked` catches up from
  the log, and an aggregate over a group whose term reads only round its
  own point is a total kept at the group's root (`linkedAggregate`,
  `linkedSum`). Every other group builtin (`pointGroups`, `edgeGroups`,
  `joinedAcross`, `of`, regions that grow) still rebuilds or walks, and
  six described games read them.
- **The guide carries cost rules a porter must know**
  (`docs/descriptions.md` § "What a technique compiles to": bind the thing
  a firing is about, bind a whole set outside the loop, a set's size first,
  narrow a costly set by a board-kept one, let a cheap technique close what
  a costly definition would watch for). At dozens of games each is a trap.
  Where the compiler can do it, the rule goes.
- **A profile shows where the work is, never what it costs above the
  hand-written code.** Only the same boards timed both ways say that, so
  that comparison must be a tool in the tree. The one used here was a
  scratch script.

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
- **What the hand-written Slant solver kept that the compiled one did not**
  (2026-11-07, read from `611a8df6^`'s `solver.ts`):
  - A union-find of points (`connected`), joined in O(1) as each diagonal
    was filled. The compiled `linked` was a union-find too, but caught up by
    scanning every square after each placement, and its member lists were
    rebuilt for the whole board after each join.
  - Each group's `exits` and `border` at its root, merged on a join and
    decremented on a fill. The compiled `deadEnd` asked `shut(linked(k))`
    for each open square and diagonal, and each ask walked the whole group,
    recounting every point's open squares and lines.
  - Not the clue counts: the hand-written clue pass recounted `nu` and `nl`
    at every point on every pass, as the compiled `clue` does.
  - Fixed in the runtime and compiler, not in Slant: `CellMarks` logs its
    placements (`restore` starts the log again, and Black Box's search
    uses it), `linked` catches up from the log, and an aggregate over
    `linked(k)` whose term reads only round its point is a sum kept at the
    group's root (`linkedAggregate`, `linkedSum`). The same boards and
    verdicts, and solves on the same boards:

    | Slant | Before | After | Hand-written |
    | --- | --- | --- | --- |
    | 10×12 Hard | 1.33 ms | 1.30 ms | 0.17 ms |
    | 20×20 Hard | 14.2 ms | 9.4 ms | 0.93 ms |
    | 30×30 Easy | 22.1 ms | 10.8 ms | 3.91 ms |

- **What is left of Slant's gap is code, not design.** The hand-written
  solver made about 25 passes a solve at 10×12 Hard (15.8 clue, 6.0 square,
  3.4 v-shape) and the compiled one about 56 rungs. That is about 2.2×
  the scans, at about 3.4× the cost a scan. With the groups kept, the profile
  is whole-board scans (`clue` 35%, `loop` 21% at 20×20). Each compiled
  scan does what the fused hand-written pass did with less: two loops over
  a point's squares where one would count both, `slash(c, k)` computed per
  read, the clue by two lookups, a set built where only its size is read.
  These are the compiler's to close, construct by construct, each timed on
  the same boards.
- **Hot runtime helpers by game count:** `clueAt` (4 games), `edgeOf` (3),
  `stretch` (3) and `throughWhere` (2), with Rect's kept `allowed` and
  `near`. Each is weighed by a timing on the same boards, never by its share
  of the profile.

## What Changes

Everything here is in the engine, the compiler or the language; no game's
description is reworded to be cheaper.

1. **The instruments, in the tree.** A same-board comparison against any
   commit: deal a game's boards on both, check they and their verdicts
   match, and time deals and single solves, alternating the two sides. It
   is today's scratch harness made a tool, beside `deal-profile`. Every
   claim below is measured with it.
2. **Kept state as one engine mechanism.** The placement log is the
   general way to keep anything over the marks up to date: a structure
   records how far into the log it has read, catches up a placement at a
   time, and starts again from the grid when the epoch moves. Every group
   builtin moves onto it, and a total kept per group comes with any of
   them. A strike that a structure reads gets logged too, if one does. A
   definition kept per element is then made again only for the elements a
   placement could change, not for all. The read-recording tried in
   `keep-definitions-across-placements` cost more than it saved; a
   dependency the compiler derives from the statement's shape costs
   nothing to run.
3. **Code generation that does not depend on how a statement is phrased.**
   Several aggregates over one set read in one loop; a set built only to
   count it is not built; geometry builtins such as `slash`, and clue
   reads, are cheap at every read; a per-element value several techniques
   read is computed once a scan. As each of these lands, the cost rule
   in the guide that it replaces is retired.
4. **A cost the compiler reports.** `npm run describe` states each
   technique's shape: its loops, and any set that depends on the marks and
   is walked at each read, which no kept structure covers. It refuses or
   warns where a read grows with the board. This is the structural rule
   that keeps a future game cheap without anyone timing it, and the gate
   can hold it where a timing could not be.
5. **The catalog is the regression net, not the target.** The census
   tables above are the baseline; each lever is timed on the games whose
   profile names its construct, with boards and verdicts unchanged. A
   game's own description changes only where the language gains a way to
   say the same thing more plainly.

The download size stays `shrink-the-download`'s, except where a cut comes
free with a change here.

## The target

A game described plainly, without any cost rule known to its porter,
compiles to code within about 10% of a careful hand-written ladder at its
menu's sizes, and grows with the board as that ladder does. Where the
language cannot get there for some shape of statement, the compiler says so
for that shape, and the owner hears what it would take.

## Acceptance

- The same-board comparison and `deal-profile` in the tree, documented in
  the guide.
- Kept state on the placement log for every group builtin, with totals per
  group; a guard per structure, each seen failing on a planted defect.
- The code-generation levers above, each timed on the same boards against
  the commit before it, with boards, verdicts and tests unchanged.
- The compiler's cost report, and its refusal or warning for a read that
  grows with the board, in the gate.
- The guide's cost rules for porters retired where the compiler now
  covers them, and the rest stated as what the compiler reports.
- The catalog's census redone at the end, by the same tool, against the
  baseline above, with any game still past 10% brought to the owner
  together with the shape that keeps it there.
