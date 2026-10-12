## ADDED Requirements

### Requirement: The star rules decide when a board is solved

A Star Battle board SHALL be solved exactly when every row, every column and
every region holds the number of stars the board's parameters name, and no
two stars are in cells that share a side or a corner. A cross SHALL be the
player's note that a cell holds no star, and SHALL count toward nothing.

#### Scenario: One star to a unit

- **WHEN** the parameters name one star and each row, column and region
  holds one star, no two of them touching at a corner
- **THEN** the board is solved

#### Scenario: Two stars touch at a corner

- **WHEN** every row, column and region holds its number of stars and two
  of the stars are diagonal neighbors
- **THEN** the board is not solved
