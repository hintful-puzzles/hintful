## ADDED Requirements

### Requirement: Ascent draws its cells on a quiet surface and lifts a given

`redraw` SHALL draw every cell the player fills on the collection's cell
surface and a cell holding a number the puzzle fixed on the collection's lifted
surface of a given, in the square and the hexagonal modes alike. A number the
puzzle fixed SHALL be drawn in ink and a number the player placed in the
collection's entry color, as in every other entry game. The outline of a cell
SHALL be the collection's surface
grid line. A wall SHALL stay a solid fill in ink, and the margin an edge
number's arrow sits in SHALL stay the board.

The path the board draws for itself between consecutive numbers runs through
plain and lifted cells, so it SHALL be drawn in the collection's strong gray
line, which stands off both surfaces in both schemes: dark on a light board
and light on a dark one. The disc under the first and the last number SHALL
carry a ring in the grid line's color. A number on either path SHALL be drawn
on a disc of its cell's surface, and an end's disc over the line into it, so no
line runs under a digit. The path the player draws SHALL keep the
entry color. The cell the player holds, types into or has selected SHALL take
the collection's selection wash, which is told from a plain cell and a lifted
one in both schemes. The washes that mark a dragged row or column and the next
target SHALL each replace the cell's surface as before.

#### Scenario: A given is told by the cell under it

- **WHEN** the opening frame of a rectangular board is drawn
- **THEN** every cell holding a number is the lifted surface and every other
  cell is the plain cell surface

#### Scenario: The grid is quiet in every mode

- **WHEN** a rectangular board and a hexagonal board are drawn
- **THEN** each cell's outline, four-sided or six-sided, is the surface's grid
  line

#### Scenario: The board's own path reads on both surfaces

- **WHEN** a number is typed next to its neighbor in the sequence
- **THEN** the preview of the line joining them is drawn in the color of the
  board's own path, which is neither surface's
