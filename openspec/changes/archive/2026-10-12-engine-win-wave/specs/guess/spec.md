## ADDED Requirements

### Requirement: Guess's win flash sweeps the whole board

The win flash SHALL sweep every peg position of the board diagonally: each
guess row's, played or not, and the answer's, counted as the row under the
last guess. A lit position's box SHALL be filled with a flash color, an empty
hole with it and a peg keeping its color. Empty holes light because a quick win
leaves the winning row and the answer a board apart. The feedback pegs SHALL
not be lit.

#### Scenario: A win on the first guess

- **WHEN** the first guess is the answer and frames of the flash are drawn
  from start to end
- **THEN** the highlight sets off from the answer's first peg, crosses the
  empty rows, and ends on the last peg of the first row, with something lit at
  every frame between
