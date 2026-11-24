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

### Requirement: A hidden clue kind is read by a technique

The description compiler SHALL refuse a fill description whose deal hides a clue kind that no technique reads, by `clue(kind, …)` or `clues(kind)` in itself or a definition it names, and that the answer's domain does not read, unless the kind means the answer's value at its cell (a given). The deal SHALL count a clue read where a firing binds the element it sits at, an element of the kind's own sort, or names it by its index in its kind.

#### Scenario: A kind only a removed technique read

- **WHEN** a description's deal hides a kind whose only reader is a technique the description no longer states
- **THEN** the compiler refuses it, naming the kind

#### Scenario: A corner's clue read through a corner binding

- **WHEN** a firing binds a cell and a corner, and reads the clue at the corner
- **THEN** the deal counts the corner's clue read, and no clue at the corner whose index is the cell's
