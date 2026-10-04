# Design: strengthen-the-sokoban-solver

## How things were measured

Positions the search generates are counted and deterministic, so they are the
figure every comparison below rests on. Times were taken on the development
machine at load 4 to 7 with 16 to 18 GB of swap in use, so each is an upper
bound; where an old and a new time are set side by side they were taken in one
run, under the same conditions.

The population is `sokobanLevel` for seeds `b0`…`b29` at each preset (levels as
generated, before the deal's check), and seeds `fresh0`…`fresh39` as a second
set nothing was tuned on.

## D1. The baseline, which was not the scaffold's

The scaffold said 7 of 20 levels at 16×20 were rejected. Counted on the 30
`b` seeds, the search finished **8 of 30** openings within `DEAL_BUDGET`
(30,000), 18 within `PLAN_BUDGET` (100,000) and 25 within 300,000. At 12×16 it
was 29, 29 and 30; at 10×12 all 30 within the deal's budget.

## D2. Where the search stalled

The scaffold named the cause as lost positions the search cannot recognize,
and corral pruning as the cure. A trace of the stalled searches said
otherwise. Both sides fall from an estimate near 90 to about 10 within the
first 20,000 positions, one expansion for each unit, and then spend 100,000
or more on the last three or four.

The position the forward side stalled on at seed `b15` has one barrel off its
target, a square away. The square the player must stand on to push it holds
a barrel already home, and that one is held by another. Seed `b22` was worked
by hand: it is not lost, and finishes in eight pushes, two of which push a
barrel off its target. So the estimate has to rise by two before it can fall,
and with sixty barrels on the board almost every push raises it by one. The
search took the positions an estimate of two higher in the order they were
made, which is every pair of pushes anywhere on the board: about 100 pushes
squared, each with 100 children.

## D3. Rank a push by its distance from what is out of place

The pushes that mend such an ending are beside the barrels and targets still
out of place. So a position's place in the frontier is twice its estimate plus
the steps (walls ignored) from the barrel just pushed to the nearest square
where the board and the finished board differ: a barrel off its target or an
empty target, going forward; a barrel off a start square or an empty start
square, going back (`SokobanBoard.farFrom`). It only orders the frontier, so
the search stays complete, and a side that runs out of positions has still
proved the board lost.

Measured on the `b` seeds, positions summed over the 30 openings, with corral
pruning (D4) and the fence check in place:

| weight of the distance against the estimate | 16×20 within 30k | within 100k | positions |
|---|---|---|---|
| none | 10 | 20 | 2,649,995 |
| 0.01 (a tie-break only) | 23 | 29 | 795,117 |
| 0.25 | 26 | 30 | 555,344 |
| 0.34 | 27 | 30 | 509,583 |
| **0.5** | **27** | **30** | **511,397** |
| 1 | 23 | 30 | 616,243 |
| 2 (capped at 4 steps) | 17 | 28 | 1,090,413 |
| 3 | 13 | 25 | 1,903,768 |

Capping the distance at 8 or 30 steps changed nothing; capping at 2 or 3 was
worse. One half is the weight kept, written as twice the estimate plus the
distance.

On the `fresh` seeds, against the committed solver in one run: 16×20 from 18
to **32 of 40** within 30,000, 28 to 38 within 100,000, and 26.2 s to 5.7 s
for the forty; 12×16 from 37 to 39 within 30,000 and 3.9 s to 0.9 s; 10×12
forty of forty either way, 0.9 s to 0.2 s.

## D4. Corral pruning

`SokobanBoard.searchPushes` is the standard PI-corral rule. Take floor the
player cannot walk to and the barrels beside it, and add any barrel that one
of those waits on. If every push those barrels could ever be given is
impossible for good (a wall, or a square no barrel comes back from), or waits
on another of them or on the player getting inside, or goes into the corral
and can be made now, then nothing done outside changes them and the first push
to touch one goes in. Take any line that finishes: its first push of one of
those barrels can be made now, and the pushes before it, which were all
outside, can be made after it in the same order, since it took nothing they
used. So only the pushes into the corral are searched. This holds only for a
corral that has to be opened: a fence barrel off its target, or (on the whole
board, where every target is filled) an empty target inside. Otherwise a line
may never touch it, and every push is searched. A corral that has to be opened
and has no push into it leaves no pushes, which is the corral deadlock the
scaffold asked for, found without a second search.

It is used only on a tight board (no pits, no spare barrels), where a square
no barrel comes back from is one no line pushes a barrel onto.

Alone it moved the baseline a little: 16×20 from 8 to 10 within 30,000. With
the ranking it does half the work: taking it out again cost 16×20
1,212,479 positions against 511,397, and 12×16 423,437 against 117,702.

## D5. The fence check, made when a position is expanded

`fenced` searches a pocket's barrels alone, and was made of every position
generated, which was half the time per position. One position in about fifty
is ever expanded, so the check moved to expansion (`Side.doomed`): 16×20 kept
its 27 and 30, and the time per position fell from 13.9 µs to 7.1 µs. Without
the check at all it was 23 and 29, so it stays.

## D6. Tried and dropped

- **Ranking positions with a target filled too soon behind the rest.** With
  the barrels on targets as walls and the rest lifted off, count the barrels
  that cannot be pushed to an empty target and the empty targets none can be
  pushed to, and rank such a position later. Alone it changed little (10 and
  20); with the distance ranking it was worse (22 and 28 against 27 and 30).
  The endings that stall depend on where the player can stand, which that
  count ignores.
- **Last in, first out among equal positions.** High variance, no gain: 12 and
  20 at 16×20, and 26 at 12×16 against 29.
- **Tunnel macros.** Of the 4,077 pushes in the lines found on the 90
  openings, 12 land in a tunnel (a wall on each side, across the push, and no
  target). Goal-room macros have nothing to act on: the generator invents each
  target where it invents its barrel, scattered over the board.
- **Incremental position keys.** A position generated at 16×20 costs about
  6 µs: the key 2.4, the estimate 2.9, the rest under 1. Most of the key is
  the walk of the player's region, which a push changes and no increment
  keeps. Building it from a preallocated buffer measured the same. What would
  cut it is not generating the position at all (D9).
- **Either side alone.** Forward alone finished 27, 30 and 24 of 30 within
  30,000 at the three presets; back alone 27, 26 and 21; together 30, 30 and
  27. Both stay.

The pairing estimate was rewritten on the way (`pairing`): it no longer packs
a goal's index into ten bits, which aliased goals on a board with more than
1,024 targets, and allocates nothing per call. It generates the same positions
in the same order.

## D7. The hint

Counting positions by what the hint spent them on, along hint-guided play:
where the plan's first push failed the potential check, the hint searched
every rival to the allowance, 200,000 positions; on one 16×20 walk that was
4.4 of 7 million.

- **It stops at the first rival that lowers the potential**, trying first the
  pushes the plan goes on to make. Any push with a shorter line serves the
  potential; the shortest was never needed.
- **Those rivals are searched to the plan's budget, not a rival's proof.** On
  the slowest requests the plan had taken about 29,000 positions and the proof
  allowed 20,000, so 175 of 180 rivals came back unsettled and the allowance
  bought nothing. The potential is defined by the plan's budget, so that is
  the budget that can find a shorter line.

Over hint-guided play on 36 boards, twelve of each preset: every walk reached
the solved board, with no position repeated and no refusal.

## D8. The budgets, and a deal that ends

Dealing forty boards of each preset, old solver and new in one run, at the
old `DEAL_BUDGET` of 30,000:

| | levels generated | mean | worst |
|---|---|---|---|
| 10×12, before | 42 | 40 ms | 304 ms |
| 10×12, after | 40 | 9 ms | 44 ms |
| 12×16, before | 48 | 114 ms | 598 ms |
| 12×16, after | 41 | 31 ms | 203 ms |
| 16×20, before | 84 | 567 ms | 1,779 ms |
| 16×20, after | 50 | 132 ms | 393 ms |

**`DEAL_BUDGET` is 20,000.** How long a dealt board's hints take follows how
long its opening took the search. Along hint-guided play at 16×20, boards
whose opening cost under 20,000 positions (six of them) averaged 25 to 120 ms
a request and at worst 0.34 s; those between 20,000 and 30,000 (four)
averaged 170 to 390 ms and at worst 0.4 to 1.1 s. Lowering the budget passes over that slower third, and costs
nothing to deal: 55 levels for forty deals against 50, a mean of 127 ms
against 132 ms. Over 200 deals at 16×20 it generated 273 levels, so it
accepts about three in four, where the old solver at 30,000 accepted about
one in two. The walks that compared the two budgets directly differed on one
board in eight, so the case rests on the opening costs above and not on them.

**`PLAN_BUDGET` stays 100,000.** It bounds the wait for one search (about
0.6 s at 16×20), which has not changed; what changed is how far it reaches:
68 of the 70 openings at 16×20 finish within it, against 46.

**A deal generates at most eight levels** (`DEAL_TRIES`) and deals the eighth
unchecked. The loop had no bound, and the app sets no upper size: at 40×40
the search finished 1 level in 85, each rejection costing about a second, so
a Custom deal there ran for minutes. Every level can be solved, being made by
playing backwards, so the recovery is to deal one; only its hint may be out of
reach. At 16×20 that is about one deal in 35,000 (0.27⁸), and most levels
passed over at 20,000 are still within `PLAN_BUDGET`. A 40×40 deal now ends
in about 8 s on this machine, which is the search's cost per position on a
board that size and is not addressed here.

The worst hint request seen along hint-guided play on dealt boards was
0.23 s at 10×12, 0.22 s at 12×16 and 0.63 s at 16×20, over three, four and
eight walks; before, over three walks of each, it was 0.14 s, 1.2 s and
1.6 s. The boards differ, since the deal does. At 10×12 the wait is the
judging of the barrel's other pushes, which this change left as it was.

## D9. What would move it further

A found line of 90 pushes on a hard 16×20 board costs about 25,000 positions,
which is the branching (some 150 pushes a side) times the depth: the search
goes nearly straight down and still generates every child of every position
on the way. The next step is to rank a push before making its position, and
make the position only when it is taken from the frontier. That changes what
a side has seen, and so where the two sides can meet, which is why it is not
part of this change.
