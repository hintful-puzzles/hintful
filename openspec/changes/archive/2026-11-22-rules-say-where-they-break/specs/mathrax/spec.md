## ADDED Requirements

### Requirement: Look: Mathrax draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each entered digit that repeats in its row or column, and, in each
cell where a corner clue is broken, that cell's quarter of the clue
(`Game.rules`): a clue is broken at a cell when no digit the cell across it
could hold, or holds, makes the clue with the cell's own.

#### Scenario: A digit nothing across its clue pairs with

- **WHEN** the player enters a digit that no digit of the board's size, across
  a clue, makes that clue with
- **THEN** the clue's quarters in that cell and in the open cell across it are
  drawn red

#### Scenario: A repeated digit

- **WHEN** the same digit is entered twice in a row
- **THEN** each entered one is drawn red
