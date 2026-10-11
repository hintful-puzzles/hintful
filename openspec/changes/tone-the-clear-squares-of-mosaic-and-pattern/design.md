# Design

Written 2026-10-11 by the session that drew the alternatives with the owner.
Nothing is built yet. What it says of the code was true that day.

## What was drawn, and what the owner chose

The same Mosaic board (`10x10du:3a21j44b5b8a4a6a5c87c45a3477a4a45d86412b4a36a4f4c554a43a5k23a44a`,
fifteen hint steps played, the sixteenth showing) and a part-solved 15x15
Pattern board, each in both schemes, through `engine/testing/svg-drawing.ts`
with a temporary switch in the two renderers. The switch was never committed.
The ids are the ones the owner and the session used.

| Id | A clear square is | Outcome |
| --- | --- | --- |
| A | today's cross, small in the corner beside a number | what the owner asked to replace |
| B | a yellow disc, the second member of the pair Unruly uses | the owner's other lean; set aside |
| C | a yellow square, the purple's shape | set aside |
| D | a pale yellow square, full cell, no piece | **chosen for both games** |
| E | flat full-cell tiles for both states, as Proverbs draws them | set aside |
| F | D with a faint cross where the square has no number | **chosen, to build** |
| G | D with a faint cross in every clear square, behind a number too | rejected on sight: the cross strikes the number through |

Why D over B, as the session put it to the owner: on D every number keeps its
ink and the hint's circled number needs no change, where B needs dark ink on
yellow, a gray for a satisfied number on yellow, and a circle redrawn to clear
the disc's edge. Why the cross in F: the pale square differs from an undecided
one by a modest step of lightness and a hue, and a cross is a cue that needs
neither. It is also the collection's mark for "ruled out", kept.

**The owner chose F for both games** on seeing it drawn (2026-10-11: "I love
it, with the faint cross"), and asked for more contrast in the dark scheme,
which is the first item below.

## What the drawing found that the build has to settle

- **The pale yellow needs a dark value of its own.** `YELLOW_WASH` through the
  dark palette comes out a muddy olive, a satisfied number's gray nearly
  vanishes on it, and the faint cross does too. Choose the dark value in the
  running app, and hold the pairs it sits beside to the palette's distance
  tests.
- **The faint cross needs a color.** The drawing used `GRAY`; it read well in
  the light scheme and was nearly lost in the dark.
- **Mosaic's hint marks were drawn over D and read as they do today**: the
  ring, the block's outline and the circled number.
- **Mosaic's completion flash** inverts shaded and clear
  (`flashing` in `mosaic/render.ts`); look at it with the pale square.
- **Pattern's part-solved board in D still reads as a picture in one color**,
  which B did not: there the picture became a field of dots.

## The rule for the engine

A game whose board is colored half and half draws the state that is not
shaded as the pale square. A game where a few squares are the answer and the
rest is a note keeps the cross alone. Mosaic and Pattern are the first kind.
Range, Bricks, Light Up, Subsets, Black Box and Tracks draw the cross today
(`git grep -l drawRuledOutCross -- src/games`); the session judged none of
them by this rule. Read each against it once the helper exists, and put any
that fits to the owner with a drawing, without changing it here.

This narrows the decision of `mark-ruled-out-with-a-cross` (2026-10-08), one
mark for "ruled out" in every game, on the owner's word: the cross stays the
mark, and two games put a surface under it.
