## ADDED Requirements

### Requirement: Look: Salad draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each symbol that repeats in its row or column, the crosses of a
line holding more crosses than it has empty squares, and each border clue its
line can no longer show first (`Game.rules`).

#### Scenario: The first symbol in a clue's line is another

- **WHEN** the player enters, nearest a border clue in its line, a symbol
  other than the clue's
- **THEN** the border clue is drawn red

#### Scenario: Too many crosses in a line

- **WHEN** the player crosses more squares in a line than it has empty squares
- **THEN** each of its crosses is drawn red
