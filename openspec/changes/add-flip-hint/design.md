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
step is one of two kinds:

- **Last chance** (a deduction, `so`): the press is the last square in reading
  order that flips some dark square. *"No later square flips the outlined dark
  square, so this square must be pressed."* The ring is the press, the outline
  the dark squares it answers for. The player can check it against the
  diagrams.
- **From the answer** (`setup`): every square the press flips is flipped by a
  later square too, so the order gives no reason. The step says that, and that
  the answer presses it: "the only answer" when the elimination has no free
  square, "a shortest answer" otherwise. With Crosses these are the top row.

On the 494 positions the pin scan walked across the six presets, 354 opened
with a last-chance step and 140 with one from the answer.

**Why not narrate what a press lights and darkens.** It is checkable and it
teaches nothing: the diagram on the square already says it.

**Why "must be pressed" holds.** It is conditional on the order, and the help
page states the order once. Within it the claim is exact: the squares before
the ringed one are not in the plan, and no square after it flips the outlined
ones.

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
marks' sides. The words are the player's: a square to be lit is "dark". The
state's own comments said "lit" for it and now say "dark". The gesture is one
tap, through `verbClicks`.

## D5. The refusal

A board no presses light can only be typed by hand. The hint says
`PUZZLE_NOT_REASONABLE`, since `NO_SOLUTION` is Solve's and not a hint's.
