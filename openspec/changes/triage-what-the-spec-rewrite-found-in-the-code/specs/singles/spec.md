## MODIFIED Requirements

### Requirement: Singles params are refused outside their bounds

Params SHALL be refused unless `w ≥ 2`, `h ≥ 2` and both are `≤ 61`: 61 is the
largest number the desc alphabet writes, and a cell holds a number up to
`max(w, h)`. A difficulty letter the encoding does not know SHALL decode as
the default tier and SHALL NOT be refused.

#### Scenario: Invalid params are rejected

- **WHEN** params with `w < 2` or `h < 2` are checked
- **THEN** the check returns a non-null error string

#### Scenario: A grid one past the alphabet is rejected

- **WHEN** params with a height of 62 are checked
- **THEN** the check returns "Height must be at most 61."

### Requirement: Singles errors are drawn in the error color

A cell `checkComplete` flags as an error SHALL be drawn in the error color: the
piece of a blackened cell, and the number and the ring of any other. The grid
lines and the frame SHALL stay in the grid color on every board, since no
board a player reaches is marked impossible: that mark is the solver's, on
its own working copy.

#### Scenario: An erroneous cell renders in the error color

- **WHEN** `checkComplete` flags a cell as an error
- **THEN** that cell's piece, or its number and ring where it holds no piece,
  is drawn in the error color

#### Scenario: A board full of errors keeps its grid

- **WHEN** every cell of a row is blackened, so each is flagged
- **THEN** the grid lines and the frame are drawn in the grid color
