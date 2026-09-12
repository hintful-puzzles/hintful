## ADDED Requirements

### Requirement: Sokoban generation is deterministic

Sokoban generation SHALL use a reverse-move generator over the shared seeded RNG,
so that a given seed always produces the same board
and shared game IDs remain reproducible. Generation SHALL NOT be gated by a solver,
because the level is solvable by construction.

#### Scenario: The same seed reproduces the same board

- **WHEN** the same size and seed are used twice to generate a game
- **THEN** both runs produce the identical description

## REMOVED Requirements

### Requirement: Sokoban generation is deterministic and faithful

**Reason**: It required a faithful port of upstream's generator over the C-identical RNG. That was a porting-era obligation: C compatibility is no longer a concern (owner, 2026-09-13), so a requirement may not hold the game to it.

**Migration**: Replaced by "Sokoban generation is deterministic", which keeps determinism and reproducible game IDs without the obligation to match upstream's C. The frozen differential fixtures remain as tests, not as a requirement.
