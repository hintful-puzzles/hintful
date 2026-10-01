## ADDED Requirements

### Requirement: A game's status is judged from the board alone

A game's `status(state)` SHALL report won, lost or ongoing from the position in
`state` alone, never from how it was reached, and SHALL NOT write into the
state. No game's state SHALL record that the board was solved, or that the
solver was used: the midend owns that history and derives it from the positions
it holds. A fact the board shows (a revealed arena, a revealed answer, a dead
ball, a killed cell) is part of the position, and `status` MAY read it.

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

### Requirement: The engine derives a board's history from its position

The midend SHALL ask a game's `status` once per position and SHALL derive from
its own history everything about how the board got there: whether the solver
was used on this board (reported as solved-with-help on a solved board), when
the win flash plays, and the status bar's completion words. The win flash SHALL
play on a forward move, other than the Solve command, that leaves the board
solved when it was not, for the duration the game's `solvedFlash` gives; a
game's `flashLength` SHALL be only for a flash the status does not show, and a
nonzero answer from it SHALL replace the win flash.

#### Scenario: The Solve command does not celebrate

- **WHEN** the Solve command completes the board
- **THEN** no flash plays, and the status is solved-with-help

#### Scenario: A hand solve after a Solve celebrates

- **WHEN** a player uses Solve, moves off the solution and completes the board
  by hand
- **THEN** the flash plays, and the status is still solved-with-help

#### Scenario: A broken solved board solved again celebrates again

- **WHEN** a player breaks a solved board and solves it again by hand
- **THEN** the flash plays again; undoing the break does not flash

#### Scenario: An expensive status is asked once per position

- **WHEN** the midend reads the status of a position many times (every timer
  tick, every refusal)
- **THEN** the game's `status` was called once for that position

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
board (a hint shown, or the solver used), sent only when that readout changes.

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

## REMOVED Requirements

### Requirement: One completion vocabulary across games

**Reason**: No game's state records completion or a cheat any more, so there is
no vocabulary to keep consistent; the midend holds the history.

**Migration**: "A game's status is judged from the board alone" and "The engine
derives a board's history from its position".

### Requirement: A shared win-flash helper

**Reason**: The win flash's trigger is the midend's; there is no condition left
for a game to delegate.

