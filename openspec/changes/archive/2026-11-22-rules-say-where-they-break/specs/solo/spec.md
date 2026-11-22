## ADDED Requirements

### Requirement: Look: Solo draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each number that repeats in its row, column, block, diagonal (on
an X board) or cage (on a Killer board), and the outline and total of each
cage whose numbers can no longer make its total (`Game.rules`), counting each
open cell of the cage as any number it could still hold.

#### Scenario: A cage overshot before it is full

- **WHEN** the player puts a number in a cage so large that the cage's open
  cells, holding 1 each, would take it past its total
- **THEN** the cage's outline and total are drawn red while its other cells
  are still open

#### Scenario: A number repeated in a cage

- **WHEN** the same number is placed in two cells of one cage
- **THEN** both are drawn red
