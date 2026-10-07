## ADDED Requirements

### Requirement: Flood draws a flat field of colored tiles

`redraw` SHALL draw the board as a field of flat tiles in the collection's ten
colors, with no bevel anywhere on it. Tiles of one region SHALL join with no
line between them, so a region reads as one area and the controlled region's
growth is the picture. Where two regions meet, and round the field, the line
SHALL be the surface's grid line, thin, and the frame SHALL be no heavier than
the line between two regions.

A mark drawn on a tile (the keyboard cursor's outline, the dot a hint puts on
each square the next fill joins, and the blink of a lost board) SHALL be black
in both schemes, since it is read against the tile and not against the board.

#### Scenario: The field has no bevel

- **WHEN** a board is drawn for the first time
- **THEN** every tile is a flat rectangle in its color
- **AND** the field is framed by a line in the grid's color, as wide as the
  line a tile draws at its region's edge

#### Scenario: A region is one area

- **WHEN** two orthogonally adjacent tiles have the same color
- **THEN** no line is drawn between them
- **AND** two adjacent tiles of different colors are separated by the grid line
