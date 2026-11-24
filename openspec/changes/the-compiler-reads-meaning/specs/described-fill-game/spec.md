## ADDED Requirements

### Requirement: Two spellings of one rule compile to one analysis

The description compiler SHALL analyze a rule by its structure, so that a rule written with a named set and the same rule written inline yield the same checks, bounds and refusals.

#### Scenario: A named set and its inline form

- **WHEN** two descriptions differ only in whether a rule's set is named or written inline
- **THEN** their rule-violation checks report the same violations on every partial board

### Requirement: A rule that cannot hold is refused, never a hang

A fill deal whose rules have refused a hundred answers in a row, none having held, SHALL be refused with a message naming the rule that broke most often, and SHALL NOT draw on to its retry bound.

#### Scenario: A rule false everywhere

- **WHEN** a description states a rule no board satisfies
- **THEN** dealing it fails, once the rules have refused a hundred answers, with a message naming the rule
