## MODIFIED Requirements

### Requirement: Singles rendering

`redraw` SHALL draw the board as pieces on a quiet surface. Every cell SHALL be
the collection's cell surface, with the collection's surface grid line between
cells and a frame round the grid no heavier than that line. A blackened cell
SHALL hold the collection's shaded piece, inset on its cell. A circled cell
SHALL hold a ring round its number in the collection's ruled-out color, with no
fill of its own, and SHALL carry no other mark for that state. An undecided
cell SHALL be plain surface. State SHALL never be told by a step of gray.

A cell that holds no piece SHALL always show its number, in ink. A blackened
cell SHALL show its number only when the show-black-numbers preference is on,
drawn on the piece in a color that is the same in both schemes, and smaller
than the number of a cell that holds no piece.

A cell `checkComplete` flags as an error SHALL be drawn in the error color: the
piece of a blackened cell, and the number and the ring of any other. The cursor
SHALL be brackets at the corners of the cursor cell, and the hint's marks and
the Check & Save outline SHALL be bands at the cell's edge, so that each lands
beside the piece and the ring and never on them. The grid lines and the frame
SHALL be drawn in the error color when the board is in an impossible state. A
genuine completion (not a solved-with-help) SHALL trigger the completion flash,
which lifts the surface of every cell that holds no piece.

The game SHALL name no hue of its own for a blackened cell: its hint
sentences, its control words and its preference's label SHALL say the
collection's word for the shaded color and its word for a cell that is not
shaded, and its help page SHALL name the shaded color by placeholder.

#### Scenario: A blackened cell renders black with no number by default

- **WHEN** a cell is blackened and the show-black-numbers preference is off
- **THEN** the cell holds the shaded piece and no number is drawn

#### Scenario: An erroneous cell renders in the error color

- **WHEN** `checkComplete` flags a cell as an error
- **THEN** that cell's piece, or its number and ring where it holds no piece,
  is drawn in the error color

#### Scenario: A circled cell is a ring on the surface

- **WHEN** a cell is circled
- **THEN** it is drawn as the cell surface with an unfilled ring round its
  number
- **AND** the ring stands in from the cell's edge by more than the thickness
  of a hint's band

#### Scenario: A hint names the color the piece is drawn in

- **WHEN** a hint step concludes that a cell must be blackened
- **THEN** its sentence says the collection's word for the shaded color
- **AND** applying the step draws the shaded piece in that cell
