## ADDED Requirements

### Requirement: Look: Seismic draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each entered number that repeats in its area, that sits within an
equal number's keep-apart range (Seismic's along its row and column, Tectonic's
the eight squares around), or that is larger than its area holds
(`Game.rules`).

#### Scenario: Two equal numbers too close

- **WHEN** the player enters a 2 one square from another 2 along a row of a
  Seismic board
- **THEN** both are drawn red
