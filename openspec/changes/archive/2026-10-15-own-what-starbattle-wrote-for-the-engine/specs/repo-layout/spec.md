## MODIFIED Requirements

### Requirement: The gate holds a game's spec to its subjects and to what its game owes

The gate SHALL fail when a game has no spec, when a requirement's title in a
game's spec leads with no subject, and when the subjects are out of order. A
game whose spec is only in an open change's delta SHALL be held through that
delta. It SHALL fail when a game's spec has no requirement under Rules,
Params, Description or Controls, none under Hint for a game with `hint`,
none under Status bar for one with `statusbarText`, or none under Generation
for one with `difficulty`, reading what a game has from the record of each
`Game` object that a test holds to it.

#### Scenario: A change adds a requirement to a game's spec

- **WHEN** a change is archived whose delta adds a `Controls:` requirement to
  a game's spec, which the archive appends after the `Look:` requirements
- **THEN** the commit fails the gate until the spec is put in order, which
  `node scripts/checks/spec-subjects.mjs --fix` does without changing a word

#### Scenario: A new game's spec leaves out its hint

- **WHEN** a game is added with a `hint` and its spec has no `Hint:`
  requirement
- **THEN** the gate fails, naming the spec and the subject

#### Scenario: A new game waits on the owner's acceptance

- **WHEN** a game is committed while the change that adds it is open, and its
  spec is that change's delta
- **THEN** the gate holds the delta to the subjects, and archiving the change
  merges it as any delta is merged

#### Scenario: A requirement is filed under the wrong subject

- **WHEN** a requirement about a drag is titled `Look:`
- **THEN** the gate passes, since it reads the title and not the body, and
  the session that reads the spec moves it
