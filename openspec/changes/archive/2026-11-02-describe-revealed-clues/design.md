# Design: clues revealed during play

## Sections

| Section | What it holds |
| --- | --- |
| What X is | the vocabulary, and what turned out to need none |
| Guess | its ladder, and what moved |
| Mines | its ladder, and the generator's certificate |
| Black Box | its ladder |

## What X is

**A revealed clue is a dealt clue to everything that reads one.** The
compiler, the runtime and the checker read a clue list, and none of them
asks where it came from: a game whose clues come from play builds its
`Dealt` from its state on each hint and solve, as every other game builds it
from its board. So the "clue kind the state reveals" the proposal names has
no declaration of its own: nothing would read one (`docs/doctrine.md`,
"Declare what the engine consumes"), and the checker already covers every
layout of a kind, each clue present or not, which is every set of reveals.

What the games needed that the language lacked:

- **A clue at the board** (Guess): a clue that sits at no element, one a
  query, whose value is fields, each read as a function of the clue
  (`black(k)`) and of a cell where it is one a cell (`peg(k, s)`). It
  compiles to plain arrays in `Dealt`; its meaning reads the clue as `k`.
  The checker deals two of a kind, each present or not with every field
  unknown in its range: a technique reading one clue is checked as it reads
  any number of them, since another clue only removes answers.
- **A size the board's cells do not bound** (Mines' mine count): the
  checker reads it as one unknown, from its least to the cell count, where
  it had made each value a world of its own (`openSizes`).
- **A laser's path** (Black Box): `beam` and `ahead`, library terms over
  the engine's tracer (§ "Black Box").

## Guess

The hand-written `Rules` class stated as seven techniques, one a modifier's
(`noRepeats`, under "no duplicates"). Its order moved in two ways:

- **A variation's technique runs after its tier's**, so `noRepeats` comes
  last, where the hand ladder ran it between the one-row readings and the
  ones leaning on settled slots. Guess has one tier, and inventing a second
  to place it would give a grade nothing reads.
- **The hint takes firings in the ladder's own order**, one a pass, which
  is the hand ladder's order but for `noRepeats`. It does not walk by
  `ladderWalk`, whose rule takes the firing continuing from the last one's
  cells: a Guess plan is a few firings over one row, and over every preset,
  eight seeds each played to the end, the rule had a choice to make 6 times,
  too few for it to shape a plan or for `ladder-continuity.test.ts` to read
  (it wants 30). Walked by it, Guess failed that guard with 0 of 30 on its
  dealt boards, which show no score yet.

Against the commit before this change, six boards a preset played to the
end by the hint's first step: 17 of the 18 walks are identical, and one
makes the same moves with a `noRepeats` firing later. The boards dealt are
the same.

The probe stays the game's: choosing a guess is an information question,
not a deduction. Its enumeration judges each whole answer by the compiled
rules (`isAnswer`); its pruning of a partial one stays the game's.

## Mines

`deduce.ts` stated as five techniques: `alone` (one number's own squares),
`pair` (two numbers within reach of each other), `region` (a number nested
in another, its outer squares read as a number of their own beside a
third), `regions` (two such regions read against each other), and `count`,
the mine total read against up to five numbers that share no square,
chosen from at most ten that still touch an undecided one. A number is a
clue at a cell, and an opened square is a dealt clue to the ladder: the
hint and the certificate both rebuild `Dealt` from the opened squares after
each opening, keeping the marks, since an opening only adds a number.

**`regions` is `deduce.ts`' pairing of two regions**, which the first
statement left out: of 300 boards HEAD dealt, fifty a preset, two Expert
boards stalled for want of it, and finish with it.

**The hint takes the ladder's first firing, as `deduce.ts` did**, not
`ladderWalk`'s continuing choice. A continuing walk asks every rung for all
its firings at each step, and a Mines hint plans to the end of the board:
on Expert that took a median of 120 ms a hint and up to half a second,
against HEAD's 3–11 ms. Taking the first firing, the median is 1–5 ms and
the worst 33 ms (measured beside the soundness check). Of 60 boards HEAD
dealt, ten a preset, played to the end by the hint's first step on both
trees, 58 finish on both, the other two being the boards below that need a
wider count, in 7,197 steps against 7,213, with the firings by kind close
to HEAD's (count 15 against 17, pair 614 and 614, full 2,861 against 2,870,
satisfied 3,705 against 3,712). The walks differ in which of two ready
pairs fires first and in the order of the squares one step opens.

