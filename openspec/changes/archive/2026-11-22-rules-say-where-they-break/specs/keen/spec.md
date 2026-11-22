## ADDED Requirements

### Requirement: Look: Keen draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each digit that repeats in its row or column, and the clue of each
cage whose digits can no longer make it (`Game.rules`), counting each open
square of the cage as any digit it could still hold.

#### Scenario: A sum cage overshot before it is full

- **WHEN** the player puts a digit in a `+` cage so large that the cage's
  open squares, holding 1 each, would take it past its clue
- **THEN** the cage's clue is drawn red while its other squares are still
  open

#### Scenario: A repeated digit

- **WHEN** the same digit is placed twice in a row
- **THEN** both are drawn red
