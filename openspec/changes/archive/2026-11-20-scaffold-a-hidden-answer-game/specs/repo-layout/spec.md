## ADDED Requirements

### Requirement: A hidden-answer game is stamped from a skeleton of its own

The repository SHALL hold a third skeleton, `src/skeleton/code/`, a small game whose answer is hidden and found by guessing rows scored against it, written on the engine's working row and answer row of rule-outs (`code-rows.ts`), with a hint that rules out what the scores prove and then counts a guess. It SHALL have no generator and no solver, its answer being the desc, and `scripts/new-game.sh <gameId> code` SHALL stamp a game from it as it does from the grid skeleton.

#### Scenario: Scaffolding a hidden-answer game

- **WHEN** a contributor runs `scripts/new-game.sh mind code`
- **THEN** `src/games/mind/` holds the code skeleton's modules and tests, named for the new game, and the copy plays
- **AND** its catalog entry is in the Hidden information family

#### Scenario: The hint is held to the kind's walk

- **WHEN** the skeleton's tests run
- **THEN** a plan followed from the first guess finds every code of every preset within its rows
- **AND** every code that fits the scores at a position is given the same plan there

## MODIFIED Requirements

### Requirement: The scaffold registers its copy and owes its spec

The scaffolding script SHALL register the copy in `src/games/index.ts` and
`src/puzzle/catalog-data.ts`, the entry describing the skeleton's puzzle in
the catalog family the skeleton's kind names, so that every cross-game guard
reads the game from its first verdict. Where the game's change
`openspec/changes/add-<gameId>/` declares `skip_specs`, the script SHALL
remove it.

#### Scenario: The game is registered by the scaffold

- **WHEN** the script finishes
- **THEN** the game is in the registry and the catalog
- **AND** `npm run game -- <gameId>` runs every cross-game guard's case for
  it, naming every record it owes in one run

#### Scenario: The change owes the spec

- **WHEN** the script is run for a game whose change declares `skip_specs`
- **THEN** the change no longer declares it, and the verdict names the spec
  as owed from its first run

#### Scenario: The family is the catalog's

- **WHEN** a skeleton's description names a family the catalog does not have,
  as the code skeleton's `code` is not one
- **THEN** the copy's catalog entry carries its kind's catalog family, and the
  copy typechecks
