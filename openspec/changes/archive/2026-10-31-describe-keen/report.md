# Report: describing Keen

Written 2026-10-31. The guide is `docs/descriptions.md`; the decisions are
`design.md`'s.

## The result

1. **Keen runs its ladder compiled from `keen.description.yaml`**, and the
   hand-written `solverCommon` and its three callers are gone. The description
   states Keen's rules, a clue kind for each sign (`sum`, `product`,
   `difference`, `quotient`) at a dealt partition of cages, and three
   techniques: `cageEasy` at Easy, `cage` at Normal and `cageLine` at Hard.
2. **A player sees the same boards, grades and hints**: the two ran side by
   side and agreed in every call (§ "The comparison"), and after the
   hand-written code went, Keen's hint trace was byte for byte its own.
3. **Each technique is sound** against the description's rules, each plant
   unsound, and all three unsound with the clues' meaning taken away
   (§ "Soundness"). The rules agree with the game on every board the answer
   check dealt.
4. **The compiler gained a dealt partition** (a region as an element, its
   cells, a clue at it), **`until`**, a tier from which a technique no
   longer runs, and three conditions a filling keeps as it is assigned: a
   pairwise one, a sum and a product bounded by their clue (design §§ 1, 3, 4).
5. **It is faster through Normal and slower from Hard**: 0.65 to 0.90 times
   the hand-written time per deal at Easy and Normal, 1.27 to 1.58 times at
   Hard and above (§ "Speed").

## Fixed on the way

**A cage-line step named one value and struck several.** One firing strikes
every value all of a cage's fillings put in a line, and the words named only
the first: "every way to fill it places a 1 in its row, so 1 and 2 must go."
They now name each: "places a 1 and a 2 in its row". The hand-written code
said the same, so the trace comparison could not see it; the app run did,
and the pinned hint snapshot had held it.

## The answer check

`research/describe/results-answer.txt`, three boards at each of 4, 5 and 6
and every tier: 45 boards, each with one answer by the rules and it the
game's; `status()` compared on 1,342 full boards (217 broken by clues alone)
and `findMistakes` on 270, with no disagreement. A product read as a sum was
seen.

## The comparison

Keen's solver ran both ladders on copies of every `solveKeen` call while a
switch was on, and compared what each returned, the grid, the final cube and
every hint record with its reason. The walk dealt three boards of every
preset, of 3×3 Easy and Normal, of 7×7 and 8×8 at every tier and of 5×5
multiplication-only, and followed up to 400 hint steps on each. The harness
is in commit `7a3f8142` (`research/describe/compare-keen.test.ts`), removed
with the hand-written code.

| Boards | Hint steps | Solver calls compared | Differences |
| --- | --- | --- | --- |
| 73 | 8,431 | 361,178 | 0 |

The compared records covered every kind Keen makes: cage 8,290,610,
cageLine 125,402, besides the library's. The walk's own steps included 3,736
cage and 225 cageLine steps. The generator gives up on 5×5
multiplication-only above Normal at some seeds, which the menu does not
offer; those were skipped.

**It was seen to fail** two ways. Reading the rows before the columns in
`cageLine` changed only the order: 64 of 5,965 calls on two 6×6 Hard boards
differed in their records alone. Letting `cage` put one value twice in a
line changed the deductions: 2,320 of 6,156 calls differed in their cubes,
and the planted build's trace differed from the hand-written one by 872
lines while the hand-written trace stayed as it was, which showed the switch
reached the hand-written code.

Every Latin game's trace (`trace-latin.test.ts`, 15,964 lines) is as it was
before the change, the compiler's edits to the other compiled modules
included.

## Soundness

`research/technique-check/results-describe.txt`, at orders 3 and 4:

| Technique | Sound | Its plant |
| --- | --- | --- |
| cageEasy | yes | leaves the values only the first cell takes out of the cage's: unsound |
| cage | yes | lets no value repeat in a cage, as Killer does: unsound |
| cageLine | yes | strikes from the cage's own cells in the line too: unsound |

**The clues' meaning is what makes them sound.** With every `means` replaced
by `true`, all three came out unsound at both orders.

**A cage is checked up to four cells at order 3 and three at order 4**:
every connected region to that size, each a part or not, the parts covering
every cell once. Regions of four on a 4×4 board took the checker past a 4 GB
heap after four minutes. Keen deals cages of up to six cells, so a statement
whose soundness rested on a cage's size above that would not be seen; the
three here read one cage's fillings, whatever its size. A check takes 5 to
22 s.

## Speed

Generator time per deal, twenty seeds a preset, the second of two passes
kept, both ladders in one process through the comparison's switch
(`research/describe/speed-keen.test.ts` in commit `7a3f8142`):

| Preset | Hand-written | Compiled | Ratio |
| --- | --- | --- | --- |
| 4x4 Easy | 0.3 ms | 0.2 ms | 0.82 |
| 5x5 Easy | 0.4 ms | 0.3 ms | 0.88 |
| 6x6 Easy | 3.0 ms | 2.4 ms | 0.78 |
| 6x6 Normal | 6.5 ms | 4.8 ms | 0.75 |
| 6x6 Hard | 4.6 ms | 5.8 ms | 1.27 |
| 6x6 Extreme | 34.3 ms | 53.6 ms | 1.56 |
| 6x6 Unreasonable | 7.4 ms | 11.7 ms | 1.58 |
| 9x9 Normal | 159.1 ms | 102.9 ms | 0.65 |
| 6x6 Normal, × only | 21.5 ms | 16.2 ms | 0.75 |

The tiers are the description's names, upstream's; the menu shows them by
the collection's.

**Where it goes.** Through Normal the projection answers a cage's every cell
and value from one enumeration, and the sum and product bounds prune it as
upstream's running total does. From Hard, `cageLine` enumerates a cage's
fillings once for each line and value, stopping at the first filling that
leaves the value out, where the hand-written code enumerated once a cage and
intersected by line. Stating it as the values some filling leaves out of the
line, one enumeration a line without the early stop, was slower: 2.1 to 2.7
times. What would recover it is an intersection kept by line over one
enumeration a cage, the projection's dual, which the compiler does not have.

## The app

Run in Chrome on a 4×4 Easy board, hinted from empty: after the notes, "No
way to make this cage sum to 8 puts 2 in this cell, so the 2 must go.", on
an 8+ cage of three cells in one column, which only 1, 3 and 4 make; the
cage striped, the cell outlined, the 2 struck. On two 6×6 Hard boards, a
cage-line step: "This cage must multiply to 8, and every way to fill it
places a 1 in its row, so the 1 must go.", the 8× cage three cells of a row,
so 1, 2 and 4 all stand there and the one cell beside it holding only the 1
of them loses it; the other board's step showed the wording defect fixed
above.

## What was not checked

- **Cages above three cells at order 4**, and above four at order 3, in the
  soundness check.
- **Boards above 9x9**, which the game does not deal.
