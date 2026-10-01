## MODIFIED Requirements

### Requirement: The clock reflects the state of play

Mines SHALL leave when its solve timer runs to the engine's rule, stating only that a dead board holds it (`timerHolds`). The timer SHALL
therefore not run before the first click (there is no board yet), SHALL run during play, and
SHALL stop on death and on completion, and SHALL run again when the player undoes out of
either. Solve on a live board SHALL complete it, so the game reports solved-with-help and the
timer stops. Elapsed time SHALL survive a save and restore.

#### Scenario: The clock starts on the first click

- **WHEN** a new Mines game is displayed and the player has not yet clicked
- **THEN** the clock is not running; it starts when the first click uncovers the board

## ADDED Requirements

### Requirement: Mines ships an explained deductive hint

Mines SHALL offer a hint that reasons only from what the board proves, the opened
numbers and squares, and never from the player's flags, because Mines has no mistake
check to vouch for them. Each step SHALL name the number or numbers it reasons from
and why the ringed squares must be safe or must be mines: one number on its own, two
numbers sharing squares, a number whose squares sit inside another's, or the count of
mines left. A flag on a square the numbers prove safe SHALL get its own step taking it
off before the square is opened. Before the first click the hint SHALL open a square,
saying that no mine is laid in the first square opened or beside it. On a board whose
last move opened a mine, the hint SHALL refuse and tell the player to undo it; on a
board deduction cannot advance, it SHALL refuse with the collection's
deduction-exhausted words.

#### Scenario: A satisfied number frees its other squares

- **WHEN** an opened number already touches all its mines
- **THEN** the hint marks that number and rings its other unopened squares as safe,
  saying so

#### Scenario: A wrong flag is not trusted

- **WHEN** the player has flagged a square the numbers prove safe
- **THEN** the hint's step takes the flag off rather than reasoning from it

#### Scenario: A dead board

- **WHEN** a hint is asked for after the player opened a mine
- **THEN** the hint refuses, telling the player to undo that move
