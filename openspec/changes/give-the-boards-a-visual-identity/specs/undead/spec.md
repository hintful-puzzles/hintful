## ADDED Requirements

### Requirement: Undead draws its cells on a quiet surface and lifts what is fixed

`redraw` SHALL draw every cell the player fills on the collection's cell
surface, with the collection's surface grid line between cells and a frame
round the grid no heavier than that line. A cell holding a mirror, and a cell
holding a monster the puzzle fixed, SHALL sit on the collection's lifted
surface of a given. A monster SHALL be the same drawing on either surface, and
a mirror SHALL stay in ink.

The selected cell's wash and notes corner SHALL be drawn on the cell's surface
as before, and the hint's marks SHALL stay on the cell's edge, over the grid
line.

#### Scenario: A mirror is told by the cell under it

- **WHEN** the opening frame of a generated board is drawn
- **THEN** every mirror's cell is the lifted surface and every empty cell is
  the plain cell surface

#### Scenario: The frame is a grid line

- **WHEN** the opening frame is drawn
- **THEN** the line round the grid is one pixel of the surface's grid line, as
  the line between two cells is
