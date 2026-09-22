## MODIFIED Requirements

### Requirement: Rome offers one key per arrow, and a tap selects a square

Rome SHALL offer an on-screen key for each of the four arrows, and a Clear key.
Pressing an arrow key SHALL place that arrow in the selected square, or toggle
it as a mark while notes mode is on; Clear SHALL empty whichever of the two the
mode is entering.

A press and release on one square that commits no move SHALL **select** that
square, in both modes. Rome's keys act at the keyboard cursor, and a player
without a keyboard has no other way to put the cursor anywhere, so without this
the whole panel is unreachable rather than merely awkward. What that selection
does to the highlight and to notes mode SHALL be the note-taking cell's rule,
with the button the gesture used: a right tap selects for notes, or latches
them with the sticky preference, and the highlight shows only where the mode
could write. A mouse-driven highlight SHALL go away after an arrow is placed
and stay through a mark, as the note-taking games' does.

The selected square SHALL be drawn with the note-taking cell's picture. A
keyboard cursor armed to await a direction SHALL additionally show a `?` in the
ink of the arrow or the mark that direction will make, which is what tells an
armed cursor from a resting one.

Dragging a direction out of a square SHALL continue to work unchanged. The panel
is a second way in, not a replacement.

#### Scenario: A square is entered without dragging

- **WHEN** an empty, non-fixed square is tapped and an arrow key is pressed
- **THEN** that arrow is placed in it

#### Scenario: The same key marks while notes mode is on

- **WHEN** notes mode is armed, a square is tapped, and an arrow key is pressed
- **THEN** that arrow is toggled as a pencil mark rather than placed, and Clear
  empties the square's marks rather than its arrow

#### Scenario: A tap that commits nothing still selects

- **WHEN** a press and release land on the same square, in either mode
- **THEN** no move is made and the cursor is left on that square

#### Scenario: An armed cursor prompts for its direction

- **WHEN** the keyboard cursor is armed to place an arrow, or to place a mark
- **THEN** the square shows the entry wash or the notes triangle respectively,
  with a `?` in the ink the arrow or the mark will take
