# engine-hints Specification Delta — share-edge-hint-marks

## ADDED Requirements

### Requirement: An edge a hint names is the engine's mark

The engine SHALL provide the mark kind for an edge between two squares, keyed by its edge number, and the drawing of a hint on it: the line or cross the step asks for in the hint color, an outlined edge in the outline's color, and a chain's ordinal inside a square beside it. A square-grid edge game SHALL draw its hint edges through it, declaring only how its own line and cross are drawn.

#### Scenario: One edge named from either side is one mark

- **WHEN** a step's words name an edge from the square on each side of it
- **THEN** the step marks one edge, and the frame draws it once
