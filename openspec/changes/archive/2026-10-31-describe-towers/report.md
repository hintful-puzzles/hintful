# Report: describing Towers

Written 2026-10-30. The guide is `docs/descriptions.md`; the decisions are
`design.md`'s.

## The result

1. **Towers runs its ladder compiled from `towers.description.yaml`**, and the
   hand-written `solverEasy` and `solverHard` are gone. The description
   states three techniques: `facing` and `bounds` at Easy, and `arrangement`
   at Hard. `bounds` is upstream's two readings of a clue, the run one short
   of it (`lineFull`) and the heights too near it (`lowerBound`), as one
   technique, because the scan interleaves them clue by clue (design § 3).
2. **A player sees the same boards, grades and hints**: the two ran side by
   side and agreed in every call (§ "The comparison").
3. **Each technique is sound** against the description's rules, each plant
   unsound, and all three unsound with the clue's meaning taken away
   (§ "Soundness").
4. **The compiler gained what Keen, Mathrax and Killer need next**: a clue's
   line of sight (`slots`, `sight`, `opposite`), positions in an ordered set
   (`before`, `index`, `nth`), and fillings (`fill f of S [from cand]`), with
   a filling's `distinct` and pin kept as it is assigned and a per-cell
   question answered from one enumeration (design § 2).
5. **It is slower**: 1.3 to 1.7 times the hand-written time per deal above
   Easy, and about 2.5 times on Easy, where a deal takes under 2 ms
   (§ "Speed").

## Two fixes made on the way

**The facing pairs re-placed a placed tower.** Upstream's one-off placed the
tallest tower wherever a facing pair named it, already standing or not, and
counted that a firing; and a contradiction on one pair was undone by a
placement on a later one. The hand-written code was given both fixes before
the comparison, since the compiled `place` makes neither. Every Towers deal
and hint walk traced the same before and after, but for the internal group
number a hint step's record carries.

**A firing could place a cell twice.** Two facing pairs, a row's and a
column's, can name one cell. On the hint path a firing's facts are made after
it is found, so both placements were made and recorded. `applyFacts` now
places a cell once, as it already strikes a candidate once. A Towers test
pins it, and fails with the guard taken out.

## The comparison

Towers' solver ran both ladders on copies of every `solveTowers` call while a
switch was on, and compared what each returned, the grid, the final cube and
every hint record with its reason. The walk dealt three boards of every
preset and of the sizes the menu does not offer (3x3 Easy and Hard; 4, 5, 7
and 8 at every tier), and followed up to 300 hint steps on each. The
harness is in commit `2d2e558d` (`research/describe/compare-towers.test.ts`),
removed with the hand-written code.

| Boards | Hint steps | Solver calls compared | Differences |
| --- | --- | --- | --- |
| 93 | 6,181 | 157,845 | 0 |

The compared records covered every kind Towers makes: facing 937, lineFull
151,530, lowerBound 428,263, arrangement 742,392, besides the library's. The
walk's own steps included 17 facing, 290 lineFull, 1,103 lowerBound and
1,144 arrangement steps. It was run again, with the same result, after each
restatement that made the ladder faster (§ "Speed").

**It was seen to fail** two ways. Passing over a placed height hidden behind
the next taller one, the fix upstream's loop seems to have meant, changed
the deductions: 20,738 of 55,287 calls differed on one seed a preset.
Striking `lowerBound`'s heights shortest first changed only the order: the
same grids and cubes, and 10,096 calls' records differed.

After the hand-written code went, the Towers trace of `trace-latin.test.ts`
(every preset's deals and hint walks, each step's rung, move and words) was
byte for byte the hand-written code's. Every other Latin game traced the
same as before the change.

## Soundness

`research/technique-check/results-describe.txt`, at orders 3 and 4:

| Technique | Sound | Its plant |
| --- | --- | --- |
| facing | yes | places the tallest one cell further from the clue: unsound |
| bounds | yes | strikes a height from one cell more than the clue allows: unsound |
| arrangement | yes | keeps the fillings that show one tower more than the clue: unsound |

**The clue's meaning is what makes them sound.** With `means` replaced by
`true`, all three came out unsound at both orders. A second plant, on
`bounds`' other reading (striking one more short height from the cell
beside the clue), was caught too. Each check takes under a second.

## Speed

Generator time per deal, six seeds a preset, the second of two passes kept,
both ladders in one process through the comparison's switch
(`research/describe/speed-towers.test.ts` in commit `2d2e558d`):

| Preset | Hand-written | Compiled | Ratio |
| --- | --- | --- | --- |
| 4x4 Easy | 1.0 ms | 0.6 ms | 0.59 |
| 4x4 Hard | 2.7 ms | 3.0 ms | 1.09 |
| 4x4 Extreme | 8.7 ms | 14.8 ms | 1.70 |
| 4x4 Unreasonable | 12.9 ms | 21.7 ms | 1.68 |
| 5x5 Easy | 0.6 ms | 1.6 ms | 2.66 |
| 5x5 Hard | 1.6 ms | 2.8 ms | 1.68 |
| 5x5 Extreme | 14.7 ms | 25.3 ms | 1.71 |
| 5x5 Unreasonable | 5.4 ms | 7.8 ms | 1.43 |
| 6x6 Easy | 0.7 ms | 1.7 ms | 2.47 |
| 6x6 Hard | 7.1 ms | 9.4 ms | 1.32 |
| 6x6 Extreme | 30.5 ms | 42.8 ms | 1.40 |
| 6x6 Unreasonable | 26.4 ms | 34.3 ms | 1.30 |

The tiers are the description's names, upstream's; the menu shows them by
the collection's: Easy, Normal, Tricky, Unreasonable. The first row is the JIT warming on the
first preset run, not a gain.

**Where it went, and what came back.** The first compiled ladder was about
twice the hand-written time on every preset. A rung profile of 6x6 Extreme
put the hand-written Easy rung at 7.0 ms a deal and its Hard rung at 15.6,
against 21.2 for `facing` and `bounds` and 30.5 for `arrangement`:

- `arrangement` searched afresh for each cell and height. The projection
  (design § 2) made it one enumeration a clue: 30.5 to 19 ms.
- `bounds` read both of a clue's readings for every clue. Reading the run's
  only under `near`'s `and` (design § 3) took it from 21 to 15 ms.
- `rangeMask` looped over its range; it is now one subtraction.

**What is left**: `bounds` still reads every clue's placed heights and run
afresh on each call, where the hand-written code kept one array of
positions; and the compiled ladder makes fewer, longer calls on the solve
path, since a technique goes on through every clue after a firing. Easy is
the largest ratio and the smallest time: under 2 ms a deal.

## The app

Run in Chrome on a 5x5 Normal board, hinted step by step from empty: the
notes filled in, then the too-near strikes ("Clue 3 sees exactly 3 towers
along its line; height 5 so near it would hide too many, so the 5 must
go."), and an arrangement: "No way for clue 2 to show exactly 2 towers along
its line puts height 2 in this cell, so the 2 must go." The clue, its line
and the cell are marked, and the struck height is the one a 2 between the
1 and the 3 on that column would let the clue see too many towers past.

## What was not checked

- **Boards above 8x8**, which the menu does not offer and the walk did not
  deal.
- **A facing pair on a board where the pair's cell can no longer hold the
  tallest tower**, the contradiction the fix changed: no deal or hint walk
  reaches one, since both start from a consistent board.
