## MODIFIED Requirements

### Requirement: Death is recoverable and is not a loss

Clicking a mine SHALL expose only the mine that killed the player, leaving every other square
covered, and SHALL block further moves until the player undoes, Solve aside: Solve
SHALL show the finished board over the opened mine, as it replaces any wrong entry. The game status SHALL NOT
report a loss on death — only a win taken with the Solve function SHALL report as
solved-with-help. The count of deaths SHALL persist in the status bar for the rest of the
game, and SHALL survive a save.

#### Scenario: A player dies, undoes, and carries on

- **WHEN** the player clicks a mine and then undoes
- **THEN** play resumes on the same board, the game status is still "ongoing", and the status
  bar reports the death

### Requirement: The clock reflects the state of play

Mines SHALL leave when its solve timer runs to the engine's rule, stating only that a dead board holds it (`timerHolds`). The timer SHALL
therefore not run before the first click (there is no board yet), SHALL run during play, and
SHALL stop on death and on completion, and SHALL run again when the player undoes out of
either. Solve SHALL complete the board, dead or alive, so the game reports solved-with-help and
the timer stops. Elapsed time SHALL survive a save and restore.

#### Scenario: The clock starts on the first click

- **WHEN** a new Mines game is displayed and the player has not yet clicked
- **THEN** the clock is not running; it starts when the first click uncovers the board
