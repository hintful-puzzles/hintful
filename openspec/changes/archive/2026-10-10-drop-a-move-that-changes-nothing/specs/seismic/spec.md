## ADDED Requirements

### Requirement: A Seismic digit above its region's size, or on a fixed clue, is refused

A digit SHALL be entered only when it does not exceed the selected cell's
region size, and SHALL NOT change a fixed clue.

#### Scenario: A digit above the region size is rejected

- **WHEN** the player types a digit larger than the selected cell's region size
- **THEN** the board is unchanged

## REMOVED Requirements

### Requirement: A digit is entered only where its region can hold it

**Reason**: Restated as "A Seismic digit above its region's size, or on a fixed clue, is refused", with its first sentence and the scenario "A digit above the region size is rejected" word for word. That the number a cell holds, or in pencil mode a clear on a cell with no notes, makes no step of Undo is `ts-engine`, "A move that leaves the board as it was is no step of the history". The scenario "Clearing notes a cell has not got leaves no history" said only that, and a scenario cannot be dropped from a requirement that keeps its title.
