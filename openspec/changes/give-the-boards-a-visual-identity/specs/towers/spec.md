## ADDED Requirements

### Requirement: Towers stands its towers on a quiet surface, with a given's lifted

`redraw` SHALL draw every play cell on the collection's cell surface, and a
cell holding a given tower on the collection's lifted surface of a given, so
that a given is told by its surface as well as by its ink. Under the 3D
appearance a tower's top and both its faces SHALL take its cell's surface, and
the tower's own edges SHALL stay in ink, since the tower is the content. The
line between two play cells and the frame round the play area SHALL be the
collection's surface grid line, and SHALL NOT be drawn across the base of a
tower standing beside it. Under the 2D appearance every line of the grid is
that line. The clue ring SHALL stay on the board, outside the surface.

The selection's wash SHALL be drawn over whichever surface the cell has, on a
tower's faces as on its top. The hint's marks SHALL stay on the cell's border.

#### Scenario: A given tower is told by its surface

- **WHEN** a board with given towers is drawn
- **THEN** each given's cell, and its tower's faces under the 3D appearance,
  are the lifted surface
- **AND** every other play cell is the cell surface

#### Scenario: A tower keeps its edges and the grid recedes

- **WHEN** a board is drawn with the 3D appearance
- **THEN** a tower's outline is ink
- **AND** the edges of an empty play cell are the surface grid line
