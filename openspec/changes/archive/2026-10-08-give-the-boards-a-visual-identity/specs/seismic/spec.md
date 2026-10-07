## ADDED Requirements

### Requirement: Seismic draws its cells on a quiet surface and keeps its walls

`redraw` SHALL draw every cell the player fills on the collection's cell
surface and a cell holding a given number on the collection's lifted surface of
a given, with the given's number in ink and the player's in the entry color.
The line between two cells of one region SHALL be the collection's surface grid
line. A region's wall, the frame round the board included, is content: it SHALL
stay in ink at its full width, and where two walls turn round a cell's corner
they SHALL meet in a solid corner.

The completion flash SHALL sweep a bright beat and a dim beat across the board
over each cell's own surface, in colors that read in both schemes.

#### Scenario: A given is told by the cell under it

- **WHEN** the opening frame of a board is drawn
- **THEN** every cell holding a given is the lifted surface and every other
  cell is the plain cell surface

#### Scenario: A wall is stronger than a grid line

- **WHEN** a board with a region of two or more cells is drawn
- **THEN** the line between two cells of that region is the surface's grid line
- **AND** the line between two regions is ink

#### Scenario: The flash moves

- **WHEN** the completion flash is drawn at three successive beats
- **THEN** the three frames differ, and each shows both the bright and the dim
  beat
