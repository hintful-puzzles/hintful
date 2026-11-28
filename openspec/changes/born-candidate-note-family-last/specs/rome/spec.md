## MODIFIED Requirements

### Requirement: Rules: An arrow placed pointing off the grid stays a move

No control SHALL place an arrow that points off the grid: a key, an
on-screen key and a drag off the edge each make no such move. An arrow a
move log places pointing off the grid SHALL remain a move, which the board
flags as an error at that square alone.

#### Scenario: A left arrow typed on the left edge

- **WHEN** the cursor shows on an empty square of the first column and `4`
  is typed
- **THEN** no move is made

#### Scenario: An up arrow in the top row is placed and flagged

- **WHEN** a move log's up arrow in a top-row square is executed
- **THEN** the arrow is placed, and that square alone is flagged as an error

### Requirement: Description: Rome rejects a description that breaks its shape

Reading a description SHALL refuse one that uses invalid clue characters,
that contains a region larger than four cells, or that places a goal in a
region whose size is not exactly one. Since no such board has an answer,
the refusal SHALL be that deduction cannot finish it.

#### Scenario: A goal in an oversized region is rejected

- **WHEN** a description placing a goal in a region larger than a single
  cell is read
- **THEN** it is refused as a board deduction cannot finish

#### Scenario: An area of more than four squares

- **WHEN** a description whose goal is alone and whose other eight squares
  are one area is read as a 3×3 board
- **THEN** it is refused as a board deduction cannot finish

### Requirement: Hint: Rome's hint places an arrow for one of three reasons

A step that places an arrow SHALL say one of: every other arrow has been
ruled out in the square, where its marks are down to one; every other way
the square can point is already used in its area, where the square carries
no marks; or its area must hold the arrow and only this square can still
point that way, with the area striped and why it holds the arrow said. A
technique's strikes that leave a square with no marks one way SHALL say
their reason and conclude that the square must point it.

#### Scenario: A square with no marks

- **WHEN** a square with no marks is the last empty one of an area whose
  other three squares hold arrows
- **THEN** the step places the fourth arrow and says every other way the
  square can point is already used in its area

#### Scenario: An area of three on the board's edge

- **WHEN** only one square of a three-square area on the left edge can
  still point right
- **THEN** the step says the area's three squares can point only three ways
  between them, and only this square can still point right

### Requirement: Look: What Rome draws

Rendering SHALL draw the region outlines, arrows and goals, pencil marks on
the side of the square each points to, an optional highlight of squares
whose arrows reach a goal, an arrow pointing off the grid in the error
color, and a duplicate arrow the player placed in the error color.

#### Scenario: The player repeats a fixed arrow

- **WHEN** the player places an arrow that a fixed arrow of its area already
  shows
- **THEN** the player's arrow is drawn in the error color and the fixed one
  keeps its ink

### Requirement: Look: Rome draws its squares on a quiet surface and keeps its outlines

`redraw` SHALL wash every square the player fills in its area's own pale
color, neighboring areas in different ones, and draw a square holding an
arrow the puzzle fixed, or a goal, on the collection's lifted surface of a
given, with the fixed arrow in ink and the player's in the entry color. The
line between two squares of one region SHALL be the collection's surface
grid line.

#### Scenario: A fixed arrow is told by the square under it

- **WHEN** the opening frame of a board is drawn
- **THEN** every square holding a fixed arrow is the lifted surface, and
  every empty square is its area's wash
