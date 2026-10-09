## MODIFIED Requirements

### Requirement: Pegs' marks sit beside the peg and never recolor it

The keyboard cursor SHALL be drawn at the corners of its cell, beside the peg
or the hole, and SHALL NOT recolor either. A peg picked up from the keyboard
SHALL keep its own color inside a ring in the held color. A hint's rings and
outline SHALL be drawn in the margin beside the peg, and its stripes on the
cell's face under the peg. A hint's arrow SHALL be laid over the pegs, from
the edge of the peg that jumps, across the peg it jumps, toward the hole.

#### Scenario: The cursor is beside the peg

- **WHEN** the keyboard cursor is on a peg
- **THEN** the peg is drawn in the peg's color
- **AND** the cursor's mark is at the corners of the cell

#### Scenario: A held peg wears a ring

- **WHEN** a peg is picked up from the keyboard
- **THEN** it is drawn in its own color inside a ring in the held color
- **AND** the cursor's corner mark is not drawn on that cell

#### Scenario: An arrow crosses the peg it jumps

- **WHEN** a hint draws an arrow on a jump
- **THEN** the arrow's line is drawn after the jumped peg and over it, and the
  peg keeps its color on either side of the line
