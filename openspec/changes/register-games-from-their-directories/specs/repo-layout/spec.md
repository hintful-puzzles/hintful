## ADDED Requirements

### Requirement: A game is registered by its directory

A game SHALL be registered and cataloged by files in its own directory
alone: its `index.ts` registers the game, and its `catalog.ts` exports its
catalog entry, whose shape `src/engine/catalog.ts` declares. No shared file
SHALL list the games. Loading the games SHALL fail when a directory under
`src/games/` registers no game under its own name or has no `catalog.ts`, or
when a `catalog.ts` sits in a directory with no `index.ts`.

#### Scenario: A game directory has no catalog entry

- **WHEN** a directory under `src/games/` has an `index.ts` and no
  `catalog.ts`
- **THEN** importing `src/games/index.ts` throws, naming the directory
- **AND** the Vite config fails to load

#### Scenario: A game registers under another name

- **WHEN** a directory's `index.ts` registers no game whose id is the
  directory's name
- **THEN** importing `src/games/index.ts` throws, naming the directory

## MODIFIED Requirements

### Requirement: The scaffold registers its copy and owes its spec

The scaffolding script SHALL register the copy by writing its
`src/games/<gameId>/catalog.ts` and the `registerGame` call at the end of its
`index.ts`, and SHALL edit no shared file to do it. The entry describes the
skeleton's puzzle in the catalog family the skeleton's kind names, so that
every cross-game guard reads the game from its first verdict. Where the
game's change `openspec/changes/add-<gameId>/` declares `skip_specs`, the
script SHALL remove it.

#### Scenario: The game is registered by the scaffold

- **WHEN** the script finishes
- **THEN** the game is in the registry and the catalog
- **AND** no file outside the game's directory was edited to put it there
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
