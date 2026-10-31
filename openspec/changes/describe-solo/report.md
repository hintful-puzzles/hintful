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
   values; and the killer grade follows the compiled ladder's steps, which
   deals a different board on about one Killer deal in a hundred.
4. **Each technique is sound** in each world Solo's variations deal, at
   orders 3 and 4, and each plant unsound (§ "Soundness").
5. **Speed**: § "Speed".

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

**Without them**, the same corpus differs in records on most killer
solves, and in TBD deals (§ "What a player meets").

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

## Soundness

TBD

## Speed

TBD

## The app

TBD

## What was not checked

TBD
