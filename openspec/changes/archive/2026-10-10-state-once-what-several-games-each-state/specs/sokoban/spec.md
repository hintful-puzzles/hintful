## ADDED Requirements

### Requirement: Sokoban generates a board by reversing a solution

Sokoban generation SHALL use a reverse-move generator, so that every board it
deals is solvable.

#### Scenario: A new game produces a solvable board

- **WHEN** a new game is generated at a legal size
- **THEN** a board is produced with exactly one player and at least one barrel and
  target, and the board is solvable (it is constructed by reversing a solution)

## REMOVED Requirements

### Requirement: Sokoban generation is deterministic

**Reason**: Restated as "Sokoban generates a board by reversing a solution". The title and the purpose clause ("over the shared seeded RNG, so that a
given seed always produces the same board") are `engine-difficulty`, "A
generator's board depends only on its params and its random state", and so is
the scenario "The same seed reproduces the same board". What is Sokoban's own
is the reverse-move generator and what it buys, which the scenario that stays
already said. Nothing cites the title. Read `sokobanGenerate` in
`src/games/sokoban/generator.ts`: its only draws are `randomUpto` on the
state it is handed.
