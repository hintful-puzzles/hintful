## MODIFIED Requirements

### Requirement: Singles completion flash

The completion flash SHALL sweep every cell of the board. A lit cell's ground
SHALL be filled with the flash color, and what the cell holds, its number, a
kept cell's ring and a blackened cell's piece, SHALL be drawn over it as on
any other frame.

#### Scenario: A hand-made completion flashes

- **WHEN** the player's own move completes the board
- **THEN** the flash plays on the ground of every cell, a blackened one's
  showing round its piece
- **AND** a blackened cell's piece is drawn as it was
