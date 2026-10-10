## MODIFIED Requirements

### Requirement: The grid rim cannot be edited

`executeMove` SHALL reject a move that would toggle a grid-rim wall.

#### Scenario: Rim walls cannot be toggled

- **WHEN** a move would toggle a wall on the outer boundary of the grid
- **THEN** `executeMove` rejects it
