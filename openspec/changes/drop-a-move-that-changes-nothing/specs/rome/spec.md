## ADDED Requirements

### Requirement: A Rome press on a fixed clue or outside the grid grabs nothing

A press on a fixed clue or a press outside the grid SHALL produce no state
change and no history entry. The line round the grid belongs to the square it
bounds, and the margin beyond that line is outside the grid, for a press and
for the release that ends it alike.

#### Scenario: A fixed clue cannot be grabbed

- **WHEN** a square holding a fixed arrow is pressed
- **THEN** no move is made and the board is unchanged

#### Scenario: A tap in the margin beside the first column

- **WHEN** a press and release land left of the grid's outline, level with a
  row whose first square is empty
- **THEN** nothing is grabbed, and no arrow is placed in that square

## REMOVED Requirements

### Requirement: An input that changes nothing adds no history

**Reason**: Restated as "A Rome press on a fixed clue or outside the grid grabs nothing", which keeps Rome's own refusals, the rule about the line round the grid, and the scenarios "A fixed clue cannot be grabbed" and "A tap in the margin beside the first column" word for word. That a placement repeating the arrow a square holds, or a clear of a square with nothing to clear, adds no history is `ts-engine`, "A move that leaves the board as it was is no step of the history". The title and the scenario "Clear where there is nothing to clear" said only that, so the title changes and the scenario goes.
