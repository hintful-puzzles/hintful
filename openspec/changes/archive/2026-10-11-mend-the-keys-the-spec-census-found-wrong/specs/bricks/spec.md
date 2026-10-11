## ADDED Requirements

### Requirement: Ctrl or Shift with a Bricks move that paints nothing makes no move

Ctrl or Shift with a move SHALL name in its move only cells that take a color
and do not have the one asked for. Where that leaves none, the key SHALL make
no move: it SHALL be a cursor move where the cursor moved, and be declined
where it did not.

#### Scenario: Ctrl with an arrow off the board from a numbered cell

- **WHEN** the cursor is on a numbered cell at the board's edge and Ctrl is
  pressed with the arrow that points off the board
- **THEN** the game declines the key, and the board and the cursor are as
  they were
