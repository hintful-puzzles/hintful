# enlarge-guess-answer-row

## Why

The answer row `add-guess-hint` shipped drew a small circle per color inside
one tile: filled while possible, hollow in its own color once ruled out. The
owner found it unusable on first play (2026-09-21): *"at a small preview window
the color dots are almost invisibly small … and it's almost indiscernible that
any particular color has been eliminated."*

A UX review measured why, in the running app (the board's height limits it at
Standard, so the tile is 42 px on a 390×844 phone, 27 px on a 360×640 one):

- with six colors a dot was 8 px across on the larger phone and **2 px** on the
  smaller; at ten colors a dot was all outline, a colorless speck;
- in dark mode a possible dot drew as a light ring around a color and a
  ruled-out one as a colored ring around gray — both read as rings;
- the slot's mid-gray background sat inside the pegs' lightness range, so the
  gray peg vanished on it in light mode and the brown nearly did in dark.

## What Changes

The owner's direction, with the review's refinements, and the owner's four
choices of 2026-09-21:

- **Solid blocks, no outlines**: a color still possible is a square block in a
  fixed place in its slot; a ruled-out color is **nothing at all**, as a struck
  pencil mark is in every other game. (A trace of a ruled-out color, so it could
  still be tapped, was proposed and rejected: it carries no deductive value, and
  the empty cell still answers a tap because colors never move.)
- **A dark well** under the blocks, darker than every peg color in both schemes
  (`guessAnswerWell`, with an authored dark value).
- **The row is 1.5 tiles tall.** At six colors a cell grows from 14×21 to about
  20×20 px on the phone; the pegs shrink about 5% (42 → 40 px).
- **The grid** is the one giving the largest cell: six colors 2×3, eight 2×4,
  ten 3×4.
- **The hint's target** is a thin frame in the collection's action blue, in the
  gap beside a block, never over it; the notes cursor and the evidence outline
  move to the margin round the well, where ink reads in either scheme.
- **Labels** (`L`) are drawn on the blocks too.

## Impact

`guess` spec: the answer-row requirement is replaced. Code: `render.ts`,
`palette-games.ts`. Help and `docs/games/input.md` updated.
