# Design

## Context

`retire-hint-ordinals` D4 rules that a chain is fair only if every link
writes a mark the player can make; D7 kept the supposition rungs that alone
define a tier until a markable technique fills it. This design records what
each tier needs once its rung is gone (measured 2026-10-27/28, at
`0287ee68`), and what fills it.

## D1. The population (task 1.1, 2026-10-28)

Every `solver.ts` (55), the two `hint-solver.ts`, the three `deduce.ts`,
`engine/latin.ts` and `engine/answer-search.ts` were scanned by shape (a copy
of the board, a value set, then a deduction or a validator run). No
supposition rung below Unreasonable was found beyond the proposal's four and
Map's (`teach-map-chains-with-marks`). New Checks seen on the way, out of the
population: Singles' `remove-splits`, Filling's `critical-square`, Net's
`ruledOutInPlace`.

## D2. Boats' trial is a Check on one line's arrangement (task 1.3)

The trial runs only on a line that needs exactly one more water (or boat
square). Saying where that one goes says what the whole line is, so the fill
is the trial's value, not a deduction made under it. Then one
`validateFullState` call, which checks rules and propagates nothing
(`validate.ts`). So it is a Check, and leaves the population.

What it leans on that its words do not say, in 782 refutations over 200 Hard
boards: every refutation needs the filled line (9 break on the square
alone); 298 need the crossing line filled too; 162 need the corner water of
the filled boats; 168 need "the fleet's squares are used up, so every free
square is water". The sentence never says the line is filled. **Its wording
names the filled line** ("if this were the row's last water, the rest of the
row would be boats, and …").

## D3. Path: a square's lines are its value (measured)

Path's Normal and Tricky lookaheads at their first stall, over 100 boards:
the shortest walk is one Easy firing in 90 (the supposed mark forces one
square, and the board breaks). Supposing a cross on edge `e` and seeing
square `i` forced to take its other two edges is the same as placing those
two lines on `i`: the square's value is which of its edges it takes.

- **Normal: one way breaks.** A line on an edge that would break the board
  at once is crossed out; and a square that takes two more lines and has
  three edges left, two of which would break the board together, takes the
  third. One placement and the board's own clash check (a dead end, a square
  given too many lines, a loop, two numbers joined that may not meet), with
  nothing propagated. A Check.
- **Tricky: weigh every way.** The same check over every way a square could
  take its lines: what all the ways left share is drawn, and an edge none of
  them takes is crossed out. Each way is a Check against the board as it
  stands; the step cites only what is on the board.
- A cut-off check (a line that splits the board, or leaves a part without a
  number) was measured too and adds almost nothing.

Dealing, 16 boards a cell (12 at 7x9, 6 at 10x15), median / max ms, and the
median count of numbers kept:

| Cell | HEAD Normal | New Normal | HEAD Tricky | New Tricky |
| --- | --- | --- | --- | --- |
| Path 6x6 | 31 / 106, 7 | 52 / 143, 7 | 805 / 3568, 6 | 252 / 1436, 8 |
| Path 7x7 | 163 / 301, 8 | 144 / 418, 9 | 787 / 1897, 8 | 995 / 1442, 9 |
| Path 7x9 | 221 / 348, 11 | 441 / 743, 12 | 1223 / 2575, 11 | 1119 / 2853, 12 |
| Pairs 5x5 | 9 / 44, 8 | 13 / 33, 8 | 1141 / 5034, 6 | 1012 / 3115, 6 |
| Pairs 7x7 | 18 / 46, 16 | 22 / 51, 18 | 636 / 2810, 14 | 292 / 1313, 14 |
| Pairs 10x15 | 81 / 159, 46 | 419 / 748, 50 | 1416 / 2223, 48 | 3857 / 13012, 44 |

The new Tricky prototype copies the board for every shape, so the slow cells
are the cost of a naive prototype.

## D4. Spokes (measured)

Easy's rungs leave every Normal board stalled; at each stall the old trial
needs at most one propagation step. Three rules fill it, all sound on every
board measured (135 at HEAD, plus generated):

- **Seal**, two-ones generalized: a line that would join groups into one
  needing nothing, while not the whole board, is crossed out. A Check.
- **Too costly**: a line that would at once take from some hub more spokes
  than it can spare (its diagonal crosses the hub's own, or it fills a hub
  next to it) is crossed out. A Check.
- **Must keep**: a hub that can spare exactly one spoke, where keeping a set
  T of its spokes would cost another hub more than it can spare, drops one of
  T; so its spokes outside T are lines. A count over two hubs, like a naked
  pair.

