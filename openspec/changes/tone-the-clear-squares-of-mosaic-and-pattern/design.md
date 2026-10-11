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

## What was built

Built 2026-10-11 and looked at in the running app in both schemes, on the
Mosaic board above and a 15x15 Pattern board.

- **The surface is `CLEAR`, the named color `YELLOW_FIELD`.** In the light
  scheme it is the value the owner chose from the drawing (`YELLOW_WASH`'s).
  In the dark scheme it is lightness 0.52 at chroma 0.10, a gold, where
  `YELLOW_WASH` is 0.48 at 0.08. A dark yellow is an olive whatever is done,
  so the gain in the surface is modest and comes from chroma. 0.46 was tried
  and read muddier. It was not taken lighter because the dark piece is at
  0.60: the square stands 0.08 under the piece and about 0.25 over the
  undecided cell, and the two are told apart by hue and by the piece's shape.
  **This is the value to judge by eye.**
- **The faint cross is `CLEAR_MARK`, the named color `YELLOW_FIELD_MARK`**: the
  surface's hue a step toward the ink of each scheme, darker than the surface
  in the light scheme and lighter in the dark. This is most of the contrast
  the owner asked for: the gray of the drawing sat 0.04 from the dark surface.
- **A satisfied number on a clear square takes the same color.** Its gray
  vanished on the dark surface too. A satisfied number's own square is always
  decided, so Mosaic's slot for one on bare surface had no use and is gone.
- **A contradicted number on a clear square is a badge**, the red disc it
  already was on the piece. Red ink on the dark gold differed in hue and
  hardly in lightness.
- **Pattern's hint hatch is drawn over the clear square**, cross included, and
  reads as one strip.
- **Mosaic's flash** swaps the two states square for square and leaves
  nothing behind.

## The other games, read against the rule

Each caller of `drawRuledOutCross`, 2026-10-11:

| Game | Reading |
| --- | --- |
| Black Box | A few balls are the answer; a cross is a note. Keeps the cross. |
| Light Up | A few bulbs are the answer; a cross is "no bulb here". Keeps it. |
| Tracks | The track is the answer; the owner's own example of the first kind. |
| Subsets | A cross strikes a letter from a set; no board is colored. Keeps it. |
| Range | Every square is decided in the end, but shaded squares may not touch and are the few; clear is the bulk of the board and the note. Keeps it. |
| Bricks | **Fits.** Every cell is shaded or clear, the two in like number, and the work is deciding each. |

## A question for the owner

**Should Bricks take the clear square too?** `bricks-clear-square.png` in
this directory is Bricks with it, twenty hint steps into the default board,
light and dark (a temporary switch, not committed). The recommendation is
yes: it is the same kind of board, and its numbers sit on cells of their own,
so no clear square there ever holds a number. The cost is one more game whose
look changes; nothing a player saved is touched. It is not done here because
the design says to ask.

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
