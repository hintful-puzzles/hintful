# Design: Flip's hint

## D1. A step teaches a technique, and the solver supplies only what the technique cannot

The proposal asked whether a step should report the solver's set or teach a
technique. It does both, and says which it is doing.

Nothing on a Flip board forces a press, because presses commute and undo
themselves. An order changes that. Work through the squares in reading order
and never return to one: a dark square whose other flippers have all been
passed can only be lit by the one that is left. That is light chasing, stated
as "the last square that flips it" so it holds on a Random board too, where
"the square below" is not the rule.

So the hint presses the solver's shortest answer in reading order, and each
step before the last is one of two kinds:

- **Last chance** (a deduction, `so`): the press is the last square in reading
  order that flips some dark square. *"Row by row, only this square can still
  light the outlined squares, so it must be pressed. It flips the striped ones
  too."* The ring is the press, the outline the dark squares it answers for,
  and the stripes every other square it flips. The player can check it against
  the diagrams.
- **From the answer** (`oneOf`): every square the press flips is flipped by a
  later square too, so the order gives no reason. The step does not say that.
  It says what the solver knows and the player can count: *"The whole board
  can be lit in 5 presses, and no fewer. One of them: press this square."*
  When the elimination has no free square it says *"There is only one way to
  light the whole board, and it takes 5 presses."* instead. With Crosses these
  are the top row.

**The last press** says so, whichever kind it would have been (`effect`):
*"Press this square: that lights the outlined squares and finishes the
board."* The outline is every dark square but the ringed one, which is every
other square the press flips (owner, on a playtest's last step: the hint
should say the move finishes the board).

On the 494 positions the pin scan walked across the six presets, 270 opened
with a last-chance step, 152 with one from the answer and 72 with a last
press.

**Why the stripes.** The first cut outlined only the dark squares the press
was the last chance for. On a 5×5 Crosses board the owner saw a ringed square
with two dark neighbors outlined and a third, just as dark and just as plainly
lit by the press, unmarked, and read it as an omission: "when highlighting
some squares, please highlight all relevant ones and not just some". The third
is not part of the reason (a later square flips it too), so it does not join
the outline, which would make "only this square can still light" false. It is
striped, and the sentence says the press flips the striped ones too. A step
therefore marks every square its press changes: the ring, the outline and the
stripes are together exactly the squares the ringed one flips, which
`flip-hint.test.ts` holds.

**Why the from-the-answer step stripes nothing.** It reasons from no square,
so there is no partial marking to complete, and its sentence is the one a
board opens with, which the count already fills.

**Why not narrate what a press lights and darkens.** It is checkable and it
teaches nothing: the diagram on the square already says it.

**Why the from-the-answer step does not explain the order's silence.** Its
first wording did: *"Whatever this square flips can still be flipped later, so
no one square decides it. A shortest answer presses it."* The owner met it as
the first hint of a playtest and found it extremely confusing. It describes
the method's bookkeeping, about squares the step does not mark, in words
("later", "decides", "answer") only the help page defines, and it is the
sentence a Crosses board opens with. The count is a fact about the board, it
falls by one with each press, and "one of them" is the relation the engine
already has words for.

**Why "must be pressed" holds.** It is conditional on the order, which the
step names in its opening words ("row by row"), since "can still" is false
without it and the hint is read before the help page is. Three words are what
the 120 characters leave once the stripes are named; the help page gives the
order in full. Within the order the claim is exact:
the squares before the ringed one are not in the plan, and no square after it
flips the outlined ones.

**Why the count holds.** The answer is the shortest, and what is left of it
after a press is the shortest for the board that press leaves (D2), so each
step's count is the fewest presses for the board the step is shown on.

## D2. Stability, checked and then argued

Both claims in the proposal hold.

- **The count is a potential.** If the chosen answer has n presses and one of
  them is pressed, the rest is an answer of n-1, and a shorter one would give
  a shorter answer to the board before. `flip-hint.test.ts` also holds the
  count to the fewest presses found by trying every set on the 3×3 boards.
- **The choice among shortest answers is stable without a tie-break.** The
  solver keeps the first shortest answer its counter over the free squares
  reaches. Pressing a square of that answer leaves the shortest answers that
  held it, each without it; the elimination reads only the matrix, so the free
  squares are the same, and the press either leaves every answer's free bits
  alone or clears the same bit in all of them. Their order is unchanged.

  A bit-string tie-break was written first to guarantee this. A plant that
  removed it left the stability walk green over 2,400 boards, and the argument
  above is why, so the tie-break was deleted and Solve presses what it always
  pressed.

## D3. Which square first

Reading order, which is the technique's order, so the question has no separate
answer.

## D4. Marks, words, gesture

Ring and outline through `engine/hint-mark.ts`, as a band inside the tile's
own edge, clear of the diagram in the middle; the tile cache keys on the
marks' sides. Stripes are the engine's hatch (`engine/hatch.ts`) in the
press's color, laid on the tile's face under the diagram, with a cache bit of
their own. The words are the player's: a square to be lit is "dark". The
state's own comments said "lit" for it and now say "dark". The gesture is one
tap, through `verbClicks`.

## D5. The refusal

A board no presses light can only be typed by hand. The hint says
`PUZZLE_NOT_REASONABLE`, since `NO_SOLUTION` is Solve's and not a hint's.
