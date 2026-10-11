# Design

Measured 2026-10-11 through `solver.ts` itself, the comparison first behind a
switch and then as built. What it says of the code was true that day.

## What the comparison finishes

Boards the Unreasonable tier dealt before this change: one answer, upstream's
rule stops short. "Any" compares every two numbers whose blocks overlap.
"Side" is two numbers side by side, "touching" adds the diagonal, "line" is
the same row or column at one square or two.

| Board | Boards | Side | Touching | Line | Any |
| --- | --- | --- | --- | --- | --- |
| 5x5 | 150 | 75 | 121 | 107 | 147 |
| 10x10 | 100 | 38 | 65 | 46 | 83 |
| 25x25 | 16 | 3 | 7 | 4 | 14 |
| 5x5, not aggressive | 150 | 98 | 131 | 117 | 146 |
| 10x10, not aggressive | 100 | 82 | 93 | 87 | 98 |
| 25x25, not aggressive | 30 | 26 | 29 | 27 | 29 |

The proposal's counts hold. No board the comparison finished disagreed with
the search's answer, and with the switch off the solver finished none of the
546.

## D1: The hint compares any two numbers whose blocks overlap

Side-by-side pairs alone finish under half of the 10x10 boards the whole
comparison does, so a rung held to them would leave a solver that outruns its
hint. The sentence is the same at any distance, since it speaks of the squares
one number counts and the other does not. Where several numbers would do, the
nearest is taken (`BESIDE` in `deduce.ts`): on 100 dealt 10x10 boards, 443 of
the 586 comparing steps were side by side, 85 diagonal and 58 two squares
apart.

## D2: Easy is dealt as it was, and graded by the whole deduction

There is no middle tier, and the Easy generator is untouched.

- **A wider Easy cannot be dealt here as it was in Crossing.** Aggressive
  generation hides every clue the solver can do without, so a board is dealt
  at the edge of whatever the solver knows. Hiding by both ideas, 98 of 100
  10x10 boards needed the comparison, a median of 9 times a board (40 of 40
  at 15x15, a median of 27). That is the default preset changing for every
  player. Crossing's widening touched 3 to 15 boards in 100.
- **So the comparison grades and does not deal.** `solveAtCap` at Easy is the
  whole deduction: a pasted board the comparison finishes opens as Easy, and
  the hint finishes it. The Easy deal keeps upstream's rule, and a dealt Easy
  board never needs a comparison. Unreasonable keeps only boards the whole
  deduction stops on.
- **A board saved as Unreasonable that the comparison finishes stays
  Unreasonable.** A pinned tier is kept where the board solves at it, and the
  search still proves it.
- It is the least work in the game and the choice that can be undone: a
  middle tier added later raises such boards as they load.

**For the owner to accept or turn round.** The boards between the two tiers
are no longer dealt at all: one number at a time does not finish them, and
they need no trial and error. They are the standard Fill-a-Pix difficulty, and
the case for a middle tier is stronger here than in Crossing, since it would
be a whole tier of boards and not a small share of one. It is an engine
change (below), filed as `a-middle-tier-for-the-games-that-search`.

## D3: One deduction, read by the solver and the hint

`deduce.ts` is a worklist over both ideas. `solver.ts` runs it to a stop and
`hint.ts` narrates each firing, so the contract's Easy no longer asks
`hintFinishes` as well. A number is compared only where no number decides
anything alone, so a plan on a board upstream's rule finishes is the plan it
was: the two existing render snapshots did not move.

The comparison is two rungs, because it has two conclusions and each is its
own sentence:

- `needsMore`: a number needs `k` more shaded squares than another and has
  `k` empty squares outside the other's block, which are shaded.
- `sameNeed`: two numbers need the same, and every empty square of the first
  is in the other's block, so the other's remaining squares are clear.

The second follows the first on the same pair, since shading the first's
outside squares leaves the two needing the same. Each is a Check by
`docs/games/solver-and-generator.md` § "Check, Tactic, Search": two counts,
compared.

A pair that needs more beyond the other than it has squares outside it is a
contradiction neither number shows alone. Only the search reads it, and it
changes how many positions a board takes, so it is one line that both
orientations pass through and a board pins it (`14g`).

## D4: The Unreasonable deal

- **The stop without aggressive generation is the first clue whose loss stops
  the deduction**, which is the code that was there, now asking both ideas.
  It hides a run of clues at a time and goes through a run singly only where
  the deduction stops without it, which deals the board a clue at a time
  would: 100x100 took 10 s a clue at a time and 1 to 3 s in runs of six.
- **The search starts each position from the square it assumed**, since the
  position before it was a stop. That is what holds 25x25 with aggressive
  generation at 0.65 s (1.8 s without it, 0.5 s before this change).
- **One try in eight starts from every clue.** No Easy board strips to an
  Unreasonable 3x3 or 4x3: none in five million tries, where 346 of the
  105,052 3x3 boards with an answer are one, and 31,850 of 5,429,796 at 3x4.
  A strip from every clue reaches them (213 of 4,000 draws at 3x3). Taken
  every try it would also deal half the 10x10 boards, on which the deduction
  leaves 62 squares of 100 against 41, so it is the eighth.
- **The bound stays at 900 squares.** With aggressive generation: 0.65 s at
  25x25, 1.4 s at 30x30, 2.5 s at 35x35. Without: 0.7 s at 50x50.

What a dealt board leaves the hint, median squares undecided: 9 of 9 at 3x3,
19 of 25 at 5x5, 41 of 100 at 10x10, 72 of 225 at 15x15. On 30 of 40 boards
at 3x3 and 16 of 60 at 5x5 the hint has nothing to say from the start, and on
none of 60 at 10x10. A 10x10 board has a median of 5 comparing steps before
the hint stops.

## Seen in the app

A 10x10 Unreasonable board whose first step is a comparison, followed to the
refusal: seventeen steps, ten of them comparisons, each drawn with its
squares ringed and both blocks outlined.

- Each block is outlined whole. One outline round both would show the area
  they cover and not the two squares the sentence is about.
- **A number is still named by its value and found by its block's middle.**
  With two blocks on the board and the same digit elsewhere inside them
  ("this 4" with three 4s in view), that takes a moment. A mark on the
  number's own square would settle it, and is the engine's to offer: the
  roles are ring, outline and stripes, and none is "the square this outline
  is about".

## What the engine would have had to offer

- **A middle tier for a game that searches.** `answer-search.ts` knows two
  tiers by constant: its names, its codec segment and its contract. Crossing
  and Mosaic would each have used a third, and Net is to choose. Filed as
  `a-middle-tier-for-the-games-that-search`.
- **A mark for the number an outline is about**, above.
