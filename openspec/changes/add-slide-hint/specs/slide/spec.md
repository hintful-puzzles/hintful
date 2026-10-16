## ADDED Requirements

### Requirement: Hint: Slide has a hint that says why its move is the one to make

Slide SHALL have a hint. Each step SHALL offer a move toward the exit and say
what the hint's search proves about it, in words the player can check on the
board, and SHALL mark the block it moves.

#### Scenario: A hint on a dealt board

- **WHEN** a player presses Hint on a freshly dealt Slide board
- **THEN** a step names a move, marks its block, and says what makes it the
  move to make
