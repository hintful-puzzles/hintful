## ADDED Requirements

### Requirement: A game's spec is ordered by subject

The title of every requirement in a game's capability SHALL lead with its
subject and a colon. The subject SHALL be one of Rules, Params, Description,
Generation, Solver, Controls, Preferences, Hint, Status bar and Look, and the
requirements SHALL stand in that order, so that work on one concern of a game
reads that concern's requirements and not the file.

#### Scenario: Work on a game's hint

- **WHEN** a session is about to change how a game's hint words a step
- **THEN** the requirements it has to read are the ones titled `Hint:`, which
  stand together

#### Scenario: A requirement about two subjects

- **WHEN** a requirement says which cells are mistakes and also how one is
  drawn
- **THEN** it is filed under one subject by `docs/new-game.md` § "What a
  game's spec holds", here Rules

### Requirement: The gate holds a game's spec to its subjects and to what its game owes

The gate SHALL fail when a game has no spec, when a requirement's title in a
game's spec leads with no subject, and when the subjects are out of order. It
SHALL fail when a game's spec has no requirement under Rules, Params,
Description or Controls, none under Hint for a game with `hint`, none under
Status bar for one with `statusbarText`, or none under Generation for one with
`difficulty`, reading what a game has from the record of each `Game` object
that a test holds to it.

#### Scenario: A change adds a requirement to a game's spec

- **WHEN** a change is archived whose delta adds a `Controls:` requirement to
  a game's spec, which the archive appends after the `Look:` requirements
- **THEN** the commit fails the gate until the spec is put in order, which
  `node scripts/checks/spec-subjects.mjs --fix` does without changing a word

#### Scenario: A new game's spec leaves out its hint

- **WHEN** a game is added with a `hint` and its spec has no `Hint:`
  requirement
- **THEN** the gate fails, naming the spec and the subject

#### Scenario: A requirement is filed under the wrong subject

- **WHEN** a requirement about a drag is titled `Look:`
- **THEN** the gate passes, since it reads the title and not the body, and
  the session that reads the spec moves it
