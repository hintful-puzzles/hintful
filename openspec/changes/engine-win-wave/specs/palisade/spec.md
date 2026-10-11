## MODIFIED Requirements

### Requirement: A finished region and the solved flash cover the clue cells

A completed correct region SHALL fill whole, its clue cells included, with the
shared finished-region role. The win flash SHALL sweep the board's cells from
the bottom left to the top right, and a lit cell SHALL be filled with a
flash color in place of its region's fill and keep what it holds.

#### Scenario: A clue cell in a finished region takes the region's fill

- **WHEN** a region holding a clue is completed correctly
- **THEN** the clue's cell is drawn in the finished-region fill, not on the
  lifted surface
