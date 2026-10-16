## ADDED Requirements

### Requirement: Hint: Twiddle has a hint that says what each rotation achieves

Twiddle SHALL have a hint, in every variant of its params. Each step SHALL
offer a rotation, mark the block it turns and the tile it serves, and say what
the rotation achieves toward the solved order.

#### Scenario: A hint on a dealt board

- **WHEN** a player presses Hint on a freshly dealt Twiddle board
- **THEN** a step names a rotation, marks its block, and says which tile it
  brings toward its place