**Migration**: A game supplies `solvedFlash` ("The engine derives a board's
history from its position").

### Requirement: Every game has a solve timer, and the engine decides when it runs

**Reason**: Its "a solve is final" scenario is retired: the owner chose one rule,
the board's status now, for every consumer, the clock included.

**Migration**: "Every game has a solve timer, and it runs while the board is
undecided". The save envelope no longer carries `timerStopped`; an older save
that does still loads, and the key is ignored.

## MODIFIED Requirements

### Requirement: The engine uses a clean TS-native save format

The midend SHALL serialize and restore a game using a clean,
versioned TypeScript-native format (a version-tagged envelope carrying
the puzzle id, parameters, game id, the move list, timer elapsed, and
checkpoints). Restoration SHALL reconstruct history by replaying the
saved moves. The format SHALL NOT be required to be compatible with
the C `midend_serialise` format, and loading a pre-pivot C-format save
SHALL NOT be required (consistent with the `ts-migration` decision
that old saves and pre-pivot shared IDs are expendable). Saving and
restoring SHALL round-trip: a restored game SHALL have the same state
and history as the saved game.

The envelope SHALL carry the midend's record that the solver was used, as
`cheated`, and SHALL NOT carry whether the board was solved, which the restored
position says ("A game's status is judged from the board alone"). A key an older
envelope carries that the current shape does not read, such as `timerStopped`,
SHALL be ignored rather than rejected.

**A version bump SHALL come with an upgrade, not a rejection**, whenever the
older shape carries the same facts: the decoder SHALL lift an older envelope to
the current shape before validating it, so an existing save keeps working. The
validator SHALL then describe only the current shape, so it cannot drift into
blessing both. An envelope the decoder cannot lift — a *future* version, or an
older one whose fields are missing or malformed — SHALL still be rejected.

#### Scenario: Save/restore round-trips

- **WHEN** a TS-engine game is saved and then restored from that data
- **THEN** the restored game has identical state, move history, and
  redo availability
- **AND** the saved payload carries a format version field

#### Scenario: C-format save is not required to load

- **WHEN** a payload produced by the pre-pivot C-serialization path is
  presented to the TS midend
- **THEN** the midend is NOT required to load it
- **AND** this is not treated as a defect

#### Scenario: An older envelope is upgraded, not discarded

- **WHEN** a save written under the previous envelope version is loaded
- **THEN** it is lifted to the current shape and restores normally
- **AND** the retired field name is gone from the result rather than carried
  alongside the new one

#### Scenario: An envelope that cannot be lifted is still rejected

- **WHEN** the payload names a version the decoder does not know, or an older
  version whose fields are missing or of the wrong type
- **THEN** decoding fails

### Requirement: The status bar's completion words come from the engine

A status bar that says the board is finished, or that the solver was used, SHALL
take those words from the engine's one helper, which distinguishes four states:
neither; finished by the player; finished by the solver; and helped by the
solver but no longer finished. The midend SHALL prefix them to whatever the
game's `statusbarText` returns, from the board's status now and its own record
that the solver was used. A game SHALL NOT write the words itself, and this
SHALL be asserted by scanning the strings games write for what the words say,
not for a constant's name.

#### Scenario: A helped board the player has moved off

- **WHEN** a player uses Solve and then moves the board off its solution
- **THEN** the status bar says the solver was used, not that the board is
  solved

#### Scenario: Nothing follows the words

- **WHEN** a finished board's status bar has nothing else to say
- **THEN** it reads the completion words with no trailing space

### Requirement: The midend SHALL refuse a hint on a finished or wrong board before asking the game

Before it asks a game's `hint` for a plan, the `Midend` SHALL refuse with
`ALREADY_SOLVED` when the board's status is solved, and then with
`FIX_MISTAKES_FIRST` when the game's `findMistakes` reports anything, putting
what it reports on the same overlay Check & Save uses. A game's `hint` is
therefore only ever asked about an unfinished board on which its `findMistakes`
finds nothing, and does not write either refusal.

The refusals SHALL be asked **in order**, because a finished board is not a
wrong board. And `FIX_MISTAKES_FIRST` **promises a highlight**, which only the
code that draws the overlay can keep, so no game says it: it is not a
`HintRefusal`. Forty-two of the forty-eight hinted games wrote this opening, or
called a helper to write it, until the midend took it over; each copy was a
chance to get the order or the promise wrong silently.

The midend SHALL NOT refuse on a lost status, because a lost board is not always
over: Flood plays on past its move limit and its hint still leads home. Because
a status is judged from the board alone, every finished board's status is
solved, so `ALREADY_SOLVED` is the midend's alone and not a `HintRefusal`.

Because the walk in `hint-resume.test.ts` asks `hint` directly, it SHALL also
ask `findMistakes` at every position it reaches, as the midend does, and fail if
it reports anything: that is what holds a game's `findMistakes` to a sound board
and a hint to never leading the player into a mistake.

#### Scenario: Asking for a hint on a finished board

- **WHEN** a hint is requested, or played, on a board whose status is solved
- **THEN** the midend returns `ALREADY_SOLVED` and the game's `hint` is not asked

#### Scenario: Asking for a hint on a board with a mistake highlights it

- **WHEN** a hint is requested on an unfinished board for which the game's
  `findMistakes` reports a mistake
- **THEN** the midend returns `FIX_MISTAKES_FIRST`, the game's `hint` is not
  asked, and the next redraw shows the mistake overlay Check & Save populates

#### Scenario: A refusal unrelated to mistakes highlights nothing

- **WHEN** the game's `hint` refuses on a board with no mistakes
- **THEN** the mistake overlay stays empty and no cell is highlighted

#### Scenario: A hint walk meets a mistake

- **WHEN** following a game's hints reaches a position its `findMistakes` flags
- **THEN** the walk fails, naming the seed and the move

### Requirement: A hint refusal SHALL be one of the collection's own

`HintResult`'s error SHALL be a `HintRefusal`: the union of the literal types of
the collection's refusal constants, plus a sentence made by
`puzzleHintRefusal`, the one named escape. A game SHALL NOT be able to return a
sentence it typed. The set SHALL distinguish, at minimum: the board is
inconsistent but **no individual entry can be shown to be wrong**;
deduction has run out; a bounded search is past its reach; for a game that
teaches no technique, no move would help; and the game is over.

This is required because the help teaches "there is a mistake on the board" and
"deduction has run out" as a *pair* whose responses are opposite, and a player
cannot learn a pair whose members are worded differently in each puzzle.

The escape is for a dead end only one puzzle has, where naming it is the
substance of the hint (Inertia's dead ball, and the gems its ball can no longer
reach). A sentence two games pass through it is a situation the collection has,
and SHALL become a kind; the conformance check SHALL find the escape's calls by
their shape, read a template's words with each substitution as a hole, and fail
a call whose sentence it cannot read.

#### Scenario: Two games refuse for the same reason

- **WHEN** two games decline to hint because no further move can be deduced
- **THEN** the player reads the same sentence in both

#### Scenario: A new phrasing cannot arrive unnoticed

- **WHEN** a game's `hint` returns a sentence that is neither a refusal constant
  nor made by `puzzleHintRefusal`
- **THEN** the typecheck fails

#### Scenario: A game's own dead end shared by a second game

- **WHEN** two games pass the same sentence to `puzzleHintRefusal`
- **THEN** the conformance check fails, asking for a kind

#### Scenario: A kind spelled out through the escape

- **WHEN** a game passes a refusal constant's text to `puzzleHintRefusal`
- **THEN** the conformance check fails

#### Scenario: A board inconsistent with nothing to highlight

- **WHEN** a board `findMistakes` passes is still inconsistent, with no entry
  provably wrong
- **THEN** the game's `hint` refuses with the message that asks the player to
  undo, not with one pointing at a highlight
