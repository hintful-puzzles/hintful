## ADDED Requirements

### Requirement: Hint: Same Game has a hint that keeps the board clearable

Same Game SHALL have a hint. Each step SHALL offer a removal after which the
board can still be cleared, ring the group it removes, and say only what the
hint's search or a visible trap proves about it. It SHALL NOT speak of score.

#### Scenario: A hint on a dealt board

- **WHEN** a player presses Hint on a freshly dealt Same Game board
- **THEN** a step rings a group to remove, and removing it leaves a board
  that can still be cleared

#### Scenario: A square the last of its color

- **WHEN** a player asks for a hint where a square is the last of its color
- **THEN** the hint refuses as a dead end and outlines that square

### Requirement: Solver: Same Game's Solve empties the board

Same Game SHALL have a Solve, a move that empties the board and scores
nothing, given where a search clears the player's position or else the board
as dealt.

#### Scenario: Solve from a lost position

- **WHEN** the player's position cannot be cleared and the dealt board can
- **THEN** Solve empties the board
