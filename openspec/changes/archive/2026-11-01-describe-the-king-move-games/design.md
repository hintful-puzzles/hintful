# Design: the king's-move games described

## The vocabulary

The plan named three pieces (N8, S and W as a clue kind). Measured on the
three games, only N8 is new work:

- **N8.** `adj8` was already in the compiler and the runtime; the checker
  learns it. The 3×3 block and anything wider is `within(c, r)`, the cells at
  most `r` king's moves from `c`, `c` among them, in reading order. Mosaic's
  block is `within(c, 1)` and the numbers whose blocks overlap it are
  `within(c, 2)`.
- **S** is a dealt size the grid is not measured in, which Seismic's `mode`
  already is. Star Battle's `stars` is one more such size: nothing to add.
- **W moves to step 7.** None of the three has a cell outside the answer:
  Mosaic's numbers and Clusters' dots sit on cells that are shaded or
  colored like any other. Light Up's walls are the first that need it, and
  it is designed with them.

## What each game states

### Star Battle

Its regions are dealt as a plain partition and its rows, columns and regions
are not units (`units: []`): what a technique counts in a row or a region it
counts by name. So each statement about "a row, column or region" is two
techniques, one over `lines` and one over `region` (`fullLine` and
`fullRegion`), which the hint names as one rung, as before.

- **`confined` and `banded`** each count a band of rows or columns against
  its regions both ways, the regions lying wholly inside and the regions
  reaching in. Stated as two techniques a band, the reaching reading never
  fired first: on a band of `k` lines it is the inside reading of the
  complementary band, which the ladder reaches before it. And the split
  changed which sentence a player read. So each is one technique, its `lines`
  binding choosing the reading the firing decides a square by. This is the
  shape Towers' `bounds` and `near` already use.
- **`crowded` and `starved`** restate without a `look`: a trial star rules
  out `touched(x)` or `ruled(x)`, and the technique asks whether a row,
  column or region it touches still has room, `fits(E, n)`, a `fill` of the
  open squares with no two stars touching.
- **`fits` as a sum.** `fits(S, n)` was first a count of the stars in a
  filling equal to `n`, which the compiler's filling loop cannot bound while
  it fills. Restated as a sum, `sum(x in S of f(x)) = 2|S| - n` (a star is 1
  and an empty square 2), the compiler bounds it on both sides as it fills
  (`docs/descriptions.md` § "What a technique compiles to").

The checker can check Star Battle at one star only: no board of two or
three stars has an answer at the checker's orders, 3 and 4. The
techniques read `stars` only as a number, and the deals and hint walks at
two and three stars are compared with HEAD instead (`report.md`).

### Mosaic

Upstream's four rungs are two techniques: `alone`, one number with its own
block, and `compared`, two numbers whose blocks overlap. Each yields the two
rungs the hint names (`met` and `needsAll`; `needsMore` and `sameNeed`) by its
binding, so the hint's words are unchanged. Four techniques were measured
first. They made a deal up to 22 times HEAD's time and a 50×50 hint 70
times, because each reread every number's block. As two, each block is read once a pass.

`solveCheck`, the upstream solver that gated Easy generation, is retired:
generation grades on the compiled ladder. Easy keeps upstream's shape: a
solve that records which numbers it read, so the numbers it never read are
hidden. The recording takes every firing of a pass (`CellMarks.wholePasses`),
as upstream's rounds did; a hint's recording takes one a pass, for its
order, which on a 50×50 board read the whole board again for each firing.

Two guards keep a pass from reading what cannot fire: `compared` skips a
pair with a block that has no empty square, and `alone` a number with none
to need and none to spare. A guard only removes bindings, so it cannot make
a technique unsound, and neither changes a walk: by the time `compared`
runs, `alone` has left no number a decided pair could add to. The figures
are in `report.md` § "Speed".

### Clusters

`broken` is the contradiction alone. The three readings of upstream's
single-cell rule are one technique, `refute`, bound by square, color and
neighbor. As three, the order they fired in moved the recompute-stability
test's pinned walks. `countFull` and `countShort` are the counting rung.

**The `F_ERROR` prune, re-founded.** Upstream's validator wrote an error bit
into every filled cell, and the generator's prune compared whole bytes, so
two neighboring dots of one color survived where their bits differed. The
compiled rules write nothing into the grid, so the comparison sees color and
dot alone, and two such dots always prune. That changes which boards exist,
which the plan allows (`describe-the-whole-catalog/design.md` § "Decisions
made here").

## `Game.rulesOut` from the rules: measured, declined

Star Battle's auto-cross aid crosses what a new star rules out: the squares
touching it, and the rest of a row, column or region it completes. Derived
from the rules, that is what `around`, `fullLine` and `fullRegion` conclude
after the placement and did not conclude before it.

Measured on 1,145 placements across every preset, with the aid on and off
and a wrong star now and then: with the aid on, the two agree on all 561
placements. With it off they differ, but the aid is off then, so nothing is
crossed either way. The difference with the aid on comes from one corner the
measurement cannot reach by placing stars. A player clicks a square the aid
crossed until it holds a star beside the star that crossed it. The hand rule
crosses round the new star. The compiled techniques stop at the
contradiction and conclude nothing. Keeping the behavior would need a
technique run that continues past a contradiction, which no compiled
technique has, and changing it is a change to how a control behaves, which
is the owner's to make. So the hand rule stays, with a comment saying why.
Light Up and Tents measure it again when they are described.

## Two traps the work found

- **A `let` bound before an inner binder holds the marks of that moment.**
  On the solve path a technique makes its facts as it concludes them, so a
  later binding reads marks that earlier firings changed. A value bound
  before the inner loop, mixed with a fresh read inside it, reads two
  moments. Mosaic's `compared` bound the first number's need before the loop
  over its partners, and the checker found boards it gave two answers. Bound
  after the partner, it is sound. This belongs in `docs/descriptions.md`.
- **The candidate cache cost more than it saved where nothing read it.**
  Every compiled technique refilled a per-cell candidate cache as it bound,
  read or not. The compiler now emits the cache only for a technique that
  reads `cand`.

## Decisions

- Mosaic's hint now caps its plan at 24 steps, declaring `PLAN_CAP` as nine
  other games' hints do. A cap the engine owns would serve all ten, and is
  a refactor of its own, not this step's.
- Mosaic's and Clusters' generators are otherwise unchanged; only what they
  call to grade a board is the compiled ladder.
