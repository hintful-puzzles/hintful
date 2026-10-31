# Report: describing Mathrax

Written 2026-10-31. The guide is `docs/descriptions.md`; the decisions are
`design.md`'s.

## The result

1. **Mathrax runs its ladder compiled from `mathrax.description.yaml`**, and
   the hand-written `applyOptions`, its three callers and the `BIT(d)`
   mirror of the cube are gone. The description states Mathrax's rules, a
   clue kind for each sign (`sum`, `difference`, `product`, `quotient`; `=`
   a difference of 0) and `parity` for E and O, each at a corner, and three
   techniques: `clueEasy` at Easy, `clue` at Normal and `clueTricky` at
   Tricky.
2. **A player sees the same boards, grades and hints**: the two ran side by
   side and agreed in every call (§ "The comparison"), and after the
   hand-written code went, Mathrax's hint trace was byte for byte its own.
3. **Each technique is sound** against the description's rules at orders 3
   and 4, and each plant unsound (§ "Soundness"), with one reading checked
   on no board there: a quotient. The rules agree with the game on every
   board the answer check dealt, every clue kind among them.
4. **The compiler gained a grid's corners** (`corners`, `cells(k)`,
   `corners(c)`, `across(k, c)`, a clue at a corner), and **a moved term's
   own reads are shared**, which every Latin game's code now does with its
   trace unchanged (design §§ 1, 4).
5. **It is 1.6 to 2.0 times the hand-written time per deal** (§ "Speed").
6. **Two checks now say what they looked at**: the answer check counts the
   clues of each kind its boards deal and fails on a kind none deals, and
   the soundness check names each clue kind no board of an order can hold.

## The answer check

`research/describe/results-answer.txt`: three boards at each of 4, 5 and 6,
every tier, with every kind allowed, with only a quotient and a parity, and
with only equality and a parity. 96 boards, each with one answer by the
rules and it the game's; `status()` agreed on 2,699 full boards (299 broken
by clues alone) and `findMistakes` on 576. Four params are not dealt: the
generator gives up on a 4x4 quotient-and-parity board above Easy, and on
4x4 Unreasonable with equality and parity.

The restricted boards are there because the first run dealt none: with
every kind allowed, twelve 5x5 deals held 27 sums, 28 differences, 4
products and no quotient or parity at all, since the generator's cascade
tries every arithmetic kind before a parity, and a quotient needs two
disjoint pairs of one ratio. The planted defect, E read as O, went unseen
on those boards and is seen on these. The run now lists the clues dealt of
each kind (Mathrax: sum 65, difference 124, product 11, quotient 30, parity
26), and fails on a kind no board deals.

## The comparison

With `COMPARE.on`, every `mathraxSolve` call ran the hand-written
deductions and the compiled ladder on copies and compared what they return,
the grid, the final cube and every record
(`research/describe/compare-mathrax.test.ts` in commit `b53fb787`). Over
every preset's deals and hint walks, every size from 3 to 9 at every tier,
and at 5x5 each clue kind alone and each left out, three seeds each:

- 216 boards, 8,352 hint steps, **736,126 calls, none different**. The
  generator gives up on 5x5 boards of quotients alone above Easy.
- The hand-written records compared, by kind: `clue` by sign (+ 624,560,
  − 881,045, = 183,764, × 111,810, ÷ 81,917, E 71,213, O 176,487), `dup`
  5,133,661, `single` 3,656,491, `set` 293,362.

Both plants were caught: Normal's gate dropped (1,238 of 5,411 calls
differ, in returns, grids and cubes, on one 7x7 Normal board), and the
runtime's corner order changed to reading order (387 of 2,892 calls, in
records only, on one 6x6 Tricky board; on Easy and Normal boards one corner
does a cell's striking, so the order cannot show there).

