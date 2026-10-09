## MODIFIED Requirements

### Requirement: Sokoban generation is deterministic

Sokoban generation SHALL use a reverse-move generator over the shared seeded RNG, so
that a given seed always produces the same board.

#### Scenario: The same seed reproduces the same board

- **WHEN** the same size and seed are used twice to generate a game
- **THEN** both runs produce the identical description

#### Scenario: A new game produces a solvable board

- **WHEN** a new game is generated at a legal size
- **THEN** a board is produced with exactly one player and at least one barrel and
  target, and the board is solvable (it is constructed by reversing a solution)
