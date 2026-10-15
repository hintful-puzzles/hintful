## MODIFIED Requirements

### Requirement: A guard holds every game to reading its params whole

A cross-game test SHALL take each registered game's own encodings from the
derived params corpus and SHALL assert that a character no game's grammar
reads, appended, inserted at every index and written over every character, is
refused with the engine's refusal. It SHALL fail a game with too few
encodings to try. A recorded set of strings upstream's encoder writes SHALL
be read, and SHALL be recorded for exactly the games whose catalog
`collection` is not `own`.

#### Scenario: A decoder that skips what it does not know

- **WHEN** a game's decoder passes over a character it has no arm for
- **THEN** the guard fails, naming the game and the strings it read

#### Scenario: A game with no upstream strings recorded

- **WHEN** a game whose collection is upstream's has no recorded upstream
  strings
- **THEN** the guard fails, naming the game

#### Scenario: A game written for this collection

- **WHEN** a game's collection is `own`
- **THEN** it has no recorded upstream strings, and one recorded for it fails
  the guard
