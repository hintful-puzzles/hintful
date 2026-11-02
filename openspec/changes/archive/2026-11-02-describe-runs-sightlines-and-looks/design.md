# Design: a line's stretches, and a number per letter

## Sections

| Section | What it holds |
| --- | --- |
| The split | why this change takes ABCD alone |
| What Q is | `stretch`, and why it is one function |
| A clue per value | ABCD's numbers |
| A placing technique a variation adds | the diagonal strikes |
| The checker | how each is read |
| ABCD | its ladder, its hint, and the comparison with HEAD |

## The split

The proposal named five games and six constructs. Read at the start
(2026-11-02), they share little: ABCD needs Q and a clue per letter;
Magnets Q, P and tile marks; Sticks Q and L; Light Up W, Q as beams and L;
Bricks a brick-wall space and L. Each game is also a hint of 400 to 900
lines to rewire. So this change takes ABCD and the vocabulary it reads, as
step 3 split by move shape, and files the other four as
`describe-sightlines-and-looks`, which files step 8 when it is archived.

## What Q is

**One function, `stretch(L, c, S)`**: the cells of the line `L` round `c`,
in the line's order, each in the set of cells `S` with none outside it
between, and none where `S` does not hold `c`. A segment is a set of sets,
which the compiler has no sort for; a stretch is one set, named by any of
its cells, so a technique reads a line's segments by binding a cell of each:
ABCD counts a stretch of k's most letters, (k + 1) / 2, as the cells at an
even place in their stretch (`index(c, stretch(L, c, O)) mod 2 = 0`), and
needs no nested set. Sticks' segment through a cell and Light Up's beam
along a line until a wall are stretches too.

**Spelled `stretch`, not `run`**: Untangle defines `run`, and a library name
is spelled apart from every name a description defines.

## A clue per value

ABCD's number on the edge counts one letter in one line: a clue at a pair.
`per: value` declares a kind dealt at its element once for each value of the
domain, read `clue(count, L, d)`, and `per` in its meaning names the value.
`Dealt` keeps it as a `ClueList` like any other, each clue at
`perPlace(x, d)`, the element times 32 and the value, 32 being the
candidate bitmask's width, so the runtime's `clueAt` and the answer check's
loop need nothing new. ABCD's own `numbers` index (a line's n numbers in
letter order) is the same pairing in another stride, and `dealtOf` converts.

## A placing technique a variation adds

The compiled module listed every placing technique, a variation's included,
with nothing to say which variation added it, so a variation's would have
run on every board. `placing` now carries the variation the way `ladder`
does, and `describedLadder` leaves one out where the variation is off. Every
compiled module's `placing` changed shape and nothing else.

## The checker

- **`stretch`** of a line and a cell is each cell of the line in it under
  the guard that every cell from `c` to it is in `S`.
- **`index(x, S)`** of a set the marks decide counts each member before `x`
  under its guard, and is `-1` where `x` is not in it, as the compiled
  `indexOf` reads it. It read only a set whose members are known before.
- **A clue per value** is dealt at every line for every value of the domain
  of the world being checked, each present or not and its value unknown
  within its range.

ABCD's five techniques are sound at orders 3 and 4 with 3 to 5 letters, on
the plain board and with no diagonal touching, and each planted defect is
unsound (`research/technique-check/results-describe-abcd.txt`).

## ABCD

**The ladder is upstream's three techniques**, untiered: `satisfied`,
`single`, `runs`, with `placed` (and `placedDiagonal` where diagonal touching
is off) run on placing. `satisfied` reads a line holding more of a letter
than its number as a contradiction, which upstream's final classification
found: in the search, a position comes out a contradiction either way, so
the same positions are tried. `runs` fires only where the stretches hold
just as many as the line needs, as upstream's does. The generator's fill is
the marks' placing strikes, drawn in reading order from the candidates left,
in place of `placeLetter` and its cube. Unreasonable stays the engine's
`searchAnswers`, now over the compiled marks, with the same budget.

**The hint keeps its plan and words** and takes its two line rungs' firings
from the compiled `satisfied` and `runs`, run on the letters placed and the
player's notes. The walk's own single and `reach` are the description's
`single` and `placed`.

**Against HEAD, nothing a player sees moved.** Measured over 10 seeds at
every preset (110 boards, 2026-11-02): every desc is HEAD's, and every hint
walk played to the end by its first step under both readings and the
default. So no save or link stops loading. Deal times median/worst are
within noise of HEAD's (6x8 Unreasonable: 13.4/99.9 ms at HEAD, 11.5/92.5).
