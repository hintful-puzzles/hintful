## ADDED Requirements

### Requirement: Rome draws its squares on a quiet surface and keeps its outlines

`redraw` SHALL draw every square the player fills on the collection's cell
surface, and a square holding an arrow the puzzle fixed, or a goal, on the
collection's lifted surface of a given, with the fixed arrow in ink and the
player's in the entry color. The line between two squares of one region SHALL
be the collection's surface grid line. A region's outline, the frame round the
board included, is content: it SHALL stay in ink at its full width, and where
two outlines turn round a square's corner they SHALL meet in a solid corner.

The tint of a square whose arrows reach a goal, the error tint and the selected
square's wash SHALL each replace the square's surface as before. The completion
flash SHALL sweep a bright beat and a dim beat across the board over each
square's own surface, in colors that read in both schemes.

#### Scenario: A fixed arrow is told by the square under it

- **WHEN** the opening frame of a board is drawn
- **THEN** every square holding a fixed arrow is the lifted surface and every
  empty square is the plain cell surface

#### Scenario: An outline is stronger than a grid line

- **WHEN** a board with a region of two or more squares is drawn
- **THEN** the line between two squares of that region is the surface's grid
  line
- **AND** the line between two regions is ink

#### Scenario: The flash moves

- **WHEN** the completion flash is drawn at two different beats
- **THEN** the frames differ, and a frame shows both the bright and the dim beat
