## MODIFIED Requirements

### Requirement: A scaffolding script stamps out a new game from the skeleton

The repository SHALL hold a skeleton game under `src/skeleton/` as source the
gate's typecheck and test run read, and `scripts/new-game.sh <gameId>` SHALL
create `src/games/<gameId>/` as a renamed copy of it, its description and the
help page that description carries included, and its stored snapshots left
out. The skeleton SHALL NOT be registered as a game or shipped. The script
SHALL refuse to overwrite an existing game.

#### Scenario: Scaffolding a new game

- **WHEN** a contributor runs `scripts/new-game.sh singles`
- **THEN** `src/games/singles/` holds the skeleton's modules and tests, named
  for the new game, and `singles.description.yaml` its help page
- **AND** the copy registers itself as `singles`
- **AND** its snapshots are written by its own tests, not copied

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

### Requirement: The scaffold checks its copy and prints what it leaves undone

The scaffolding script SHALL register the copy in `src/games/index.ts` and
`src/puzzle/catalog-data.ts`, the entry describing the skeleton's puzzle in
the family the copy's description names, so that every cross-game guard reads
the game from its first verdict. Where the game's change
`openspec/changes/add-<gameId>/` declares `skip_specs`, the script SHALL
remove it. It SHALL type-check, lint and test the copy and fail if any does.
It SHALL print, and SHALL NOT perform, what the copy leaves undone: running
the game's verdict first, replacing the puzzle and the catalog entry's words,
pinning its hint again, its help page's words, its two icons and its spec.
`docs/new-game.md` SHALL name the skeleton as what a new game starts from,
and SHALL run the game's verdict straight after the scaffold.

#### Scenario: The copy is checked where it is made

- **WHEN** the script has written a game's files
- **THEN** it runs the typecheck, the linter and the copy's own tests
- **AND** it exits non-zero if any of them fails

#### Scenario: The game is registered by the scaffold

- **WHEN** the script finishes
- **THEN** the game is in the registry and the catalog
- **AND** `npm run game -- <gameId>` runs every cross-game guard's case for
  it, naming every record it owes in one run

#### Scenario: The change owes the spec

- **WHEN** the script is run for a game whose change declares `skip_specs`
- **THEN** the change no longer declares it, and the verdict names the spec
  as owed from its first run

#### Scenario: The checklist is printed, not performed

- **WHEN** the script finishes
- **THEN** it prints each remaining edit, the verdict first
- **AND** the icons and the help page's words are unchanged
