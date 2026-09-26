## REMOVED Requirements

### Requirement: The midend displays a timed game's elapsed clock in the status bar

**Reason**: The timer is no longer a feature of a few games with a status line. Every game
has it, and most games have no status line, so the time has its own notification and its own
place in the chrome.

**Migration**: The midend emits `timer-change` (see "Every game has a solve timer, and the
engine decides when it runs"); a game's `statusbarText` was already only the game's own text.

## ADDED Requirements

### Requirement: Every game has a solve timer, and the engine decides when it runs

The midend SHALL offer a `show-timer` boolean preference ("Show timer") in every game, beside
the game's own `prefs`, defaulting to the game's `isTimed`. While it is on, the midend SHALL
count elapsed time only while the player is solving: after the first move of the board, while
the status is `ongoing`, while the game's optional `timerHolds(state)` is not true, and while
the frontend has not paused it (`setTimerPaused`, which the app sets while the page is hidden).
Once the board has been solved, with or without help, its time SHALL be final: undoing the
solve SHALL NOT restart the timer, and a save SHALL carry that fact. A new board SHALL reset
the time. The midend SHALL report the timer as a `timer-change` notification carrying either
`null` (the timer is off) or the whole seconds elapsed and whether help was taken on the board
(a hint shown, or the solver used), sent only when that readout changes.

#### Scenario: A game that does not ask for a timer offers one

- **WHEN** a game with `isTimed = false` and no `prefs` of its own is started
- **THEN** its preferences include `show-timer`, off, and the timer reports `null`

#### Scenario: The timer counts from the first move

- **WHEN** the timer is on and a new board is dealt
- **THEN** it does not count until the player's first move, and counts during play after it

#### Scenario: A solve is final

- **WHEN** a timed board is solved and the player undoes the solving move
- **THEN** the timer does not count again, including after a save and a restore

#### Scenario: A hidden page does not count

- **WHEN** the frontend pauses the timer and later resumes it
- **THEN** no time is counted in between, and counting continues from where it stopped

#### Scenario: A helped time says so

- **WHEN** a hint is shown on a timed board
- **THEN** the timer's readout reports the board as assisted, until a new board is dealt
