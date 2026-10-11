## MODIFIED Requirements

### Requirement: Singles completion flash

The completion flash SHALL sweep the cells that hold no piece, lifting the
surface of a lit one. A blackened cell SHALL never be lit, and its piece SHALL
be drawn as it was.

#### Scenario: A hand-made completion flashes

- **WHEN** the player's own move completes the board
- **THEN** the flash plays on the surface of every cell that holds no piece
- **AND** a blackened cell's piece is drawn as it was
