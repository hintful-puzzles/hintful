## ADDED Requirements

### Requirement: The engine divides a grid into regions of unequal size

The engine SHALL provide the division of a rectangular grid into connected
regions whose sizes differ, with the game supplying only its own rule: which
neighboring regions may join, or how far a region may grow. A game whose
regions differ in size SHALL take its division from the engine, or SHALL
state what its division does that the engine's cannot.

#### Scenario: A game forbids a merge

- **WHEN** a game's rule refuses to join two neighboring regions
- **THEN** no region of the division holds cells from both

#### Scenario: A rule that cannot be met

- **WHEN** a game's rule leaves no division of the grid
- **THEN** the division reports that it failed, and does not loop
