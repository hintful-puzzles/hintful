## ADDED Requirements

### Requirement: The completion flash lights the grid's squares

The completion flash SHALL sweep the grid's squares, and SHALL fill a lit
square with the flash color under its diagonal and its clue discs. The margin
round the grid, where the outer clues are drawn, SHALL never be lit.

#### Scenario: A square the highlight has not reached

- **WHEN** the flash is drawn before its highlight reaches a square
- **THEN** that square is drawn on the cell surface

## REMOVED Requirements

### Requirement: The completion flash lifts the squares in three phases

**Reason**: The win flash's rhythm is the engine's (`ts-engine`, "The win flash
is one traveling highlight in every game"), and so is its color, so no game
has phases or a lifted surface of its own. What is Slant's, which squares
light, is "The completion flash lights the grid's squares".

**Migration**: None. Nothing a player holds refers to the flash.
