## ADDED Requirements

### Requirement: A requirement states a rule, and nothing else

A requirement under `openspec/specs/` SHALL state what must hold, in the
present tense, with at most one sentence of reason. It SHALL NOT hold how the
decision was reached, what the rule replaced, a measured figure, a date or a
change id. A change to a subject a capability already covers SHALL modify that
requirement and SHALL NOT add a second beside it.

#### Scenario: A change adds a rule to a subject the spec covers

- **WHEN** a change alters how a game's hint behaves, and the game's spec has a
  requirement for its hint
- **THEN** the change's delta modifies that requirement
- **AND** the merged requirement reads as the rule that now holds, with no
  mention of the change

#### Scenario: A rule needs a long argument

- **WHEN** a rule cannot be justified in one sentence
- **THEN** the requirement states the rule and the guide carries the argument

### Requirement: A spec is bounded, and the gate holds the bound

The gate SHALL fail when a requirement's body or a capability's `spec.md`
exceeds its stated bound, or when a `spec.md` contains a date. The check SHALL
read every `spec.md` under `openspec/specs/`, and SHALL say in its failure what
a requirement may hold.

#### Scenario: A delta is archived into an over-long requirement

- **WHEN** archiving a change leaves a requirement over the bound
- **THEN** the commit that archives it fails the gate
- **AND** the message names the requirement and its length

#### Scenario: A capability outgrows its bound

- **WHEN** a capability's `spec.md` exceeds the bound for a capability
- **THEN** the gate fails until requirements are merged or the capability is
  divided by subject
