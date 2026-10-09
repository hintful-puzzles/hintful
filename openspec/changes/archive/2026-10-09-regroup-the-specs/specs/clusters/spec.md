## MODIFIED Requirements

### Requirement: Clusters refuses to generate Normal on a board too small for it

Clusters SHALL refuse to generate at Normal on a board of fewer than 12
squares, or one whose shorter side is less than two, which is too small to
admit one. It SHALL
report this through parameter validation with `full` set, so that a saved game
or a game ID carrying its own description still loads at any size.

#### Scenario: A board too small for the harder tier refuses it

- **WHEN** a full, generation-capable parameter set requests the harder tier on a
  board admitting no such puzzle
- **THEN** parameter validation rejects it, naming the constraint
- **AND** the same parameters are accepted when a description is supplied instead