**The trace.** `research/describe/trace-latin.test.ts`, Mathrax only, 1,910
lines: the hand-written and compiled ladders byte for byte alike, and alike
again after the hand-written code went. A planted change to the
hand-written corner order moved 107 lines, so the switch the hand-written
trace ran under was live. Every Latin game's trace (15,964 lines) was the
same before and after the compiler shared a moved term's reads.

## Soundness

`research/technique-check/results-describe.txt`. `clueEasy`, `clue` and
`clueTricky` are sound at orders 3 and 4. Each plant is unsound: the Easy
and Normal readings with the clue read against the cell's own candidates
rather than those across it, and the Tricky one with a diagonal pair read
as never equal.

**What a small board cannot hold.** The first `clueTricky` plant, a
quotient read one way only, came out sound. No 2x2 of a Latin square below
order 6 holds two disjoint pairs of one ratio, so no board the checker
builds has a quotient, and every reading of one is checked there on
nothing. The checker now says so for each kind and order:

- order 3: no difference, product, quotient or parity clue (a 3x3 Latin
  square has no intercalate, so a 2x2 in it always has one diagonal
  repeated and the other not);
- order 4: no quotient clue.

So the quotient reading rests on the answer check, which compared the
quotient's meaning with the game on 30 clues, and on the comparison, which
compared 81,917 of its firings with the hand-written code's.

## Speed

Generator time per deal, six seeds a preset, the second of two passes kept,
both ladders in one process through the comparison's switch
(`research/describe/speed-mathrax.test.ts` in commit `b53fb787`):

| Preset | Hand-written | Compiled | Ratio |
| --- | --- | --- | --- |
| 5x5 Easy | 1.1 ms | 1.7 ms | 1.61 |
| 5x5 Normal | 1.1 ms | 2.2 ms | 1.95 |
| 5x5 Tricky | 2.3 ms | 3.8 ms | 1.66 |
| 5x5 Unreasonable | 5.0 ms | 8.1 ms | 1.62 |
| 6x6 Easy | 1.8 ms | 3.7 ms | 2.04 |
| 6x6 Normal | 2.5 ms | 4.9 ms | 1.94 |
| 6x6 Tricky | 5.0 ms | 7.8 ms | 1.56 |
| 6x6 Unreasonable | 12.5 ms | 19.5 ms | 1.55 |
| 7x7 Normal | 5.2 ms | 9.7 ms | 1.88 |
| 8x8 Normal | 11.3 ms | 20.5 ms | 1.81 |
| 9x9 Normal | 25.0 ms | 43.8 ms | 1.75 |

**Where it went, and what recovered it.** Stated first with the value bound
before the corner (`{d in cand(c) where forall j in corners(c): ...}`), the
ladder took 4.4 to 6.4 times as long. A profile put a third of the time in
`clueEasy`, which runs after every step: each corner's five clue reads were
made again for every value, every corner's reads were made before the gate
that skips most cells, and a read inside a moved comparison was made again
beside the read itself. Binding the corner first and passing over a corner
that can rule nothing out, then gating with `M`'s `where`, gave 2.0 to 4.3
times. Sharing a moved term's reads in the compiler gave the table above.

What remains is the representation: a corner's clue is five clue lists, one
a sign, each read where the hand-written code read one packed number. 9x9
Normal at 44 ms a deal is not a wait a player sees.

## The app

Run in Chrome on the default 5x5 Easy board, hinted from empty to the end:
clue placements ("The 8+ clue means this cell and the 4 across it add to 8,
so this cell must be 4."), the = clue's, and singles, the clue's disc
outlined and the cell ringed. On a 6x6 Tricky board, the strikes Tricky
makes ("Nothing open across the 6+ clue adds with 6 to make 6, so the 6
must go.") and an E step, "The E clue means all four numbers around it are
even, so this cell can only be 2, 4 or 6.", with the clue's four cells
outlined.

## What was not checked

- **A quotient's reading at any order the soundness checker runs** (§
  "Soundness").
- **Boards above 9x9**, which the game does not deal.
