## ADDED Requirements

### Requirement: Look: Towers draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each tower whose height repeats in its row or column, and each
clue whose line can no longer show its count (`Game.rules`), reading every
tower its line already holds, open squares before them included.

#### Scenario: A clue that sees its count with the tallest still to come

- **WHEN** a 4×4 row's left clue is 2 and the player enters 2 and then 3 in
  its first two squares
- **THEN** the clue is drawn red while the row's other squares are open,
  since the 4 still to come would be a third tower seen

#### Scenario: A tower past an open square

- **WHEN** a 4×4 line's clue is 4, its nearest square is open, and its
  second square holds a 4
- **THEN** the clue is drawn red, since it can see at most the open square's
  tower and the 4, and nothing beyond the 4
