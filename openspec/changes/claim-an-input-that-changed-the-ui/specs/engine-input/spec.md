## MODIFIED Requirements

### Requirement: A game declines a button it did not act on

`interpretMove` SHALL return `null` for a button it did not act on, and the
suite SHALL assert that across every registered game by sending button codes
nothing in the vocabulary can mean. The collection-wide input guards ask
whether an input was claimed, and the view raises `puzzle-key-unhandled` for a
key that was not, so a game that answers everything passes those guards
vacuously and takes the app's bare-letter shortcuts away from its own players.

#### Scenario: A game answering a meaningless code is caught

- **WHEN** a registered game returns non-`null` for a button code the
  vocabulary cannot express
- **THEN** the guard fails and names the code, unless that game is on the
  ledger

#### Scenario: The keyboard-reachability guard stays sensitive

- **WHEN** a game that declines what it does not act on has its cursor-key
  handling removed
- **THEN** the keyboard-reachability guard fails for that game
