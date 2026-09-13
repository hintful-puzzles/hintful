## ADDED Requirements

### Requirement: A refused Solve is shown in the help banner

A Solve the engine refuses SHALL show the refusal's own text in the same
transient banner a refused Hint uses, whichever control asked for it (the
Solve command or the end notification's "show solution"), and in every game
that offers Solve — including a game with no hint, whose banner therefore
cannot depend on the hint controls being rendered. A Solve that lands SHALL add
no message of its own.

Solve applies a move, so it SHALL be ordered with the other queued input: a
Solve pressed while an Auto-Hint step is being applied lands after that step,
never inside it.

The refusal's wording is the game's, and is not rewritten by the app.

#### Scenario: Solve on an unstarted Mines board

- **WHEN** the player presses Solve on a fresh Mines board, before the first
  click
- **THEN** the banner reads "Game has not been started yet" and the board is
  unchanged

#### Scenario: A Solve that lands shows no banner

- **WHEN** the player presses Solve and the game's solver solves the board
- **THEN** the board shows the solution and no banner message is added

#### Scenario: Solve waits behind a step in flight

- **WHEN** Solve is pressed while a hint step is still being applied
- **THEN** the worker receives the solve only after that step has finished
