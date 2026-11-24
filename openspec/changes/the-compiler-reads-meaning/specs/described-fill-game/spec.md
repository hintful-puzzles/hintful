## ADDED Requirements

### Requirement: Two spellings of one rule compile to one analysis

The description compiler SHALL analyze a rule by its structure, so that a rule written with a named set and the same rule written inline yield the same checks, bounds and refusals.

#### Scenario: A named set and its inline form

- **WHEN** two descriptions differ only in whether a rule's set is named or written inline
- **THEN** their rule-violation checks report the same violations on every partial board

### Requirement: A rule that cannot hold is refused, never a hang

A description whose rules no board can satisfy SHALL be refused, at compile time where the compiler can see it and otherwise by a bounded deal that names the rule, and SHALL NOT leave the generator running without end.

#### Scenario: A rule false everywhere

- **WHEN** a description states a rule no board satisfies
- **THEN** compiling or dealing it fails with a message naming the rule, within the deal's bound
