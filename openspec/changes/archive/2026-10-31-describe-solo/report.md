# Report: describing Solo

Written 2026-10-31. The guide is `docs/descriptions.md`; the decisions are
`design.md`'s.

## The result

1. **Solo runs its ladder compiled from `solo.description.yaml`**, and the
   hand-written rungs, their working state and upstream's sum tables are
   gone. The description states `boxSingle`, the six killer readings
   (`cageSingle`, `regionRule`, `cageMinMax`, `partMinMax`, `cageSums`,
   `partSums`), `intersect` and `digitSet`, and places the library's
   `hiddenSingle`, `single`, `set` and `wing`. The forcing chain stays
   Solo's (design § 6).
2. **The engine gained a Sudoku's units and a second scale**: boxes and
   diagonals as lines of the space (`sudokuSpace`), a partition as a
   function (`cage(c)`), every variation compiled, `scales` and `from`
   (design §§ 1–3).
3. **A player sees the same boards, grades and hints, but for three
   deliberate changes**, each isolated by a switch in the comparison
   (§ "The comparison"): a killer min/max step strikes only what the board
   as shown forces; a Killer board below 9×9 reads its sums over its own
   values; and the killer grade follows the compiled ladder's steps. With
   the sums, that deals a different board on 13 of 34 6×6 Killer deals, and
   on no 9×9 one (§ "What a player meets").
4. **Each technique is sound** in each world Solo's variations deal, at
   orders 3 and 4, and each plant unsound (§ "Soundness").
5. **Boards without cages deal at the hand-written speed; Killer at 2.1 to
   3.4 times it**, up to 176 ms a deal (§ "Speed").

## The comparison

