## ADDED Requirements

### Requirement: Solve leaves a solved board

Solve SHALL mean one thing in every game: it shows the finished board, or it
refuses with a reason. The midend SHALL hold every game to it rather than each
game choosing: it SHALL refuse Solve on a board whose status is solved or lost
without asking the game, and when the game's solve move would leave a board
whose status is anything but solved it SHALL throw before the move enters the
history, as a defect in the game.

A Solve SHALL therefore never install a route or marks for the player to
follow, nor reveal an answer as a loss. A game whose solver finds no finish
from the player's position SHALL refuse; a game whose answer is fixed SHALL
replace the player's mistakes with it, as it replaces a wrong entry.

Every game with Solve SHALL be solved, by a test, from its deal and from
positions reached by playing its own input into it.

#### Scenario: Solve finishes the board

- **WHEN** Solve lands in any game
- **THEN** the board's status is solved, and the midend reports it
  solved-with-help

#### Scenario: A Solve move that leaves the board unsolved is a defect

- **WHEN** a game's solve move would leave a board whose status is ongoing or
  lost
- **THEN** the midend throws, and the history is unchanged

#### Scenario: A lost board is refused

- **WHEN** Solve is invoked on a board whose status is lost
- **THEN** it is refused with the message a hint gives there, and the game's
  solver is not asked

#### Scenario: No finish within the rules is a refusal

- **WHEN** Flood's solver would finish only past the move limit, from moves the
  player has already spent
- **THEN** Solve refuses, saying no solution can be found from this position

## MODIFIED Requirements

### Requirement: A refused Solve is shown in the help banner

A Solve the engine refuses SHALL show the refusal's own text in the same
transient banner a refused Hint uses, whichever control asked for it, and in every game
that offers Solve — including a game with no hint, whose banner therefore
cannot depend on the hint controls being rendered. A Solve that lands SHALL add
no message of its own.

Solve applies a move, so it SHALL be ordered with the other queued input: a
Solve pressed while an Auto-Hint step is being applied lands after that step,
never inside it.

The refusal's wording is the collection's (see "Solve failures are worded once
for the whole collection"), and is not rewritten by the app.

#### Scenario: Solve on an unstarted Mines board

- **WHEN** the player presses Solve on a fresh Mines board, before the first
  click
- **THEN** the banner says there is nothing to solve until the first move lays
  the board out, and the board is unchanged

#### Scenario: A Solve that lands shows no banner

- **WHEN** the player presses Solve and the game's solver solves the board
- **THEN** the board shows the solution and no banner message is added

#### Scenario: Solve waits behind a step in flight

- **WHEN** Solve is pressed while a hint step is still being applied
- **THEN** the worker receives the solve only after that step has finished

### Requirement: Solve failures are worded once for the whole collection

A refused `Game.solve` SHALL return one of the collection's Solve failures, and
its type SHALL admit no other string, so that a game cannot word one itself. The
set SHALL distinguish, at minimum: the board is finished; the solver could not
settle the puzzle; the puzzle provably has no solution; it provably has more
than one; no finish can be found from the player's position; the game ID carries
no solution and the game has no solver; and the board is not dealt until the
first move.

A failure claiming the puzzle has no solution, or more than one, SHALL be
returned only where the solver established it. Where a solver's verdict does
not tell impossible from gave-up, the failure SHALL be the one that says the
solution cannot be determined, which is true either way.

A fact a hint can also meet SHALL be worded the same for both: the finished
board, the puzzle that cannot be settled, the position nothing finishes from,
and the game ID with no solution are each one message whichever control asked.

The midend SHALL refuse Solve on a board whose status is solved, with the
finished-board failure, and on a board whose status is lost, with the game-over
refusal a hint gives there, without asking the game.

#### Scenario: Two games fail to solve for the same reason

- **WHEN** two games' solvers each prove a typed game ID has no solution
- **THEN** both refusals read the same

#### Scenario: A game's own sentence does not compile

- **WHEN** a game's `solve` returns `{ ok: false, error: "Sorry, I can't" }`
- **THEN** the typecheck fails

#### Scenario: Solve on a finished board leaves the win alone

- **WHEN** the player's own moves have solved the board and Solve is invoked
- **THEN** it is refused as already solved, the game's solver is not asked,
  and the status stays solved rather than solved-with-help

#### Scenario: A hint and Solve name one dead end alike

- **WHEN** Inertia's ball can no longer collect every gem, and the player asks
  for a hint and then for the solution
- **THEN** both refusals are the same message

### Requirement: A game's status is judged from the board alone

A game's `status(state)` SHALL report won, lost or ongoing from the position in
`state` alone, never from how it was reached, and SHALL NOT write into the
state. No game's state SHALL record that the board was solved, or that the
solver was used: the midend owns that history and derives it from the positions
it holds. A fact the board shows (a revealed arena, a dead ball, a killed cell)
is part of the position, and `status` MAY read it.

So a board typed in already solved SHALL be solved at move 0, a Solve move SHALL
complete the board because the board it leaves is solved, and a solved board the
player breaks SHALL read ongoing again (owner, 2026-10-01: one rule for every
consumer, with no record of an earlier solve).

#### Scenario: A board typed in already solved

- **WHEN** a game ID describes a board that is already solved
- **THEN** its status is solved at move 0, and the hint refuses it as already
  solved

#### Scenario: A broken solved board

- **WHEN** the player makes a move that takes a solved board off its solution
- **THEN** the status is ongoing, and a board with a mistake on it is never
  reported solved

#### Scenario: A record of completion on the state fails the build

- **WHEN** a game's state carries a field recording that the board was solved
  or that the solver was used
- **THEN** the cross-game guard fails, naming the game and the field
