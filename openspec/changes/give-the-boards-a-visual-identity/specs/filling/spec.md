## ADDED Requirements

### Requirement: Filling draws its cells on a quiet surface and keeps its borders

`redraw` SHALL draw every cell the player fills on the collection's cell
surface and a cell holding a clue on the collection's lifted surface of a
given, with the collection's surface grid line between cells. A region's border
is content: it SHALL be drawn in ink as one solid stroke, taking the grid
line's own pixel, so no quiet line shows inside a border. The board's edge is
always a region's border, and the frame SHALL be as heavy as a border between
two regions and no heavier.

A completed region's shade, the error shade and the selection highlight SHALL
each replace the cell's surface, a clue's included. A completed region, a
selected cell, a clue and an empty cell SHALL each be told from the others in
both schemes.

#### Scenario: A clue is told by the cell under it

- **WHEN** the opening frame is drawn
- **THEN** every clue's cell is the lifted surface or the completed-region
  shade, and every empty cell is the plain cell surface

#### Scenario: A border is one stroke

- **WHEN** two differing filled cells sit side by side
- **THEN** the border between them is drawn in ink across the grid line's pixel
  as well as beside it
