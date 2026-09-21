# map — delta

## ADDED Requirements

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
second one.

Selection SHALL name the region the pointer was on, not merely its cell. The
cursor is a cell **plus the direction it last moved**, which is how a
diagonally-split cell names one of the regions it holds, and the translation
from a pixel SHALL derive that direction from the same quadrant test the
pixel→region hit-test uses rather than restating it.

The cursor SHALL be **drawn inside the triangle it names** on a divided cell —
at that triangle's centroid, a third of a tile from the cell's center — keeping
upstream's one-pixel nudge on a whole cell, where all four quadrants are one
region and the offset would only announce which way the player last moved. A
selection every key press acts on has to say which half of a divided cell it
means, and a ring parked on the diagonal does not.

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
- **AND** the cursor ring is drawn on that side of the diagonal rather than on it
