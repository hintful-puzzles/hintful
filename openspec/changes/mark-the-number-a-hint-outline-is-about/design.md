# Design

Measured 2026-10-11. What it says of the code was true that day.

## The count

**Which games name a clue and mark only its area.** What a reference paints
is its renderer's business, so the count read the frame: every outline or
stripes reference that names one unit was narrowed out of its step's words,
and the paint that went with it measured
(`scripts/checks/hint-area-names.test.ts`, which this change keeps as an
advisory report). Every hinted game, every preset the gate offers, two deals
of each, 80 steps a board: 22,842 references walked, 17,268 naming one unit,
and 40 kinds of reference in 31 games painting wider than a tile and a half.

Read row by row, 39 of the 40 name the area itself: "this row", "this cage",
"the striped region of 3", "the striped run". The area is what the words
point at, and nothing is to be found inside it. One names a number: Mosaic's
block, on all 289 of its references.

The games that do name a clue beside an area already mark the clue's square.
Mines, Light Up, Slant and Tents outline it. Range, whose line of sight is the
area, redraws the digit in the action color and stripes the run as a
reference of its own.

**How often the name is ambiguous by value.** On the board the draft cites,
followed to the refusal: 17 steps name 28 numbers, and 14 of the 28 have the
same digit elsewhere in their own block. That is one board. Seven of the 28
sat on a shaded piece, four were themselves ringed, and two carried the
corner cross, which is what the mark had to be drawn against.

**Same value, both named.** Forty dealt 10x10 Unreasonable boards gave 13
comparing steps whose two numbers are equal.

## D1: No new role; the clue's own square carries the reference's glyph

The draft's question was whether the engine gains a role. A role is a
meaning, and "the number this area is about" is not a fourth one: the number
is what the step reasons from, which is the outline role, and the roles say
nothing of where a glyph goes. One game of the collection had the shape, so a
role, a legend entry and a word for it in every sentence would have been
machinery for Mosaic alone.

What the collection was missing is the rule, and it is now in the guide
(`docs/games/hints.md` § "A clue named with its area is marked on its own
square") and in `engine-hints`. The report keeps the count runnable, since a
hand-kept list of which games draw areas would rot.

## D2: A circle, inside the square

The draft offered a second outline on the clue's square, a heavier side, a
dot. Tried in the app on the cited board:

- **A second outline on the border cannot be the mark.** A number's own
  square is one of its block's nine, so the step can ring it, and the ring
  owns the border: four of the 28 above. A mark that disappears in exactly
  that case is no mark.
- **An inset square** survives the ring and puts a third nested square shape
  among the blocks' outlines and the rings.
- **A circle** survives the ring, and its shape says "the number" where a
  square says "a square". Inertia already circles what its words call
  outlined, so the collection has the glyph.

The circle is the block reference's second glyph, with no reference of its
own. The binding check then holds the two together, and no sentence has to
grow a clause to name the circle apart from the block.

**On the shaded piece the circle is the number's ink, white.** The evidence
color against the piece is a difference of hue with little of lightness, and
the first cut was hard to see there in the light scheme. The mark is its
shape; the legend and the sentences name no color.

**The radius is a third of the tile.** It clears the digit, stays inside the
piece, and at 0.36 it ran into the corner cross a ruled-out square with a
number carries. At a third the two still touch at the cross's inner tip, and
both read.

## D3: Two numbers of one value are named by position, by the engine

A circle on each of two 7s still leaves "this 7" and "the other 7" unplaced.
Mines names "the upper outlined 1" and "the lower outlined 1" from a private
function. Mosaic is the second game to want it, so it moved to
`engine/apart-by-position.ts` and both use it. Mines' sentences are unchanged,
and its left and right, which no Mines test pinned, are now pinned in the
helper's own test.

Mosaic's two sentences then open "The upper 7" where they opened "This 7",
through `mark.as`, since "this upper 7" reads as one of several upper ones.

## What was looked at in the app

The cited board, hint by hint to the refusal, in the light scheme and the
dark: a number circled in an outline with its twin beside it (step 1), two
numbers circled among five 4s and 5s (step 6), a circled number that is also
ringed (step 7), one carrying the corner cross (step 8), one on the piece
(steps 2 and 11), and "The left 7 still needs 2 more purple squares than the
right 7" over two circled 7s on pieces (step 12).

## What the engine would have had to offer

Nothing further. The words for two things of one name are now the engine's.
A guard that fails a game for naming a clue under an area alone would need to
know which square of a painted area is the clue's, which only the game knows;
the report reads every such reference out instead.
