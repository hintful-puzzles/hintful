## MODIFIED Requirements

### Requirement: Rules: Boats flags a broken rule as the player plays

The game SHALL flag live, once the board makes each certain: a line whose
count is broken, its number in the error color; two boats touching even
diagonally; a boat, or a run longer than the fleet's longest, of a size the
fleet cannot accommodate; and a segment contradicting a given clue. On a
board the puzzle's solver completes, a board the live flags mark SHALL be a
board on which `findMistakes` reports a cell.

#### Scenario: A row whose count is exceeded is flagged

- **WHEN** more boat segments are placed in a row than its occupancy clue allows
- **THEN** the row's count is shown in the error color, and `findMistakes`
  reports at least one of the row's cells

#### Scenario: A run too long is flagged with its ends open

- **WHEN** the fleet's longest boat has three squares and the player places
  four segments in a row, the squares round them still open
- **THEN** each of the four is marked as a boat the fleet cannot accommodate
