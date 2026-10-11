## MODIFIED Requirements

### Requirement: The Range completion flash lifts every cell

The win flash SHALL sweep the board's cells from the bottom left to the top
right. A lit cell SHALL be filled with the flash color, a clue's cell like any
other, and SHALL keep what it holds.

#### Scenario: A flashing board keeps its pieces

- **WHEN** the win flash's highlight is on a shaded cell
- **THEN** the cell is the flash color
- **AND** it still holds its piece
