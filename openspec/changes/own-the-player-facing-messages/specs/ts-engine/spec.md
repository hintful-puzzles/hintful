## MODIFIED Requirements

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

## ADDED Requirements

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
finished-board failure, without asking the game.

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

### Requirement: A game ID that will not load says why in the collection's words

`Game.validateDesc` SHALL return a description error made by the engine's
description-error module: a kind (too short, too long, a number out of range, a
value repeated, clues that contradict each other, a layout this puzzle's IDs do
not have, or a character that cannot appear, naming it where the parser has it),
or a sentence about the puzzle's own rules passed through the module's named
escape. Its type SHALL admit no other string.

A sentence passed through the escape SHALL be used by one game only, since a
reason two games give is a situation the collection has and SHALL be a kind; it
SHALL not repeat a kind's words; and it SHALL be one sentence about "this game
ID". These SHALL be asserted by reading every call of the escape by its shape,
in the games and the engine alike.

`validateDesc` SHALL refuse a malformed description by returning, never by
throwing.

#### Scenario: A truncated ID says it may have been cut off

- **WHEN** a player enters a game ID whose description ends early, in any game
- **THEN** the dialog says the ID is too short for its board and may have been
  cut off when it was copied

#### Scenario: A bad character is named

- **WHEN** a description contains a character its game never writes
- **THEN** the message names that character

#### Scenario: A reason two games share becomes a kind

- **WHEN** two games pass the same sentence to the escape
- **THEN** the guard fails, naming the sentence and both games

#### Scenario: Garbage is refused, not thrown

- **WHEN** any game's `validateDesc` is given an empty string, punctuation, or
  an overlong run of one character
- **THEN** it returns without throwing, and refuses at least one of them

### Requirement: The status bar's completion words come from the engine

A status bar that says the board is finished, or that the solver was used, SHALL
take those words from the engine's one helper, which distinguishes four states:
neither; finished by the player; finished by the solver; and helped by the
solver but no longer finished. A game SHALL NOT write the words itself, and this
SHALL be asserted by scanning the strings games write for what the words say,
not for a constant's name.

#### Scenario: A helped board the player has moved off

- **WHEN** a player uses Solve and then moves the board off its solution, in a
  game that recomputes "finished"
- **THEN** the status bar says the solver was used, not that the board is
  solved

#### Scenario: Nothing follows the words

- **WHEN** a finished board's status bar has nothing else to say
- **THEN** it reads the completion words with no trailing space