Easy plus the three finishes 39/40 boards at 4x4, 37/40 at 5x7, 31/40 at
6x6 and 11/15 at 8x8; a generator gated on them keeps 45/60, 52/60, 58/60
and 13/15 of its strips, at about HEAD's dealing time.

## D5. Clusters (measured)

At 284 stalls (40 Normal boards at each of 7x7, 6x8 and 9x9) the next step
is a two-clue count in 143 (two colored squares share open neighbors, and
their counts together force cells, the Minesweeper "1-2"). The rest are case
splits on one clue's two to four open neighbors ("whichever of these is red
needs its other neighbors red, and both touch this square"). Counting
jointly over every clue solves no more boards than pairs do.

Easy plus the two-clue count finishes 12/10/10 of today's 40 Normal boards;
gated on it, the generator deals Normal in a median 7 / 4 / 15 ms. Normal
would be markedly easier than today's, whose boards are mostly the case
split.

## D6. The owner's rulings (2026-10-28)

- **Path: both are Checks.** Normal is "one way of the square breaks";
  Tricky weighs every way a square could take its lines. Both lookaheads
  retire; the tiers keep their names, so no game ID changes.
- **Spokes: "must keep" is a count, allowed.** Normal is seal, too costly
  and must keep; `contradiction-bounded` retires, and Unreasonable keeps the
  unbounded contradiction.
- **Clusters: Normal is the two-clue count.** It is easier than today's
  Normal, accepted. `lookahead-chain` retires; Clusters has no Unreasonable.

## D8. Spokes' Normal is one rung, a spoke tried each way

The three rules of D4 are one shape, as Path's are: a hub's value is which of
its spokes are lines. A spoke tried as a line, the hubs it fills taking no
more, or ruled out, a hub it leaves with no spare spoke drawing all its
others, is one value placed, and the board is read as it stands (every free
spoke of a full hub ruled out) and checked once. Too costly and seal are the
line; must keep is the rule-out. Dealing, 12 boards a cell (4 at 8x8), median
/ max, HEAD then now: Normal 4x4 64 / 111 ms → 31 / 67, 5x7 871 / 1129 →
363 / 655, 6x6 1075 / 1593 → 393 / 609, 8x8 7.6 / 9.5 s → 2.3 / 3.3 s;
Unreasonable 4x4 1.3 / 6.1 s → 0.6 / 2.0, 5x7 5.1 / 11.2 s → 4.0 / 11.3,
6x6 4.1 / 6.7 s → 3.8 / 7.5, 8x8 52 / 128 s → 17 / 22. A board dealt at Normal
before needs the old look-ahead at times, and then opens at Unreasonable,
which Spokes already has.

## D9. Clusters' Normal is the count, in two forms that go past one clue

Of a two-tile count's conclusions, only those on tile A's neighbors outside
the shared squares need tile B: what falls inside the shared squares follows
from one clue alone, which the Easy rung already decides. So the count has two
forms: `full`, where A is a dot whose last tile of its color B's count places
among the shared squares, and `short`, where B allows too few of A's color
there for what A needs. Dealing, median / max, HEAD then now (10 to 16 boards
a cell): Normal 7x7 49 / 945 ms → 55 / 217, 6x8 70 / 610 → 41 / 185, 9x9 673 /
5746 → 351 / 1900. Unreasonable is dealt by the climb Normal makes, to a board
the count stops short on, with a search of at most 200 positions a
candidate: 7x7 115 / 436 ms, 9x9 645 / 1354, 9x11 844 / 2327. Of 90 Normal
boards dealt at HEAD, 74 need the old supposition and open at Unreasonable;
the search proves each in at most 25 positions. On the menu, Unreasonable
joins Normal at 7x7, 6x8 and 9x9.

## D7. A board a player already has opens at Unreasonable (owner, 2026-10-28)

A Normal or Tricky board dealt before this change may need a lookahead the
ladder no longer has: on Path, all 100 old Tricky boards measured and 45 of
140 old Normal ones. The midend refuses a board no tier finishes, so without
a tier that searches these would stop opening from saves and links.

Offered (a) the top tier's contract also accepting a board the search proves
has one answer, (b) an Unreasonable tier, as the Latin games have, or (c)
letting them break, the owner chose **(b)**: Path and Clusters gain an
Unreasonable tier, which deals boards too. An old board opens raised to it
(the midend raises a pinned tier its board does not solve at), Solve and the
mistake check take its answer from the search (`engine/answer-search.ts`),
and the hint stops with the trial-and-error refusal a search tier gives. A
search proves each old Path board's one answer in a median of 5 positions and
at most 1,365 (265 boards, every preset at both tiers).
