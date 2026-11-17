## MODIFIED Requirements

### Requirement: One command gives a game its verdict

The repository SHALL provide `npm run game -- <id>` (`scripts/game.ts`), which
runs the typecheck, biome over the game's directory, and every test file that
reaches a path of the game, less the other games' own, scoped to the game as
the per-commit hook scopes a commit that stages it. Its checks that list the
files git tracks SHALL read the game's files git does not track yet as well,
and the gate's SHALL NOT. It SHALL run every step whatever an earlier one
found, and SHALL write nothing in the repository.

#### Scenario: A game owes three guards something

- **WHEN** a game leaves a hint rung unpinned, fills the cell its hint acts
  on, and offers an on-screen key it does not read, and the command is run
- **THEN** one run names all three refusals and exits nonzero

#### Scenario: A game that is not there

- **WHEN** the command is given an id with no directory under `src/games/`
- **THEN** it says so and runs nothing

#### Scenario: A game not yet added to git

- **WHEN** a game's files are untracked and one exports what nothing imports
- **THEN** the command's unused-export check names that export

## ADDED Requirements

### Requirement: A rung with no pin fails its hint test, not the typecheck

`describeHintPins` SHALL let a kind's pin be missing from its `pins` object in
the types, and SHALL refuse a pin under a name that is no kind. A kind with
no pin SHALL fail the file's "every kind's pin fires its kind" test, naming
the `npm run hint-scan` command for the file.

#### Scenario: A new game renames its rungs

- **WHEN** a game's rungs are renamed and its hint test's pins are not yet
  scanned
- **THEN** the typecheck passes
- **AND** the hint test fails, naming the command that writes the pins
