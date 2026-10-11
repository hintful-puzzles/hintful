## ADDED Requirements

### Requirement: Fifteen descriptions list the tiles in reading order

A Fifteen description SHALL be the board's `w·h` cells in reading order as
decimal numbers separated by commas, `0` standing for the gap and each other
number for the tile it shows. `newState` SHALL refuse a number above
`w·h − 1`, a number given twice, a list shorter or longer than the board, and
any other character. `hasNoSolution` SHALL hold for a board no slides can put
in order, so its description does not load.

#### Scenario: The board the first preset deals

- **WHEN** `2,7,0,8,1,5,3,6,4` is read for `3x3`
- **THEN** the top row is tiles 2 and 7 and then the gap, the middle row 8, 1
  and 5, and the bottom row 3, 6 and 4

#### Scenario: A tile given twice

- **WHEN** `2,7,0,8,1,5,3,6,2`, that board with its last number changed, is
  read for `3x3`
- **THEN** it is refused as giving the same number twice

#### Scenario: Two tiles exchanged

- **WHEN** `7,2,0,8,1,5,3,6,4`, that board with its first two tiles exchanged,
  is opened for `3x3`
- **THEN** it reads as a description and is refused as a puzzle with no
  solution
