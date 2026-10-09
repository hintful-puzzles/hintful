## MODIFIED Requirements

### Requirement: Filling provides on-screen key labels

Filling's on-screen keypad SHALL be the digits `1` to `9`, each labeled by its
digit, followed by the collection's Clear key. It SHALL be those keys whatever
the board's size.

#### Scenario: The keypad is digits 1–9 plus clear

- **WHEN** the key labels are requested for any Filling board
- **THEN** the result is the buttons `1,2,…,9` followed by a clear key
