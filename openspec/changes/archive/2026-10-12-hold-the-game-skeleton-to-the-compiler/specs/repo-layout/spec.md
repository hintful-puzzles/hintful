## RENAMED Requirements

- FROM: `### Requirement: A scaffolding script stamps out a new game-port skeleton`
- TO: `### Requirement: A scaffolding script stamps out a new game from the skeleton`

- FROM: `### Requirement: The scaffold prints the edits that need judgment and performs none`
- TO: `### Requirement: The scaffold checks its copy and prints what it leaves undone`

## MODIFIED Requirements

### Requirement: A scaffolding script stamps out a new game from the skeleton

The repository SHALL hold a skeleton game under `src/skeleton/` as source the
gate's typecheck and test run read, and `scripts/new-game.sh <gameId>` SHALL
create `src/games/<gameId>/` and `help/games/<gameId>.md` as a renamed copy
of it. The skeleton SHALL NOT be registered as a game or shipped. The script
SHALL refuse to overwrite an existing game.

#### Scenario: Scaffolding a new game

- **WHEN** a contributor runs `scripts/new-game.sh singles`
- **THEN** `src/games/singles/` holds the skeleton's modules, tests and
  snapshots, named for the new game, and `help/games/singles.md` its help page
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

- **WHEN** the script is run with the id of a game that has a directory or a
  help page
- **THEN** it refuses and writes nothing

### Requirement: The scaffold checks its copy and prints what it leaves undone

The scaffolding script SHALL type-check, lint and test the copy it made and
fail if any does. It SHALL print, and SHALL NOT perform, what the copy leaves
undone: replacing the puzzle, registering the game in `src/games/index.ts`
and `src/puzzle/catalog-data.ts`, pinning its hint again, its help page's
words, its two icons and its spec. `docs/games/README.md` SHALL name the
skeleton as what a new game starts from.

#### Scenario: The copy is checked where it is made

- **WHEN** the script has written a game's files
- **THEN** it runs the typecheck, the linter and the copy's own tests
- **AND** it exits non-zero if any of them fails

#### Scenario: The checklist is printed, not performed

- **WHEN** the script finishes
- **THEN** it prints each remaining edit
- **AND** `src/games/index.ts`, the catalog and the icons are unchanged
