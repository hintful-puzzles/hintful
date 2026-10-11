## MODIFIED Requirements

### Requirement: The Range completion flash lifts every cell

The win flash SHALL sweep the board's cells from the bottom left to the top
right. A lit cell SHALL be lifted to the given's surface, a clue's cell SHALL
drop from it to the plain surface, and both SHALL keep what they hold.

#### Scenario: A flashing board keeps its pieces

- **WHEN** the win flash's highlight is on a shaded cell
- **THEN** the cell is the given's surface
- **AND** it still holds its piece
