## ADDED Requirements

### Requirement: The Pegs win flash lifts a playable cell

The win flash SHALL sweep the board's playable cells from the bottom left to
the top right, and a lit cell SHALL be drawn on the lifted surface. A square
that is off the board SHALL never be lit.

#### Scenario: A lit cell

- **WHEN** the win flash's highlight is on a playable cell
- **THEN** the cell is the lifted surface, its peg or hole drawn on it as usual

## REMOVED Requirements

### Requirement: The completion flash lifts every cell

**Reason**: The win flash is a highlight that travels the board (`ts-engine`,
"The win flash is one traveling highlight in every game"), so no frame of it
lifts every cell and it has no beats.

**Migration**: None. Nothing a player holds refers to the flash.
