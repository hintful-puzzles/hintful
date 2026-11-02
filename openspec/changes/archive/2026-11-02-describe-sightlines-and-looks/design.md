# Design: a look at one supposed line

## Sections

| Section | What it holds |
| --- | --- |
| The split | why this change takes Sticks alone |
| What L is | `with place(c, d): P`, and why it is a read and not a move |
| A square outside the answer | Sticks' blocks, a value of their own |
| The checker | how `with` is read, and the plant that sees it |
| Sticks | its ladder, its hint, and the comparison with HEAD |
| A narrowed check dropped verdicts | the checker's run, fixed in passing |

## The split

The proposal named four games and five constructs. Read at the start
(2026-11-02), they share L alone: Sticks reads L and Q; Magnets Q, P and tile
marks; Light Up W as walls, Q as beams and L; Bricks a brick-wall space and
L. Each game is also a solver and hint of 500 to 1,500 lines to rewire. So
this change takes Sticks and L, the construct three of the four read, with W
as far as Sticks' blocks need it, and files Magnets, Light Up and Bricks as
`describe-beams-tiles-and-bricks`, which files step 8,
`describe-connectivity`, when it is archived.

## What L is

**`with place(c, d): P`**, a formula: `P` read on the marks with cell `c`
holding `d`, nothing else changed and nothing propagated. It is the
investigation's C5 (`collection.md` § "Core changes"), a Check
(`docs/solver-and-generator.md` § "Check, Tactic, Search"): one supposed
value, its consequences read off the marks as they stand.

**A read, never a move.** The compiled code does not place `d`: each read of
the marks inside `P` is `(x === c ? d : b.value(x))` and the like for
`known` and `cand`, innermost supposition first, and `P` concludes nothing.
So the description's own definitions read the supposition unchanged:
Sticks' `stick(k)`, the line through `k`, is the line it would be with `c`'s
line in place. Inside a `with` no read of `value` or `known` is moved out of
its loop (the hoisting `compile.ts`' header describes), since a moved read
would sit above the supposition.

A beam is not read under a `with`: `traceBeam` reads the marks itself, so
the compiler and the checker refuse one there rather than read it without
the supposition.

## A square outside the answer

A Sticks block holds no line. It is the answer's third value, and a clue
kind, `block`, whose meaning places it (`value(at) = 3`); the domain is read
off the clue, `{d in range(1, 3) where (d = 3) = (clue(block, c) >= 0)}`, so
a block may hold only 3 and every other square only a line. The marks start
from the domain (`domainOf`), so a block is placed before any technique
runs, and the hint never narrates one. A technique concluding the other of
two lines guards its square with `clue(block, c) < 0`: the checker's marks
may leave a block's square open, and `3 - a` of a block's 3 is no value.

Walls, trees, mirrors and holes (W) are read the same way where a later game
needs no more: a clue whose meaning is a value of its own.

## The checker

**A `with` is a stack of suppositions**, each its cell's alternatives under
their guards and its value: `cellValue`, `knownAt` and `candAt` read the
innermost first.

**An ignored supposition is invisible to an ordinary plant.** Read without
it, every `with` premise is false on consistent marks (no block has more
lines than its number), so every technique would read as vacuously sound,
and a plant that only loosens a threshold can still come out unsound on the
plain marks. Sticks' `overConnected` plant supposes the other line, `with
place(c, 3 - a)`: it is unsound only where the supposition is read. Planted
in the checker (the supposition dropped), that plant came out sound and the
test failed; restored, it is unsound.

Sticks' five techniques are sound at orders 3 and 4, and each plant
unsound (`research/technique-check/results-describe-sticks.txt`).

## Sticks

**The ladder is upstream's one technique, `sticks_try`, stated once for
each way a number breaks**: a block with all its lines (`overConnected`), a
line carrying two numbers (`twoClues`), a line too long (`tooLong`), a block
left too few sides (`starved`), a line left too little room (`unreachable`).
Each is bound by its number and concludes, for every blank square whose
supposed line would break it, the other line: one firing is one number's
argument, which is the grouping the hint made by hand. Each folds the same
break on the marks as they stand into its conclusion, so a broken position
is a contradiction, as upstream's validator found it, and the search tries
the same positions. `twoClues` comes before `tooLong`: a line joining two
numbers is usually too long for each, and upstream's validator named the
join, so the hint says what it said.

`unreachable`'s `reach(k)` is upstream's `sticks_max_size_*` without its
`x > 1` look-behind quirk: the squares of `k`'s line that are no block, hold
no line the other way, and would carry no number but `k`'s. The quirk was
kept only so the generator's power matched upstream's byte for byte, and
the boards match without it. The live error overlay stays the game's own
(`descriptions.md` § "The answer check") and reads room as `reach` does: a
square in the second column or row no longer counts as room where the edge
square beyond it holds another number's line, so a number left short by that
goes red, where upstream's overlay left it black.

**What retires**: `sticksValidate` as the deduction oracle, `sticksTry`,
`sticksSolveGame`, the hint's parallel `sticksFirings` and its classifier,
and the `findingTechniques` and `singleFirings` it ran on. The hint walks
the compiled firings with `ladderWalk`; its words, `hint-text.ts`, are as
they were. The generator gates its fill and its strip on the ladder, and
Unreasonable is the engine's `searchAnswers` over the compiled marks, with
the same budget and the same square and line order assumed. `status` is the
compiled answer check.

**Against HEAD.** Measured on every preset at 40 seeds (240 boards,
2026-11-02, HEAD `6adf5f50` in a scratchpad worktree, back to back with
this change): every desc is HEAD's, and every hint walk, played to the end
by its first step, makes the same moves in the same number of steps (8,374)
and ends as HEAD's: solved at Easy, and at Unreasonable the refusal at the
same point. The order moved: 231 of the 8,374 squares are decided by
another rule than HEAD's, because the walk reaches them from another
position, and 233 of 240 walks take their steps in another order, as the
plan's decision on hint order allows. The rules fire in HEAD's proportions
(unreachable 3,422 against 3,505, tooLong 2,184 against 2,170,
overConnected 1,139 against 1,125, starved 1,022 against 998, twoClues 607
against 576). The frozen upstream differential still matches byte for byte.
So no save or link stops loading.

**Deals cost more**, the ladder rereading a line for each square it
supposes where the validator kept a dsf: median and worst, in ms,

| Preset | Easy, HEAD | Easy, now | Unreasonable, HEAD | Unreasonable, now |
| --- | --- | --- | --- | --- |
| 5×5 | 3.0 / 7.0 | 5.8 / 16.8 | 15.7 / 71.8 | 32.4 / 144.6 |
| 7×7 | 33.9 / 52.9 | 52.9 / 72.8 | 92.7 / 507.7 | 156.4 / 764.6 |
| 8×10 | 187.8 / 493.8 | 220.0 / 670.8 | 511.9 / 2,559 | 633.3 / 2,617 |

The worst deal, 8×10 Unreasonable, is within 3% of HEAD's, and every
other stays under a second, so no work goes into speed here.

## A narrowed check dropped verdicts

`CHECK_TECHNIQUES` without `CHECK_GAMES` checked the techniques it named and
then wrote `soundness.json` with only their verdicts and the dead-end
checker's, dropping 75 others, and wrote its results over
`results-describe.txt`. The guide says a narrowed run keeps the others' and
writes its own results file; it now does both.
