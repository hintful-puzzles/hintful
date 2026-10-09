## ADDED Requirements

### Requirement: A requirement states a rule, and nothing else

A requirement under `openspec/specs/` SHALL state what must hold, in the
present tense, with at most one sentence of reason. It SHALL NOT hold how the
decision was reached, what the rule replaced, a measured figure, a date or a
change id. A change to a subject a capability already covers SHALL modify that
requirement and SHALL NOT add a second beside it.

#### Scenario: A change adds a rule to a subject the spec covers

- **WHEN** a change alters how a game's hint behaves, and the game's spec has a
  requirement for that part of its hint
- **THEN** the change's delta modifies that requirement
- **AND** the merged requirement reads as the rule that now holds, with no
  mention of the change

#### Scenario: A rule needs a long argument

- **WHEN** a rule cannot be justified in one sentence
- **THEN** the requirement states the rule and the guide carries the argument

### Requirement: The gate holds a spec to its form

The gate SHALL fail when a requirement's text before its first scenario is
longer than the validator allows, and when a `spec.md` contains a date or the
id of a change. The check SHALL read every `spec.md` under `openspec/specs/`,
and SHALL say in its failure what a requirement holds.

#### Scenario: A delta is archived into an over-long requirement

- **WHEN** archiving a change leaves a requirement over the validator's bound
- **THEN** the commit that archives it fails the gate

#### Scenario: A delta's words name its change

- **WHEN** archiving a change leaves its id or a date in a `spec.md`
- **THEN** the commit fails the gate, naming the file and the line

### Requirement: A requirement cited by its title resolves

A requirement cited by its capability and its title, in `src/`, `docs/`,
`scripts/` or `AGENTS.md`, SHALL resolve to a requirement of that capability,
and the gate SHALL fail on one that does not.

#### Scenario: A requirement is renamed

- **WHEN** a change renames a requirement that a source comment cites by title
- **THEN** the gate fails until the comment cites the new title
