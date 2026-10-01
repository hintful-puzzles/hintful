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
