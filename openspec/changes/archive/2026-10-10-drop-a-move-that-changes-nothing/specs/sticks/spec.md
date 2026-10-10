## ADDED Requirements

### Requirement: A Sticks block takes no line

Blocks SHALL never take a line.

#### Scenario: A line key on a block

- **WHEN** the key that places a vertical line is pressed with the cursor on a
  block
- **THEN** no move is made

## REMOVED Requirements

### Requirement: A block takes no line, and a no-op is not a move

**Reason**: Restated as "A Sticks block takes no line", which keeps the game's own rule. That placing a line a cell already holds does not reach the undo history is `ts-engine`, "A move that leaves the board as it was is no step of the history". The second half of the title and the one scenario, "A key that would change nothing makes no move", said only that; the new scenario is about the block.
