## MODIFIED Requirements

### Requirement: Every game has a solve timer, and it runs while the board is undecided

The midend SHALL offer a `show-timer` boolean preference ("Show timer") in every
game, beside the game's own `prefs`, on by default; no game declares anything to
have it. While it is on, the midend SHALL count elapsed time only while the
player is solving: after the first move of the board, while the board's status
is `ongoing`, while the game's optional `timerHolds(state)` is not true, and
while the frontend has not paused it (`setTimerPaused`, which the app sets while
the page is hidden). Being decided is a fact about the board on display: a
solved board the player breaks, or undoes out of, SHALL count again (owner,
2026-10-01: a peek at the solution and then solving it oneself is a use of the
app the clock follows). A new board SHALL reset the time. The midend SHALL
report the timer as a `timer-change` notification carrying either `null` (the
timer is off) or the whole seconds elapsed and whether help was taken on the
board, sent only when that readout changes.

Help is the app doing some of the solving, and the midend SHALL count as help:
a hint step shown, the solver used, and the app finding something wrong with
the position, which is mistakes highlighted or a dead end named (owner,
2026-10-04: a check that finds something saves the player the time of finding
it). The last SHALL count alike whether Check, Check & save or the Hint button
asked, and in every game: it is one rule in the midend and no game declares
anything about it. A check that finds nothing, and a refusal that is not a dead
end, SHALL NOT count, so saving a sound board never marks it.

#### Scenario: A game that does not ask for a timer offers one

- **WHEN** a game with no `prefs` of its own, and nothing about a clock, is started
- **THEN** its preferences include `show-timer`, on, and the timer reports zero seconds

#### Scenario: The timer counts from the first move

- **WHEN** the timer is on and a new board is dealt
- **THEN** it does not count until the player's first move, and counts during play after it

#### Scenario: A solve stops the clock while the board stays solved

- **WHEN** a timed board is solved
- **THEN** the timer stops, and counts again once the board is broken or the
  solve is undone

#### Scenario: A peek at the solution stays assisted

- **WHEN** a player uses Solve on a timed board and undoes it
- **THEN** the timer counts again, and its readout reports the board as assisted

#### Scenario: A hidden page does not count

- **WHEN** the frontend pauses the timer and later resumes it
- **THEN** no time is counted in between, and counting continues from where it stopped

#### Scenario: A helped time says so

- **WHEN** a hint is shown on a timed board
- **THEN** the timer's readout reports the board as assisted, until a new board is dealt

#### Scenario: A check that finds something is help

- **WHEN** a check, or a press of Hint, highlights mistakes or names a dead end
- **THEN** the timer's readout reports the board as assisted

#### Scenario: A check that finds nothing is not

- **WHEN** a check passes a board, or cannot settle it past the search's reach
- **THEN** the readout does not report the board as assisted on that account
