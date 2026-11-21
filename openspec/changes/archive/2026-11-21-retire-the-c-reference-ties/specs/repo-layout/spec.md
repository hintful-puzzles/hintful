## MODIFIED Requirements

### Requirement: A shared library lives under `src/engine/`

A shared leaf library, such as `random/`, is an engine library and SHALL live under `src/engine/`. There SHALL NOT be a separate top-level category for a shared or leaf module.

#### Scenario: A shared library is not given its own top-level directory

- **WHEN** a contributor adds a shared library used by the engine or by
  more than one game
- **THEN** it lands under `src/engine/`, not as a sibling of it

### Requirement: The scaffold promises no C oracle

The scaffold SHALL NOT emit a C-differential stub or instruct a contributor to
write a trace harness: a new game has no upstream oracle to record a fixture
against, and no game's generator is held to upstream's output.

#### Scenario: The scaffold does not promise an oracle that no longer exists

- **WHEN** the scaffold is generated
- **THEN** it contains no C-differential stub and no trace-harness instruction
- **AND** the generation-test stub states that the game's assurance is
  behavioral

### Requirement: A comment says what the code cannot, and a name answers its own question

Source under `src/` SHALL carry a comment only where it tells a reader
something the code does not: why the code is the way it is, a constraint that
still binds, where a behavior came from, or why something is absent. A comment
that restates the code, narrates a past edit, or justifies a constraint that no
longer binds SHALL be removed, and a comment that stays SHALL be no longer than
what it has to say.

#### Scenario: A comment defends a byte-match

- **WHEN** a comment justifies reproducing upstream's logic so that upstream's
  output is matched
- **THEN** it is kept only where a test still checks that output, as the grid
  numbering and upstream's game IDs are checked
- **AND** otherwise it is removed, or reduced to a statement of provenance

#### Scenario: A comment records provenance or an absence

- **WHEN** a comment says which upstream behavior a piece of code derives from,
  or why some machinery is deliberately absent
- **THEN** it is kept, as the requirement on procedural comments already
  provides

### Requirement: A style pass changes no behavior and adds no abstraction

A pass made to meet the comment and naming requirements SHALL NOT change
behavior, and SHALL NOT add an abstraction. A simplification is one that leaves
the code both shorter and easier to read; shorter alone does not qualify.

#### Scenario: A style pass over a game is committed

- **WHEN** a commit makes only comment, naming or simplifying edits to a game
- **THEN** the game's hint-walk snapshots and render snapshots pass without
  being re-recorded
- **AND** the commit removes more lines than it adds
