## MODIFIED Requirements

### Requirement: Solver: Sticks' ladder reads a number's room as the cells its line could still take

A number's room SHALL be the run through it, along its line's way, of the cells that are no block, hold no line the other way, and with a line that way would carry no number but its own; the length clue's meaning SHALL read room the same way, so the live error marks read it on the board as it stands.

#### Scenario: A line beside another number's line is no room

- **WHEN** a 3 has a horizontal line, and the blank square beside it has, beyond it, a horizontal line carrying a 1
- **THEN** that blank square is not counted as the 3's room

## ADDED Requirements

### Requirement: Look: Sticks draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each number the board breaks (`Game.rules`): a number on a line
longer than it, on a line carrying another number, or on a line whose room
is shorter than it; and, as a badge, a number on a block with more lines run
into it than it counts, or fewer sides left that a line could still run in
from.

#### Scenario: A line walled in short of its number

- **WHEN** a 3 is given a line across, with a block two squares to one side
  and a numbered square beside it on the other
- **THEN** the 3 is drawn red while the square between it and the block is
  still open
