## ADDED Requirements

### Requirement: A dealt Bricks board has a solution

The Bricks generator SHALL write out only a board its solver completes at the
difficulty asked for. Before it removes any number it SHALL solve the fully
numbered board, and SHALL start again when that solve does not complete.

The generator numbers the board twice: once from the bricks it laid, and again
after an Easy solve, when every square that solve left undecided becomes a
number. The second numbering changes the answer, and it can take away the brick
another brick rests on. Removing numbers keeps a removal only while the board
still solves, so it preserves a board that solves and cannot repair one that
does not.

#### Scenario: A board two squares wide loads from its own ID

- **WHEN** a board is dealt at a width of two and a height of four or more, at
  either difficulty
- **THEN** the solver completes it at that difficulty
- **AND** loading the board's game ID is accepted

#### Scenario: A board at the smallest height loads from its own ID

- **WHEN** a board is dealt at a height of two
- **THEN** loading the board's game ID is accepted
