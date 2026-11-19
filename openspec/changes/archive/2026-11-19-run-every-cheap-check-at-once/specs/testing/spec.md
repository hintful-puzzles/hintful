## MODIFIED Requirements

### Requirement: One command gives a game its verdict

The repository SHALL provide `npm run game -- <id>` (`scripts/game.ts`), which
runs every fast check of the gate over what the working tree changed (`npm run
fast-checks`), and every test file that reaches a path of the game, less the
other games' own, scoped to the game as the per-commit hook scopes a commit
that stages it. It SHALL run every step whatever an earlier one found, and
SHALL write in the repository only the fast checks' mechanical fixes.

#### Scenario: A game owes three guards something

- **WHEN** a game leaves a hint rung unpinned, fills the cell its hint acts
  on, and offers an on-screen key it does not read, and the command is run
- **THEN** one run names all three refusals and exits nonzero

#### Scenario: A game that is not there

- **WHEN** the command is given an id with no directory under `src/games/`
- **THEN** it says so and runs nothing

#### Scenario: A game's work touches an engine file

- **WHEN** a game's work leaves an engine file it changed unformatted, and
  the command is run
- **THEN** the file is formatted and named, as the commit would have refused it

### Requirement: The verdict reads a game's files before git tracks them

The gate's fast checks run ahead of a commit (`npm run fast-checks`, and the
verdict command through it) SHALL read the files git does not track yet as
well as those it tracks, and the gate's SHALL NOT, since an untracked file is
left out of a commit.

#### Scenario: A game not yet added to git

- **WHEN** a game's files are untracked and one exports what nothing imports
- **THEN** the command's unused-export check names that export
