## REMOVED Requirements

### Requirement: Mosaic draws its marks as a piece and a cross on a quiet surface

**Reason**: A blank cell is no longer plain surface with a cross: it is the
collection's clear square, a surface of its own (owner, 2026-10-11). The
requirement's name and its scenario's ("without a fill") say the opposite.

**Migration**: "Mosaic draws a marked cell as a piece and a blank one as the
clear square".

### Requirement: A blank Mosaic cell carries a cross that leaves its number the middle

**Reason**: The small corner cross beside a number is gone. A blank cell that
has a number shows the number alone on the clear square.

**Migration**: "A blank Mosaic cell's number has the clear square to itself".

## ADDED Requirements

### Requirement: Mosaic draws a marked cell as a piece and a blank one as the clear square

`redraw` SHALL draw a marked cell as the collection's shaded piece, inset on
the plain cell surface, a blank cell as the collection's clear square, a
surface of its own over the whole cell with no piece, and an unmarked cell as
plain surface holding nothing. The line between cells SHALL be the
collection's thin surface grid.

#### Scenario: The three marks are a piece, a surface of its own and nothing

- **WHEN** a board holding a marked cell, a blank cell and an unmarked cell is
  drawn
- **THEN** the marked cell holds the shaded piece on the plain surface, the
  blank cell is filled with the clear square's color and holds no piece, and
  the unmarked cell is plain surface and holds nothing

#### Scenario: The completion flash swaps the two

- **WHEN** a finished board is drawn in the first third of its flash
- **THEN** every marked cell is drawn as the clear square and holds no piece

### Requirement: A blank Mosaic cell's number has the clear square to itself

A blank cell that has no number SHALL carry the clear square's faint cross in
its middle. A blank cell that has a number SHALL carry no cross.

#### Scenario: A blank cell with a number

- **WHEN** a blank cell that has a number is drawn
- **THEN** it is the clear square with its number in the middle, and no cross
  is drawn in it

#### Scenario: A blank cell with no number

- **WHEN** a blank cell that has no number is drawn
- **THEN** a cross in the clear square's faint color is drawn about the
  middle of the cell

## MODIFIED Requirements

### Requirement: A Mosaic number reads over whatever its cell holds

A cell's number SHALL be drawn over whatever the cell holds and SHALL read
against it in both color schemes: on the shaded piece it is drawn in a color
that does not invert with the scheme. A satisfied number SHALL be drawn
fainter than an unsatisfied one on the piece and on the clear square, which
are the two places it can be: on the clear square in the square's faint
color, the cross's.

#### Scenario: A satisfied number grays on the piece and off it

- **WHEN** a satisfied number is drawn on a marked cell
- **THEN** it is drawn in a different color from an unsatisfied number on a
  marked cell
- **AND** a satisfied number on a blank cell is drawn in a different color
  from an unsatisfied number on a blank cell

### Requirement: A contradicted Mosaic number is red, and a badge on the piece

A contradicted number SHALL be drawn in the error color on bare surface. On
the shaded piece and on the clear square it SHALL be drawn as a badge: a disc
in the error color under the number.

#### Scenario: A contradicted number on a marked cell

- **WHEN** a marked cell's number has more marked cells around it than its
  value
- **THEN** a disc in the error color is drawn on the piece, and the number
  over the disc

#### Scenario: A contradicted number on a blank cell

- **WHEN** a blank cell's number has more marked cells around it than its
  value
- **THEN** a disc in the error color is drawn on the clear square, and the
  number over the disc
