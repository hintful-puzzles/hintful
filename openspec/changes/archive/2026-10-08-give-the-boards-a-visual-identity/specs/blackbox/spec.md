## ADDED Requirements

### Requirement: Black Box draws its balls as pieces and lifts what is settled

`redraw` SHALL draw the board as pieces on a quiet surface, with no bevel. A
square of the box SHALL be the plain cell surface, and the line between two
squares SHALL be the surface's grid line, which each square carries on all
four sides so the board needs no frame. A guessed ball SHALL be the
collection's disc piece, inset on its square, in a color that none of the
marks drawn on the board uses.

What is settled SHALL sit on the lifted surface: a square marked as known, a
laser square once it has been fired, and every square of the box after a
reveal. A square marked as known that holds no ball SHALL also hold the
collection's ruled-out dot, so that being marked is never told by a step of
gray alone. A laser square not yet fired SHALL be the board's own color inside
its grid line.

The keyboard cursor SHALL be drawn at the corners of its square, beside a
ball, and SHALL NOT recolor it. A hint's ring and outline and a mistake's frame
SHALL sit at the edge of the square's surface. The game SHALL declare no
palette swap for the dark scheme, and its hint sentences and help page SHALL
name no hue for a ball.

#### Scenario: A covered box is the cell surface

- **WHEN** a new board is drawn, before any move
- **THEN** every square of the box is the plain cell surface
- **AND** no square is the lifted surface

#### Scenario: A ball is a piece

- **WHEN** the player puts a ball on a square
- **THEN** the square holds a disc in the ball's color, inset on its surface

#### Scenario: A known square is lifted and marked

- **WHEN** the player marks an empty square as known
- **THEN** the square is the lifted surface and holds the ruled-out dot
- **AND** a ball on a square marked as known sits on the lifted surface with
  no dot

#### Scenario: A fired laser square is lifted

- **WHEN** a laser is fired
- **THEN** the square it entered, and the square it left by if any, are the
  lifted surface under their letter or number
- **AND** the laser squares not fired are not
