## RENAMED Requirements

- FROM: `### Requirement: A premise that asserts a walk is computed and numbered`
- TO: `### Requirement: A premise that asserts a walk is computed and outlined`

## MODIFIED Requirements

### Requirement: A premise that asserts a walk is computed and outlined

A premise that asserts a walk SHALL be computed and checked, not assumed, and
SHALL be presented to the player as an outlined area holding the cells of that
walk, with no number on them, so the walk is one they can follow from where the
sentence starts it.

#### Scenario: The walk a sentence names is on the board

- **WHEN** a strike's premise says that following a candidate leads back to the
  cell it started from
- **THEN** the cells of that walk are the ones found on this board, outlined,
  and none carries a number
