## ADDED Requirements

### Requirement: Solo's single-digit pattern step marks the lines it read

A Solo hint step that strikes a candidate because one digit is confined, across
several lines, to a pattern of cells SHALL mark every cell the deduction read:
the cells the digit is left with, and the other cells of the lines that confine
it. Its narration SHALL point at those marks, and SHALL name the confined lines
as rows or columns according to the firing.

#### Scenario: A replay from the marked cells reaches the same strike

- **WHEN** the premise audit replays a single-digit pattern firing from only
  the cells its step marks
- **THEN** the firing strikes the same candidates
- **AND** no ledger entry excuses it

#### Scenario: The player can check the step from the frame

- **WHEN** the hint shows a single-digit pattern step
- **THEN** each line the sentence speaks of is marked on the board
- **AND** the cells the digit is left with are told apart from the rest of
  those lines
