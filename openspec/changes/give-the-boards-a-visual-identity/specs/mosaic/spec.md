## ADDED Requirements

### Requirement: Mosaic draws its marks as a piece and a dot on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface. Every cell SHALL
have the same surface whatever its mark, and the line between cells SHALL be
the collection's thin surface grid. A marked cell (the one the other
requirements call black, after upstream) SHALL hold the collection's shaded
piece, inset on its cell. A blank cell (the one they call white) SHALL hold no
piece and no fill of its own: it SHALL carry the collection's ruled-out dot,
in the middle of the cell, or in a corner of it where the cell has a number,
so that the number keeps the middle. An unmarked cell SHALL be plain surface.

A cell's number SHALL be drawn over whatever the cell holds and SHALL read
against it in both color schemes: on the shaded piece it is drawn in a color
that does not invert with the scheme. A satisfied number SHALL be drawn grayer
than an unsatisfied one on every kind of cell, the piece included. A
contradicted number SHALL be drawn in the error color on bare surface, and on
the shaded piece as a badge: a disc in the error color under the number.

The game SHALL name no hue of its own for either mark: its hint sentences, its
control words and its hint-mark legend SHALL say the engine's words for a
shaded cell and for a cell known not to be shaded, and its help page SHALL name
the shaded color by placeholder.

#### Scenario: The three marks are told apart without a fill

- **WHEN** a board holding a marked cell, a blank cell and an unmarked cell is
  drawn
- **THEN** all three cells are filled with the same surface color
- **AND** the marked cell holds the shaded piece, the blank cell holds a dot
  and the unmarked cell holds neither

#### Scenario: A blank cell's dot and its number both read

- **WHEN** a blank cell that has a number is drawn
- **THEN** the dot's center is further from the number's center than the dot
  is wide, on both axes

#### Scenario: A satisfied number grays on the piece and off it

- **WHEN** a satisfied number is drawn on a marked cell
- **THEN** it is drawn in a different color from an unsatisfied number on a
  marked cell
- **AND** a satisfied number on a blank cell is drawn in a different color
  from an unsatisfied number on a blank cell

#### Scenario: A hint names the mark by the engine's word

- **WHEN** a hint step concludes that squares must be marked
- **THEN** its sentence says the engine's word for the shaded color
- **AND** a step that concludes squares must be blank says the engine's word
  for a cell known not to be shaded
