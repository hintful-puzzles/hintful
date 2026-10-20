## ADDED Requirements

### Requirement: Hint: A shaded premise of a Range hint takes a doubled outline

The cited shaded square of an `adjacency` deduction SHALL take a doubled
outline in `COL_HINT_CELL`, and keep its piece.

#### Scenario: A cited black square is outlined apart from the forced cell

- **WHEN** an `adjacency` hint is displayed (a shaded square forces an adjacent
  cell to be not shaded)
- **THEN** the cited shaded premise takes a doubled outline in `COL_HINT_CELL`
  and the forced cell is ringed `COL_HINT`

## REMOVED Requirements

### Requirement: Hint: A shaded premise of a Range hint takes a color of its own

**Reason**: A premise's color is the engine's; the game draws it in its
outline slot.

**Migration**: Requirement "Hint: A shaded premise of a Range hint takes a
doubled outline".
