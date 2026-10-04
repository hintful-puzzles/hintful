# Design

All figures below were measured 2026-10-04 on boards the solver settles: Net's
from the generator with its `finishes` gate off, Rectangles' from the generator
with its `rungsFinish` gate off.

## D1. Net: the missing deduction is the solver's dead-end count

Traced on `5x5w:19d7aaae8449d5636cad43c44` by logging every turning the solver
drops and asking `deduce.ts`, at the state where it stalled, whether it still
held that turning. The first disagreement: a dead end pointing up into a
straight, a second straight and another dead end, all in one column. The
solver bounds how many tiles lie past a side (`deadends`) and rules the turning
out because four tiles would be cut off. `sealedBy` looked only at the tiles
the known wires join plus one neighbor, and no wire in that column was known.

`sealedBy` is replaced, not joined, by a rule that is the solver's: `Reach`
bounds the tiles a wire could reach past a side, over every way the tiles it
enters can turn, and a turning is sealed when its wires together reach fewer
tiles than the grid holds. The old rule is the case where every wire on the
way is already known.

## D2. Net: which turnings a tile on the way may take

The first cut read a tile's turnings off its known sides alone. It left none of
1,510 boards unfinished, against 150 before. A wider sample then found 16 of
11,300 wrapping boards still stalled. On each, the solver had dropped a turning
of a tile on the way because it closed a loop, and the bound needed that.
`Reach` now drops those too, and the sentence says so ("however they turn
without closing a loop") when it mattered. None of 23,100 boards is left,
11,800 of them wrapping.

The solver also drops a turning of a tile on the way that it found to seal a
group of its own. `Reach` does not: saying so would nest one seal's reasoning
inside another's. So nothing proves the engine finishes every board the solver
settles, and the generator keeps its `finishes` gate. With no failure in
11,800 wrapping boards, the rate is below about one in 4,000 at 95%.

## D3. Net: what replaces the differential's `DIVERGED` entry

Nothing has to. The hint finishes upstream's board for `net-trace-4`, so the
generator returns it and the seed is back in the byte-match. The differential
now also asserts that the hint's engine finishes every fixture board, which is
the condition the byte-match holds under.

## D4. Rectangles: the solver's memory, and the one notation for it

The solver keeps each clue's placements in a list and strikes them one at a
time; a struck placement stays struck. The rungs reread the board, where the
only record is the lines. On `10x10e0.5:a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c`
the first conclusion took two rounds of strikes, and the rungs could not carry
the first round into the second.

A line carries it. The `line` rung now fires on an edge that some fit crosses
when every fit across it is out at a glance, for one of the solver's two
reasons: it takes a square another clue covers wherever it goes, or it leaves
out a square no other clue reaches. Drawing the line removes those fits for
every later step. This left 3 of 2,260 boards unfinished, against 20 before.

## D5. Rectangles: the old `line` rung is deleted

It drew a line on an edge no fit crossed. Such a line cuts no fit, and every
rung reads the lines only through the fits they cut, so it could not change
what any later step saw. That is why it had fired only on boards the rungs did
not finish: it ran when nothing useful was left. Kept beside the new rung, it
put up to eleven such lines ahead of the one that mattered.

## D6. Rectangles: what the rungs still cannot follow

On the three boards left, a placement is struck and each edge inside it is
still crossed by a live fit of some clue, so no line records the strike
(`9x9:c4c5b9c12b2h2k12e2f2_3c12a8l3d5d` stalls before its first step). Closing
that needs either a step whose reasoning runs over several unrecorded strikes,
which the hint bar rules out, or a new notation for "this square is that
clue's". Neither is taken here.

## D8. Loading asks the hint too (owner, 2026-10-04)

Put to the owner with the rates above, and decided: both games'
`finishesByDeduction` ask the hint as well as the solver. A Rectangles board
like D6's is refused at load as not deducible, about one upstream ID in 750,
instead of loading and running its hint out with no tier to excuse it. Net
refuses no board found, and would refuse one in D2's unmeasured remainder
instead of throwing on Hint.

## D7. The boards the rungs finish and the solver does not (task 0.2)

`starve` looks one fit ahead, which the solver never does, so the rungs finish
some boards the solver calls ambiguous: 1 of 400 boards built with a number at
a random square of each rectangle, with `starve` among the rungs that fired.
The generator does not deal such a board, since it asks the solver first, and
loading refuses one, since `finishesByDeduction` is the solver. So
`findMistakes` never meets a board it has no answer for. `rect.test.ts` pins
one.
