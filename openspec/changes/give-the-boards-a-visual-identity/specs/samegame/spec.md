## ADDED Requirements

### Requirement: Same Game draws flat tiles on a quiet field

`redraw` SHALL draw the board as flat tiles in the collection's colors standing
on the cell surface, with no bevel anywhere on it. Tiles of one group SHALL
join with no gap between them, and two tiles of different colors SHALL be
separated by a thin gap of the surface. An emptied cell SHALL be the plain
cell surface, with nothing drawn on it. The field SHALL be framed by the
surface's grid line, one pixel wide, standing one gap off the tiles.

A selected tile SHALL be drawn with a white body and its color at its middle,
white in both schemes, so the selected group stands off the field and off its
unselected neighbors in the dark scheme as in the light one. The keyboard
cursor SHALL be an outline inside the cell's edge: black on a tile, in both
schemes, and ink on an emptied cell. On a board with no move left, every tile
SHALL keep its color and take ink at its middle.

The flash SHALL lift the whole field, the margin inside the frame included, to
the lifted surface on its lit beats, leaving the tiles standing.

#### Scenario: The field has no bevel

- **WHEN** a board is drawn for the first time
- **THEN** the field is a rectangle of the cell surface inside a one-pixel frame
  in the grid's color
- **AND** nothing on the board is a bevel

#### Scenario: An emptied cell is empty surface

- **WHEN** a cell holds no tile
- **THEN** it is drawn as the cell surface and nothing else

#### Scenario: A selected tile is white in both schemes

- **WHEN** a tile is part of the selected group
- **THEN** its body is drawn in a white that the dark scheme does not invert
- **AND** its own color is drawn at its middle
