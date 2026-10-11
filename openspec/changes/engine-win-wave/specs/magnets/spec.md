## ADDED Requirements

### Requirement: Magnets' win flash lights a domino whole

The win flash SHALL sweep the dominoes diagonally, a domino's position being
the middle of its two squares, so both squares light and go dark together. A
lit domino SHALL be framed in the flash color round its own fill.

#### Scenario: A domino across two diagonals

- **WHEN** the flash's highlight reaches a horizontal domino
- **THEN** both of its squares are framed in the same frame, though one is a
  diagonal ahead of the other
