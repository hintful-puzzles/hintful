## ADDED Requirements

### Requirement: The completion flash lifts the squares

The completion flash SHALL sweep the grid's squares, and SHALL lift a lit
square to the given's surface under its diagonal. The margin round the grid,
where the outer clues are drawn, SHALL never be lit.

#### Scenario: A square the highlight has not reached

- **WHEN** the flash is drawn before its highlight reaches a square
- **THEN** that square is drawn on the cell surface

## REMOVED Requirements

### Requirement: The completion flash lifts the squares in three phases

**Reason**: The win flash's rhythm is the engine's (`ts-engine`, "The win flash
is one traveling highlight in every game"), so no game has phases of its own.
What is Slant's, the lifted square, is "The completion flash lifts the
squares".

**Migration**: None. Nothing a player holds refers to the flash.
