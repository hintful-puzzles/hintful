## MODIFIED Requirements

### Requirement: Range draws a shaded cell as the collection's shaded piece

`redraw` SHALL draw the board as pieces on a quiet surface. A cell the player
has shaded (the state called black elsewhere) SHALL hold the collection's
shaded piece, inset on its cell. A cell marked as not shaded (white) SHALL hold
the collection's ruled-out cross and take no fill of its own, and an undecided
cell SHALL be the plain cell surface, so no state is told by a step of gray.

#### Scenario: Three states on one surface

- **WHEN** a board holds a shaded cell, a cell marked not shaded and an
  undecided cell
- **THEN** all three are drawn on the same cell surface
- **AND** the first holds the shaded piece, the second the ruled-out cross and
  the third nothing

### Requirement: The Range completion flash lifts every cell

The completion flash SHALL lift every cell to the given's surface on its lit
beats and SHALL leave the pieces standing.

#### Scenario: A flashing board keeps its pieces

- **WHEN** a solved board is drawn on a lit beat of its flash
- **THEN** every cell is the given's surface
- **AND** every shaded cell still holds its piece
