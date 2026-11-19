## ADDED Requirements

### Requirement: A cross-game guard reads an exception the game already states

A cross-game guard's exceptions SHALL be read off the game where the game
already states the fact: a member's presence, or a `notApplicable` reason. A
game whose rules make no move wrong (`notApplicable.findMistakes`) SHALL be
taken to judge no move, with no ledger entry.

#### Scenario: A game with nothing to check is not listed again

- **WHEN** a hinting game declares `notApplicable.findMistakes` and has no
  `judgeMove`
- **THEN** `move-judge-games.test.ts` passes with no entry for it in
  `UNJUDGED`
- **AND** such a game that wires `judgeMove` fails

### Requirement: A cross-game ledger names itself when it fails

An exception the game cannot state SHALL be a ledger in the guard, asserted
equal to what the guard found through one shared assertion. Its failure SHALL
name the table, its file and the line to add, and name an entry that no
longer applies as the line to remove.

#### Scenario: A new exception names its ledger

- **WHEN** a guard finds a game its ledger does not hold
- **THEN** the failure names the table, the guard's file, the game, and an
  entry to write

### Requirement: A pinned board's ID is printed by a command

`npm run game-id -- <game> [<params>] (--seed <seed> | --desc <desc>)` SHALL
print the game ID the app announces for that board, loaded through the
midend, so a pin is written without a throwaway test. A game or desc the app
refuses SHALL be refused with the app's words and a non-zero exit.

#### Scenario: A seed is printed as the board it deals

- **WHEN** `npm run game-id -- wordtrail --seed 1` runs
- **THEN** it prints `<params>:<desc>`, with the params in their full
  encoding, and that ID loads as itself
