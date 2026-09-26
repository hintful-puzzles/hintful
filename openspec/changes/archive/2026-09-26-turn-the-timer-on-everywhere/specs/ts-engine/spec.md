## MODIFIED Requirements

### Requirement: Every game has a solve timer, and the engine decides when it runs

The midend SHALL offer a `show-timer` boolean preference ("Show timer") in every game, beside
the game's own `prefs`, on by default; no game declares anything to have it. While it is on, the midend SHALL
count elapsed time only while the player is solving: after the first move of the board, while
the status is `ongoing`, while the game's optional `timerHolds(state)` is not true, and while
the frontend has not paused it (`setTimerPaused`, which the app sets while the page is hidden).
Once the board has been solved, with or without help, its time SHALL be final: undoing the
solve SHALL NOT restart the timer, and a save SHALL carry that fact. A new board SHALL reset
the time. The midend SHALL report the timer as a `timer-change` notification carrying either
`null` (the timer is off) or the whole seconds elapsed and whether help was taken on the board
(a hint shown, or the solver used), sent only when that readout changes.

#### Scenario: A game that does not ask for a timer offers one

- **WHEN** a game with no `prefs` of its own, and nothing about a clock, is started
- **THEN** its preferences include `show-timer`, on, and the timer reports zero seconds

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