**`minesolve` is retired; the generator certifies on the compiled ladder.**
Measured over ten seeds a preset, deal time median / worst, against HEAD
run just before it under the same load:

| Preset | Compiled ladder | HEAD |
| --- | --- | --- |
| 9×9, 10 mines | 1 / 5 ms | 0 / 2 ms |
| 9×9, 35 | 30 / 58 ms | 2 / 10 ms |
| 16×16, 40 | 1 / 4 ms | 0 / 1 ms |
| 16×16, 99 | 105 / 350 ms | 28 / 109 ms |
| 30×16, 99 | 11 / 16 ms | 2 / 4 ms |
| 30×16, 170 | 199 / 645 ms | 45 / 186 ms |

The board is laid out at the first click, in the game's worker, so the
page stays live while it is. What it buys is one judge: a board the
generator deals is one the hint finishes, with no second solver to drift
from it. Three choices made the cost: the marks carry over an opening, a
`subsets` binder whose size is pinned counts only the subsets of that size,
and `count` bounds its numbers by the mines left before choosing among
them.

**`count` reads at most ten numbers, as upstream's search over sets did.**
`deduce.ts` read up to forty; at fifteen, the densest preset's deal took
twice as long and more (median 632 ms, worst 1.8 s, both bounds measured
beside the soundness check), for two of the 300 HEAD boards.

**Which saves and links stop loading.** A Mines board loads only where the
hint finishes it (`finishesByDeduction`), and an opened board's save or
link carries its layout. Of the 300 boards HEAD dealt, 297 finish on the
compiled ladder. Two Expert boards (30×16, 99 mines) need `count` over more
than ten numbers, so a save or link of either, once opened, no longer
loads. The third stalls under HEAD's own hint too, so it already failed to
load at HEAD: `minesolve` certified boards the hint could not finish, which
the single judge now rules out. A link not yet opened carries a seed and
no layout, so it loads and deals a different board at its first click.

## Black Box

`settle` stated as one technique, `ray`: follow a fired laser through the
squares placed to the first, `u`, that decides where it goes, and where a
ball or an empty square there would send it elsewhere, `u` holds the other.
A fired laser is a clue at its slot, the slot it came out at, or `|slots|`
where a ball absorbed it; one that came out at another slot is a clue at
both ends, which is how `settle` followed it from both. Two library terms
read it: `beam(s)`, `beam(s, c, v)` supposing a cell's content, and
`ahead(s)`.

**One physics.** The engine's `traceBeam` is the laser's path, which the
compiled `beam` runs on the marks, the game runs on its balls (`traceLaser`
is now a wrapper over it), and the checker walks to build its z3 terms,
asking it again with each cell it stops at settled each way. Before the
game's own tracer went, the two agreed on 399,206 traces over random boxes
from 2×2 to 8×8, half of them stopping at a square nothing settled.

**The layout search propagates by the ladder.** `walkLayouts`, which counts
a board's answers when it is dealt and finds a layout for the hint, ran
`settle` after each guess; it runs the compiled ladder instead, restoring
the marks on backtracking. Over ten seeds a preset, every board dealt is
the one HEAD deals, at the same cost (the largest preset's worst deal 349 ms
against 345 ms).

**The hint makes the same moves in another order.** Over six boards a
preset, played to the end by the hint's first step, every walk makes the
moves HEAD's does, in as many steps, and none is identical: the ladder
takes one firing a pass and starts each pass from the first laser, where
`settle` swept on through the rest. The firing kinds are the same, and one
pinned position moved to a board that still fires its kind.
