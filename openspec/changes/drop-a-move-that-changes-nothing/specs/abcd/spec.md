## ADDED Requirements

### Requirement: Clearing an ABCD cell that holds only marks is a move

Clearing an empty cell that carries marks SHALL be a real move, because it
wipes them.

#### Scenario: Clearing a cell that holds only marks is a real move

- **WHEN** an empty cell carrying pencil marks is cleared
- **THEN** a move is produced, and undoing it restores the marks

## REMOVED Requirements

### Requirement: An ABCD entry that changes nothing is no move

**Reason**: Restated as "Clearing an ABCD cell that holds only marks is a move", which keeps ABCD's own case. That re-entering the letter a cell holds, or clearing an empty cell with no marks, costs no step of Undo is `ts-engine`, "A move that leaves the board as it was is no step of the history". The title and the scenario "Re-entering the letter already present costs no undo step" said only that, so the title changes and the scenario goes.
