## MODIFIED Requirements

### Requirement: Solver: Bricks knows a board's answer from the search beneath its ladder

Solve, the hint's refusal and the mistake check SHALL know a board's answer from the engine's search by trial and error over the ladder, whatever tier the board was dealt at, and a board the search finds no one answer SHALL be one Solve refuses and the hint does not plan on.

#### Scenario: Solve on an upstream Tricky board

- **WHEN** the player asks for the solution of one of the Tricky boards upstream's generator dealt
- **THEN** the board is solved
