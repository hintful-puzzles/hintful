# draw-hint-marks-from-roles — design

## D1. The census, and why the frame alone cannot say what a mark is

The proposal asked first for a census: how many games' `drawn` is a straight
read of highlight fields the words already produce, because if most were, the
check alone might move to the recorded frame and leave the renderers alone.

Measured 2026-09-29 by reading every `drawn` (they are few enough to read):
of the 37 functions behind the 45 bound games, **28 are straight reads**. Nine
restate a rule of the renderer: Ascent's ring wins a square over an outline;
Map outlines a ringed region only when it carries an ordinal; Boats, Galaxies,
Netslide, Spokes, Tracks and Undead each run a `markedOf`/`painted`/
`drawnSquares` filter that the renderer also runs; and Crossing drops the
target from its outlined numbers.

So most are straight reads, but the second half of the premise fails. The
recorded frame cannot name a mark's role or its element without a declaration
per game. The same instrument, run over every bound game's first step
(hinted frame minus unhinted frame, ops grouped by palette meaning), found:

- stripes painted as `hatch` ops in the action color (Filling, Group, Magnets,
  Pattern, Towers, Netslide) and in the black-reference color (Crossing);
- outlines in five colors: `HINT_EVIDENCE`, `HINT_WHITEREF` (Clusters,
  Galaxies), `HINT_BLACKREF`, and colors of the game's own (Unruly, Untangle);
- rings and outlines both in the action color in several games (Light Up,
  Magnets, Pattern);
- no map from a pixel to a cell, an edge or a dot, which differs per game.

Classifying the frame would take a color-to-role table and a footprint per
kind for every game. That is two new statements about the renderer per game in
place of the one being retired.

## D2. The instrument: ablate a mark from the words and watch the frame

What *can* be measured without declaring anything is whether a mark changes
the frame. Once a renderer paints hint marks from the step's words, removing a
reference from the words must remove its paint:

1. **Every named mark is drawn.** For each element a reference names, the
   frame with that element narrowed out of the words (`Narration.narrow`)
   differs from the step's own frame.
2. **Nothing is drawn that the words do not name.** The frame with every
   reference narrowed out equals the frame with no hint at all.

Both compare whole recorded frames rendered from a fresh draw state, so a tile
cache cannot hide a difference, and neither needs to know what a glyph looks
like or where an element sits. The check measures the thing itself: paint that
comes and goes with a reference.

It also cannot pass a renderer that still paints from highlight fields. Such a
renderer paints the same with the references stripped (rule 2 fails) and the
same with one removed (rule 1 fails). So the check drives the conversion as
well as guarding it, and `HintMarkLegend.drawn` has no role left.

What it does not see is a mark painted with the wrong glyph for its role: an
outline drawn where the words say ringed. That was never `drawn`'s job either.
The glyph per role is held by the tier-2.5 tests and `testing/mark-shape.ts`,
as before.

Cost, measured on the first step of every bound game: a render is 0.05 to
0.7 ms, and a step names about five elements, so a step's check is about seven
renders.

## D3. The renderer reads the marks from the words

`hint-words.ts` gains `stepMarks(step)`: the step's references grouped by role
and kind, with `of(role, KIND)` returning the named elements of that kind, once
each by the kind's key, in the order the words first name them. An element keeps
whatever data it was named with, so an outlined cell carries its chain ordinal
as it did in `area`.

A bound game's renderer takes every hint mark from `stepMarks(hint)`. Highlight
fields that only fed the renderer are deleted. Fields that other code reads
stay as plan data (the candidate walk's `area`, `hatch` and `targets` feed its
frontier and keep-track), but the renderer no longer reads them.

The glyph for a role on a kind stays the game's, painted where it was painted
before, so every tier-2.5 snapshot is unchanged. That is the evidence that no
player sees a difference.

The nine renderer rules in D1 move to where the words are built: a sentence
names a mark only if the renderer will paint it. Ascent's words do not call a
ringed square outlined. Where a rule depends on the board (Boats'
`drawnSquares`), the words are built from the same filtered squares, as they
already are.

## D4. The engine helpers that paint for a family read the words too

`OverlaySidecar.pack` takes the step and reads its references instead of its
highlights, so the twelve games that pack their overlay through it move in one
edit: ringed cells, ringed notes, outlined cells with their ordinals, striped
cells. The border grid's `borderHintJourney` stops copying `cells` and `hatch`
out of the words into the highlights, since nothing reads them any more.

## D5. What goes away

- `HintMarkLegend.drawn` and every game's `*HintMarks` function.
- `candidateHintMarks`, `borderHintMarks`, `evidenceOf`'s role in rendering.
- The highlight fields added only so that `drawn` could see a mark (Loopy's
  `placedCorner`/`placedPair`, Subsets' `slot`) when the renderer can read the
  same fact from the words.
- `bind-the-remaining-hints` D4's second half: a keep-track shrink narrows the
  words, and the marks follow, because they are read from the words.

## D6. Rect: a mark that straddles tiles needs no footprint

Rect was pulled in because its decided element, a rectangle, spans many tiles,
and the pilot's proposal had a game declare the footprint of such a mark. It
needed none. The rectangle is a kind of its own (`RECTANGLE`), and its ring is
the contour of its squares: each tile paints the sides of its own that lie on
the rectangle's edge (`outlineSides` over the rectangle, `drawMarkSides` inside
the tile), exactly as an evidence area's outline is painted. The sides live in
the tile's cache word, so a tile repaints when its share of the mark changes,
and no mark lies outside a tile to erase. The ablation check needed nothing
either: removing the rectangle from the words removes its sides.

The hint reads only what the board shows: the clues and the drawn lines. A
clue's **fits** are the rectangles of its area that contain it, stay on the
board, take in no other clue and cross no line. Five rungs, measured on
generated boards before the hint was written (2026-09-29; the first three rows
on 30 boards per size at 7, 9, 11, 13 and 15, the last two on 60 per size at 7,
11, 15 and 19):

| rungs | boards finished |
|---|---|
| a clue has one fit | 13, 6, 4, 1, 1 of 30 |
| + a square only one clue reaches | 27, 27, 29, 27, 25 of 30 |
| + squares another clue covers wherever it goes | 29, 30, 29, 28, 28 of 30; 233 of 240 |
| + a fit that starves a clue or strands a square | 239 of 240 |
| + an edge no fit straddles is a line | none more; it fires on ambiguous-mode boards |

As built, the rungs left 6 of 700 boards across every size unfinished. The
refusal a hint gives when its rungs run out says the board's difficulty allows
trial and error, and Rect has no tier to make that true, so the generator deals
only boards the rungs finish, and deals again otherwise (`rungsFinish`). It
diverges from C only on those seeds. One frozen C fixture was such a board and is
retired, and its desc is pinned as the case the gate turns away.

A step outlines the clues that rule a fit out, but says "cross a line" without
marking the line: the line is already drawn in the player's ink, so the words
point at it by kind.
