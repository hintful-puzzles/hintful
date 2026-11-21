## ADDED Requirements

### Requirement: A described game's live errors are where its rules break

A described game's module SHALL export `violations`, compiled from the same
domain, shape, rules and clue meanings as `isAnswer`, reporting each
statement a board still being filled already breaks, with the elements or
clue where it does. A violation SHALL be reported only where no completion
of the board satisfies the statement, and on a whole board the violations
SHALL be empty exactly where `isAnswer` holds. A game that declares `rules`
SHALL draw its live error marks from them alone.

#### Scenario: A board on the way to an answer breaks nothing

- **WHEN** some elements of an answer are made undecided
- **THEN** `violations` reports nothing

#### Scenario: Two tents touching are one violation, at both

- **WHEN** a Tents board holds two tents side by side
- **THEN** the shape's exclusion rule is reported at those two squares, and
  the board draws a diamond between them

#### Scenario: A row that can no longer reach its count is marked

- **WHEN** a Tents row has fewer tents and open squares together than its
  number
- **THEN** the count clue of that row is reported, and its number is red
