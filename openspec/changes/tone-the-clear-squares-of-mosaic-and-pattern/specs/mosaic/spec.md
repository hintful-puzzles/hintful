## MODIFIED Requirements

### Requirement: Mosaic draws its marks as a piece and a cross on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface, and the line
between cells SHALL be the collection's thin surface grid. A marked cell SHALL
hold the collection's shaded piece, inset on its cell. A blank cell SHALL be
the collection's clear square, a pale surface of its own over the whole cell.
An unmarked cell SHALL be plain surface.

#### Scenario: The three marks are told apart without a fill

- **WHEN** a board holding a marked cell, a blank cell and an unmarked cell is
  drawn
- **THEN** the marked cell holds the shaded piece on the plain surface, the
  blank cell is the pale surface and holds no piece, and the unmarked cell is
  plain surface and holds nothing

### Requirement: A blank Mosaic cell carries a cross that leaves its number the middle

A blank cell that has no number SHALL carry the clear square's faint cross in
its middle. A blank cell that has a number SHALL carry no cross, so that the
number has the cell to itself.

#### Scenario: A blank cell's cross and its number both read

- **WHEN** a blank cell that has a number is drawn
- **THEN** it is the pale surface with its number in the middle, and no cross
  is drawn in it
