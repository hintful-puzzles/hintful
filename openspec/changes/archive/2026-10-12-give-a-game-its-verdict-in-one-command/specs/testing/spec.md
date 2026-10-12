## ADDED Requirements

### Requirement: One command gives a game its verdict

The repository SHALL provide `npm run game -- <id>` (`scripts/game.ts`), which
runs the typecheck, biome over the game's directory, and every test file that
reaches a path of the game, less the other games' own, scoped to the game as
the per-commit hook scopes a commit that stages it. It SHALL run every step
whatever an earlier one found, and SHALL write nothing in the repository.

#### Scenario: A game owes three guards something

- **WHEN** a game leaves a hint rung unpinned, fills the cell its hint acts
  on, and offers an on-screen key it does not read, and the command is run
- **THEN** one run names all three refusals and exits nonzero

#### Scenario: A game that is not there

- **WHEN** the command is given an id with no directory under `src/games/`
- **THEN** it says so and runs nothing

### Requirement: The verdict command reports a refusal with the sections its guard cites

For each test file outside the game's directory that refuses the game, the
command SHALL print the guide sections that file cites, read from the file's
own text by the reader the guide-section check uses. It SHALL keep no table
of which guard means which section. For a guard that cites none it SHALL say
that the guard's header states what it asks.

#### Scenario: A guard is renamed or its section reworded

- **WHEN** a guide heading a guard cites is reworded
- **THEN** the guide-section check fails until the guard's citation follows
- **AND** the command prints the new heading with no edit to the command

### Requirement: The verdict command says what it did not run

The command SHALL end by stating what a green result does not cover: the
cases of the other games and the checks over the whole collection, counted
from the run, the later boards of each kind that CI walks, the gate's checks
that read no game, the production build, and the running app.

#### Scenario: A clean game

- **WHEN** the command passes for a game
- **THEN** its last lines name each of those, with the count of cases skipped
- **BECAUSE** a green result here is a commit's and would otherwise be read
  as the gate's
