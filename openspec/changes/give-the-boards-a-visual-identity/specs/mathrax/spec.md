## ADDED Requirements

### Requirement: Mathrax draws its cells on a quiet surface and lifts a given

`redraw` SHALL draw every cell the player fills on the collection's cell
surface, with the collection's surface grid line between cells and a frame
round the grid no heavier than that line. A cell holding a given number SHALL
sit on the collection's lifted surface of a given, with its number in ink, and
a number the player entered SHALL keep the player's entry color on the plain
surface. A clue SHALL be a disc in the lifted surface's color with a ring and a
label in ink, so a clue reads as the puzzle's own in both schemes.

The selected cell's wash, its notes corner and the pencil marks SHALL be drawn
on the cell's surface as before, and the hint's marks SHALL stay on the cell's
edge.

#### Scenario: A given is told by the cell under it

- **WHEN** a board with a given number is drawn
- **THEN** the given's cell is the lifted surface and every empty cell is the
  plain cell surface

#### Scenario: The grid is quiet

- **WHEN** the opening frame is drawn
- **THEN** the lines between cells and the frame are the surface's grid line
- **AND** nothing but a number, a clue's ring and a clue's label is drawn in ink
