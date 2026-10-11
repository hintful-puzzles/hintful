## ADDED Requirements

### Requirement: Range's rules conclude no less from a board that says more

The deductive solver SHALL finish every board it finishes from the clues
alone when cells are first marked as the answer has them. A clue's run in a
direction SHALL be bounded by the furthest place it can end: before a cell
that is not known to be white, with the clue's other runs no longer than the
white cells they already hold.

#### Scenario: A white mark inside a clue's gap

- **WHEN** on the 6×9 board `4j5a9b7b11a7j12a11b9b6a4j7` the cell in row 5,
  column 5, counted from 0, is marked white before anything else
- **THEN** the rules set row 8, column 4 white and go on to decide every cell

#### Scenario: Any one right mark on a dealt board

- **WHEN** one cell of a dealt Easy board is marked as the answer has it and
  the solver runs
- **THEN** it decides every cell as the answer has it, whichever cell it was

#### Scenario: A hint asked after a right entry

- **WHEN** a player marks a cell as the answer has it on an Easy board and
  asks for hints until none is left
- **THEN** the board is solved and no hint was refused