With `COMPARE.on`, every solve not made inside another ran the hand-written
ladder on a copy beside the compiled one, and compared the grade on both
scales, the grid, the final cube and every record, groups numbered by first
appearance; and each params and seed was dealt by each ladder alone
(`research/describe/compare-solo.test.ts` in the change's first commit).
Over the menu's presets, and 2×2, 2×3, 3×3, 5, 6 and 9 Jigsaw, X at 2×2,
2×3, 3×3 and 7 Jigsaw, and Killer at 2×2, 2×3, 3×3, 6 Jigsaw and 3×3 with X,
each at every tier, three seeds each:

- **With six switches set** (below), 223 boards, 19,982 hint steps,
  **1,359,111 solves, none different**, and every deal the same. The
  generator gives up on 6×6 and 9×9 Killer at Extreme with either ladder.
- The hand-written records compared, by kind: `single` 19,856,011,
  `cageMinMax` 13,358,587, `cageSingle` 3,166,086, `cageSums` 1,021,830,
  `intersect` 711,277, `set` (a region's and a digit's) 279,004, `wing`
  33,141.

**The switches.** Each makes one ladder do as the other on one point, and
each is a difference the compiled ladder keeps:

| Switch | On | What it makes the same |
| --- | --- | --- |
| `readAtStart` | hand-written | a cage's min/max read against the cube as the call found it (design § 5) |
| `domainSums` | hand-written | sums over the board's values, not 1 to 9 at every size (design § 4) |
| `onePlacement` | hand-written | killer singles and the region rule stop at their first placement on the hint path (design § 5) |
| `splitParts` | hand-written | the cages' and the partial cages' readings as rungs of their own |
| `freshCages` | hand-written | the region rule reads a cell filled in its own sweep as filled |
| `oneAtATime` | compiled | a sudoku technique stops at its first firing on the solve path too |

The last three change only how much one step of a solve does. On the sudoku
scale that changes nothing, since its techniques run in tier order; on the
killer scale, whose region rule runs before the cages' readings, it changes
which killer tier a solve reaches (design § 3).

**Without them**, 433,618 of 1,360,917 solves differ, all on Killer boards,
nearly all (429,247) in records alone, and 13 deals, all 6×6 Killer
(§ "What a player meets"). The grades that differ are on the killer scale,
and on 6×6 Killer on the sudoku scale too, where the stronger sums finish a
board the hand-written reading stopped short on at the cap.

**Two plants were caught**: the intersection scanning the columns before
the rows (108 of 6,615 solves differ, in records only, on 9×9 Tricky), and
the region rule never placing in the rest of a cage (6,625 of 43,370 differ,
in grades, grids, cubes and records, and both deals, on 9×9 Killer Tricky).

**A defect the comparison found**: the first compiled ladder kept the cage
partition for the life of the cage structure, which the generator merges in
place between solves, so a solve read stale cages and deals differed. It is
built each solve.

## The hint walks

`research/describe/trace-latin.test.ts`, Solo only: every preset's deals and
hint walks, three seeds, and Killer at 2×3 and 3×3 Tricky, 3×3 Hard, 6
Jigsaw Tricky, and 3×3 with X at Easy and with Killer. With the switches
that reach a walk (`readAtStart` and `domainSums`) and those that reach a
deal set on each side, the hand-written and compiled traces are byte for
byte alike, 5,557 lines, the group numbers inside a step aside (each ladder
counts its attempts). Without them, every plain, X and Jigsaw walk is
alike, and of the 21 Killer walks 16 depart:

- **11 at a min/max step the compiled ladder splits in two.** On a 9×9
  Killer the hand-written step was "This killer cage's open cells make 8,
  which the others share, so 2, 7, 8 and 9 must go", where the 2 rested on
  a strike in the cage's other cell made in the same firing; the compiled
  step strikes 7, 8 and 9, and the 2 is the next step.
- **4 at the deal**, all 6×6 Killer: the sums over the board's values, and
  the killer grade's path, choose a different board.
- **1 at a sums step only the compiled reading makes**, on a 6 Jigsaw
  Killer: "This block's whole cages and digits leave the outlined cells 18;
  no such sum has 1 or 2", four different values from 1 to 6 making 18 only
  as 3, 4, 5 and 6, which upstream's reading, counting 7 to 9, missed.

After the hand-written ladder went, Solo's trace was byte for byte the
compiled ladder's before it.

## What a player meets

- **On every 9×9 board, plain, X, Jigsaw or Killer, the same deals**; and
  on every board but Killer the same hint walks.
- **On a Killer board, a min/max step sometimes splits in two**, each
  half resting on the notes as its step shows them.
- **On Killer below 9×9, a different board now and then, and sums hints
  the old reading missed**: 13 of the comparison's 34 6×6 Killer deals
  differ, and none of its 3 4×4 or 35 9×9 ones. The menu's Killer board is
  9×9; smaller ones are a Custom away.

## Soundness

`research/technique-check/results-describe.txt`. Solo's techniques are
checked in two worlds, Killer applied (its cages may be single cells, so
it covers the plain board) and Killer with X, at orders 3 (3×1 boxes) and 4
(2×2 boxes); no order-3 board with both diagonals has an answer, so the X
world is checked at order 4 only, and the results say so. Every technique
is sound in each world and order with an answer, and every plant is
unsound in one: a box single with two places left, a cage's last cell
given one less, the region total with its whole cages left in, a min/max
bound one too generous, sums one off, an intersection with a box it only
meets, and the single-digit set one row short.

The region rule and the partial cages' readings bind sets over every
region the board could hold, so they are the dear queries: the region rule
took 21 to 26 minutes at order 4 in each world, the whole check of Solo 54
minutes.

**What the checker could not have seen at first**: every cage shows its
total, which the description now says (`complete`), and without which the
checker dealt cages with no total and found the killer readings unsound.
The library's techniques are checked on a Latin square, as every game
places them; Solo runs them over its boxes and diagonals too, which are
units in the same sense.

## Speed

Generator time per deal, six seeds, the second of two passes kept, both
ladders in one process (`research/describe/speed-solo.test.ts` in the
change's first commit):

| Params | Hand-written | Compiled | Ratio |
| --- | --- | --- | --- |
| 6×6 Easy | 0.3 ms | 0.3 ms | 0.73 |
| 6×6 Normal | 0.8 ms | 1.1 ms | 1.44 |
| 6×6 Tricky | 126.7 ms | 146.2 ms | 1.15 |
| 9×9 Easy | 0.7 ms | 0.7 ms | 0.91 |
| 9×9 Normal | 0.9 ms | 0.9 ms | 1.04 |
| 9×9 Tricky | 13.5 ms | 14.4 ms | 1.07 |
| 9×9 Hard | 91.7 ms | 100.3 ms | 1.09 |
| 9×9 Extreme | 80.9 ms | 63.9 ms | 0.79 |
| 9×9 Unreasonable | 66.4 ms | 61.2 ms | 0.92 |
| 9×9 X Normal | 1.4 ms | 1.3 ms | 0.95 |
| 9 Jigsaw Normal | 23.8 ms | 24.6 ms | 1.04 |
| 9×9 Killer Easy | 3.7 ms | 12.8 ms | 3.43 |
| 6×6 Killer Tricky | 62.4 ms | 132.4 ms | 2.12 |
| 6 Jigsaw Killer Tricky | 78.3 ms | 175.9 ms | 2.24 |
| 9×9 Killer Tricky | 50.0 ms | 157.7 ms | 3.15 |

Every board without cages runs at the hand-written speed. Killer is two to
three and a half times slower: the region rule and both partial-cage
readings work out, for each row, column and box, which cages lie within it
and which cells it leaves, by reading every cage, where the hand-written
rule matched cages to the unit's cells once a pass. `L`'s order, cage by
cage, is what a partial cage's step records, so a statement binding the
unit's cells instead would change those records. A deal at 176 ms is not a
wait a player sees.

## The app

Run in Chrome on the census's 9×9 Killer board, hinted for 250 steps from
empty: placements from the region rule ("This block must total 45; the
cages and digits inside it account for all but 7, so this cell must be
7"), cage singles, cage sums ("No way to make … total 10 uses 5"), min/max
strikes including split ones ("This killer cage must total 12; its other
cells leave no room for 9", then "for 7 or 9"), hidden singles with the
row hatched and the cell ringed.

## What was not checked

- **Jigsaw's boxes in the soundness checker**, which builds rectangular
  ones; a box is a unit whatever its shape, and the comparison covers
  Jigsaw at 5, 6 and 9.
- **Killer above order 4 in the checker**, and cages of more than three
  cells at order 4: the killer readings rest on the comparison there.
