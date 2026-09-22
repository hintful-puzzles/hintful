## MODIFIED Requirements

### Requirement: Map input, preferences and rendering

`interpretMove` SHALL support: a press that picks up the color of the region
under the pointer (or, on a blank region, its pencil marks) into a floating drag
blob; a release that drops the held color onto the region under the pointer; a
right-drag from a color to a blank region that toggles a single pencil-mark bit;
and a keyboard cursor that picks and drops via the select keys — with the
diagonally-split-cell quadrant hit-test of `region_from_coords`. A
drop that changes nothing SHALL produce no move. Penciling a colored region
SHALL be rejected. The three upstream preferences (victory-flash effect,
number-regions, stipple display style) SHALL be exposed through the `prefs` hook
with the upstream keyword slugs, stored on the `Ui` with `newUi` defaults, and
the `l`/`L` key SHALL toggle region numbers in play. `redraw` SHALL render region
fills, the diagonal second-region triangle of a split cell, pencil-mark stipples,
grid lines on region boundaries, the red adjacency error diamonds, optional
region numbers, the flagged-mistake region outline, the selected region's band,
the floating drag blob (a blitter sprite) while a color or its marks are
carried, and the selected completion-flash style — with a `BORDER` of 0
(NARROW_BORDERS).

#### Scenario: A drag colors a region

- **WHEN** the player presses on a colored region and releases on an adjacent
  blank region
- **THEN** `interpretMove` yields a move whose execution sets the blank region to
  the held color

#### Scenario: A no-op drop yields no move

- **WHEN** the player drops a color onto a region that already holds it (or onto
  the border, or onto an immutable clue region)
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

### Requirement: Map offers one key per color, and a tap selects a region

Map SHALL offer an on-screen key for each of its four colors and a Clear key.
Pressing a color key SHALL color the region at the keyboard cursor, or toggle
that color as a pencil mark while notes mode is on; Clear SHALL empty the
region. A key SHALL act only while the cursor is shown, and SHALL be declined
otherwise, as the digit games do — entry at a cursor nobody can see puts a color
where the player is not looking, and a decline is also what lets the app's
bare-letter shortcuts through.

A pointer gesture that commits no move SHALL **select** the region it ended on.
Map's keys act at the keyboard cursor and a player without a keyboard has no
other way to move one, so without this the whole panel is unreachable rather
than merely awkward. Selection is additive: a tap is a press and a release on
one region, so it picks that region's own color up and puts it straight back,
which is already no move at all. A drag that ends where it cannot commit — on a
clue, or back where it started — selects by the same rule rather than by a
second one. What that selection does to the highlight and to notes mode SHALL
be the note-taking cell's rule, with the button the gesture used: a region may
take a color when it is not a clue, and a mark when it is blank.

Selection SHALL name the region the pointer was on, not merely its cell. The
cursor is a cell **plus the direction it last moved**, which is how a
diagonally-split cell names one of the regions it holds, and the translation
from a pixel SHALL derive that direction from the same quadrant test the
pixel→region hit-test uses rather than restating it.

The selection SHALL be drawn as the note-taking cell's picture in a region's
shape: a band just inside the whole of the selected region's boundary, in the
palette's cursor color, in both modes, and in notes mode the corner triangle in
the region's first cell in reading order as well. The region's own fill SHALL
NOT change, because in this game the fill is the answer. A color carried by the
keyboard SHALL be drawn **inside the triangle the cursor names** on a divided
cell — at that triangle's centroid, a third of a tile from the cell's center —
keeping upstream's one-pixel nudge on a whole cell, so the carried color says
which half of a divided cell its drop will land in.

Dragging a color from one region to another SHALL continue to work unchanged,
and so SHALL the keyboard's pick-and-drop by select. The panel is a second way
in, not a replacement.

#### Scenario: A region is colored without dragging

- **WHEN** a blank, non-clue region is tapped and a color key is pressed
- **THEN** that region takes that color, with no drag anywhere in the gesture

#### Scenario: The same key marks while notes mode is on

- **WHEN** notes mode is armed, a blank region is tapped and a color key is
  pressed
- **THEN** that color is toggled as a pencil mark, the region stays blank, and
  pressing the same key again rubs the mark out

#### Scenario: A clue refuses a color key

- **WHEN** a clue region is selected and a color key is pressed
- **THEN** no move is produced

#### Scenario: A tap on a split cell selects the region under the finger

- **WHEN** a diagonally-split cell is tapped on one side of its diagonal
- **THEN** the cursor names the region that side belongs to, not the other one
- **AND** the band is drawn inside that region and nowhere outside it

#### Scenario: The selected region is outlined, not recolored

- **WHEN** a region is selected
- **THEN** every cell on that region's boundary carries the band, the band
  covers well under half of the region, and in notes mode the corner triangle
  appears in the region's first cell
