## MODIFIED Requirements

### Requirement: A scaffolding script stamps out a new game from the skeleton

The repository SHALL hold a skeleton game under `src/skeleton/` as source the
gate's typecheck and test run read, and `scripts/new-game.sh <gameId>` SHALL
create `src/games/<gameId>/` as a renamed copy of it, its description and the
help page that description carries included. The skeleton SHALL NOT be
registered as a game or shipped. The script SHALL refuse to overwrite an
existing game.

#### Scenario: Scaffolding a new game

- **WHEN** a contributor runs `scripts/new-game.sh singles`
- **THEN** `src/games/singles/` holds the skeleton's modules, tests and
  snapshots, named for the new game, and `singles.description.yaml` its help
  page
- **AND** the copy registers itself as `singles`

#### Scenario: The contract moves under the skeleton

- **WHEN** a member of `Game` that the skeleton does not have becomes required
- **THEN** the gate's typecheck fails on the skeleton, before any game is
  stamped

#### Scenario: The skeleton is not a game of the collection

- **WHEN** the suite runs and the app is built
- **THEN** no registry-derived guard has the skeleton in its population
- **AND** the bundle does not contain it

#### Scenario: The game directory already exists

- **WHEN** the script is run with the id of a game that has a directory
- **THEN** it refuses and writes nothing
