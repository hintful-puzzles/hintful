# Design

Figures were measured 2026-10-10 by calling the game's own functions on dealt
boards, and the crash and its fix were seen in the running app.

## D1. The lost deduction is candidate elimination, and the cause is a piece of a region placed away from the rest

Traced on `7x9:a24h8e45552a5255a4d8a2a4d1b544d53a444553b` by recording every
fill the solver makes from the clues and taking the first whose square the
solver, restarted from the board where the hint stalled, leaves empty. It is
the 4 in the first column of the eighth row, a `learnBitmapDeductions` fill.
The square is boxed in by a 1 and two 4s, so it cannot start a region of its
own and must be 4. The second board of the proposal loses a
`learnBitmapDeductions` fill too.

That technique brings a number back as a candidate wherever an unfinished
region of it could still reach, and it measures reach from each connected
piece by that piece's own size, walking through filled squares as well as
empty ones. The hint's grouped growth step had filled one square of the region
of 8 two columns away from the three 8s it belongs with. A piece of one square
reaches seven, the boxed-in square is six away, so 8 came back as a candidate
there and the square was no longer forced. In the solver's own order the 8s
were still a piece of three whose reach fell short.

So the technique is not monotone: a board with more correct squares can force
fewer. The solver file's header claimed the solver was confluent, and the spec
repeated it. Both are corrected.

The other three techniques do not lose a fill this way. Each one fires on
what a region can no longer do, and a region can only do less as squares are
filled. (`learnCriticalSquare` skips a square by which cell is its region's
root, which can move, but the hint's `nextRegionGroup` asks the same question
of every reachable square with no such skip.)

## D2. The hint keeps the solver's run from the clues; the technique is not made monotone

Making the technique monotone is not possible in general. To know that a lone
8 reaches no further than the region it belongs to, the solver would have to
know which region that is, and a lone square may as well be the start of a
region nobody has clued. Having reach stop at filled squares would fix the
first board and not the defect, would change which boards the generator deals,
and would cost the frozen differential its fixtures.

So `deduceHintPlan` takes the clues as well as the board. It plans as before,
from the working board, so each sentence is about the board it is shown on.
When neither the grouped growth step nor the four techniques find anything,
it takes the first fill of the solver's run from the clues whose square is
still empty.

**That step is true on the board it is shown on.** Every fill before it in the
run is already on the board, so the board is a correct superset of the one the
deduction was made on, and a sound deduction stays true when correct squares
are added: it was only the technique's estimate of reach that got worse. The
step's evidence is read again from the working board (the filled neighbors
for an elimination), so the marks are about what the player sees.

**The plan finishes every mistake-free position of a board that loads.** The
run from the clues fills every square, so while a square is empty there is a
next fill. This holds for a position the player reaches by filling squares in
their own order, which the load check, playing from the opening, never asked
about, and where the same crash was waiting.

Rejected: planning from the solver's run alone. It would finish as surely,
and would lose the grouped growth step, which is the hint's best sentence, and
would narrate squares the player has already filled around.

## D3. The load check asks the hint; the generator still asks the solver

`finishesByDeduction` is `hintAndSolveFinish`, the default, and the comment
excusing the solver-alone answer goes. By D2 the two answers are the same, so
no board the generator ever dealt, or upstream's did, is refused. The shared
test costs about a quarter of a deal at every preset (D4).

One kind of board is newly refused, and it was never a puzzle: a board whose
clues leave the solver nothing to do and are not an answer, such as `3x1:222`
(one region of three 2s) or `2x1:12` (a 2 alone). `solveFilling` calls a board
solved when no square is empty, so the solver-alone check let these load, with
an error shade on them and nothing the player could change. The shared test
asks whether the board the hint ends on is solved, and it is not. No generator
writes one. Two render tests used such boards as fixtures and now build the
same frames from boards that are puzzles.

The generator keeps asking `solveFilling`. It asks once for every clue it
tries to remove, and by D2 the solver's answer is the hint's.

## D4. The census

| Preset | Boards dealt | Refused at load | Stalled before the fix, from the opening | Player positions | Stalled before, from a position | After |
| --- | --- | --- | --- | --- | --- | --- |
| 7x9 | 8,000 | 0 | 4 | 24,000 | 5 | 0 and 0 |
| 9x13 | 6,000 | 0 | 17 | 18,000 | 9 | 0 and 0 |
| 13x17 | 1,500 | 0 | 7 | 4,500 | 7 | 0 and 0 |

No step of any plan filled a square with a number other than the answer's.
The sample is what found the defect, at about one board in 350 at 9x13 and
one in 200 at 13x17, so it would have shown one left. The zero after the fix
is not what the claim rests on, which is D2.

The shared test took 1.9 ms a board at 7x9, 9.6 ms at 9x13 and 44.7 ms at
13x17, with a worst board of 274 ms, the three runs sharing the machine. A
deal took 7.8, 38 and 194 ms beside them.

A player position is a dealt board with a quarter, a half or three quarters of
its answer filled in at random. "Before the fix" is the plan with nothing to
fall back on, which is what the hint did.

The two boards of the proposal are pinned in `filling-hint.test.ts` with 80
player positions of them. With the fallback switched off, all three tests
fail.
