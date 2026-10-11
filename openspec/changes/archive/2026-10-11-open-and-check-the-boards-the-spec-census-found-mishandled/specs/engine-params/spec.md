## ADDED Requirements

### Requirement: A board already won finishes by deduction

An untiered game's `finishesByDeduction` SHALL answer yes for a solved board.
A guard SHALL ask it of a dealt board played to its end by the game's hint, in
every untiered game that does not answer `nothingToDeduce`.

#### Scenario: A hint with no step left to give

- **WHEN** an untiered game's own test reads its hint's refusal on a solved
  board as deduction run out
- **THEN** the guard fails, naming the game

#### Scenario: A board the first move wins

- **WHEN** a Mines board is won by its first click, and its game ID is opened
  or its save restored
- **THEN** the board opens, finished
