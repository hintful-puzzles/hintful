## MODIFIED Requirements

### Requirement: Look: Singles errors are drawn in the error color

A cell where the board breaks a rule (`Game.rules`), a square beside a
blackened one read as clear, SHALL be drawn in the error color: the piece of a
blackened cell, and the number and the ring of any other. The grid lines and
the frame SHALL stay in the grid color on every board, since no board a
player reaches is marked impossible: that mark is the solver's, on its own
working copy.

#### Scenario: An erroneous cell renders in the error color

- **WHEN** two circled copies of a number share a row
- **THEN** both numbers and their rings are drawn in the error color

#### Scenario: Two numbers forced clear

- **WHEN** two copies of a number in a row each sit beside a blackened cell
- **THEN** both numbers are drawn in the error color

#### Scenario: A corner cut off

- **WHEN** the two squares beside a corner are blackened
- **THEN** both pieces are drawn in the error color, as the cells that cut
  the clear squares apart

#### Scenario: A board full of errors keeps its grid

- **WHEN** every cell of a row is blackened, so each is flagged
- **THEN** the grid lines and the frame are drawn in the grid color
