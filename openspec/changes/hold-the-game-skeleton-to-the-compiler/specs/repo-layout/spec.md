## MODIFIED Requirements

### Requirement: A scaffolding script stamps out a new game-port skeleton

The repository SHALL hold a skeleton game as TypeScript source that the
gate's typecheck reads, and `scripts/new-game-port.sh <gameId>` SHALL create
`src/games/<gameId>/` as a renamed copy of it, with its tests. The skeleton
SHALL NOT be registered as a game or shipped. The script SHALL refuse to
overwrite an existing game directory.

#### Scenario: Scaffolding a new game

- **WHEN** a contributor runs `scripts/new-game-port.sh singles`
- **THEN** `src/games/singles/` holds the skeleton's modules and tests, named
  for the new game
- **AND** the emitted files type-check and lint clean, and its tests pass

#### Scenario: The contract moves under the skeleton

- **WHEN** a member of `Game` that the skeleton does not have becomes required
- **THEN** the typecheck fails on the skeleton, before any game is stamped

#### Scenario: The game directory already exists

- **WHEN** the script is run with the id of a game that has a directory
- **THEN** it refuses and writes nothing
