## MODIFIED Requirements

### Requirement: The next board is dealt ahead and kept

The app SHALL deal the board the next New game would deal before it is asked
for, off the thread that serves the board in play, and SHALL keep it until that
New game comes. A New game that finds a board kept for the params it deals at
SHALL play that board without running the generator, and SHALL otherwise wait
for one as "A deal a player waits for runs off the board's thread and can be
stopped" requires.

A deal is slow once a board, and some types take seconds to find one. Kept
ahead, the wait is paid by the first board of a type and by no later one.

A board SHALL be dealt ahead for every type, whatever its deal costs, and one
board SHALL be kept for a type whose deals are quick: a New game that finds
none kept there waits milliseconds.

A type SHALL keep three boards once a deal of it was slow, so that a board
passed over, by New game pressed again straight away, is followed by one
already found. A deal is slow where its generator ran for as long as a New
game may go unanswered before the app says it is looking for a board; the time
SHALL be the generator's alone, and SHALL NOT count starting the thread it ran
on. One slow deal makes the type slow for the rest of the visit, and for a
later visit while a board that was slow to find is still kept: a search for a
rare board ends at the first one it meets, so one quick deal says little about
the next. The boards SHALL be dealt one at a time, and of several kept for a
type New game SHALL play the one kept longest.

A kept board SHALL be keyed by its puzzle and by the full encoding of the
params it was dealt at, which are the params the deal would use after turning
the board to fit the screen. It SHALL be kept across visits, apart from the
player's saved games and settings, and SHALL be handed to one deal only.

A kept board is played as its generator wrote it: its tier is taken on trust
and its `aux` is retained for Solve, as for a board dealt on the spot. It
SHALL therefore be played only by the build that dealt it, and a board another
build kept SHALL read as absent.

A deal ahead SHALL be abandoned when the type it is for stops being the one
the next New game deals, unless a player is waiting for its board. A type
whose deal found no board, whose params the game refuses to deal, or whose
deal the player stopped SHALL NOT be dealt ahead again until a board of it is
asked for.

#### Scenario: The second deal of a slow type arrives at once

- **WHEN** a type whose boards take seconds to find has been dealt once, and
  the board dealt ahead has been found
- **THEN** New game plays the kept board without running the generator
- **AND** another board of that type is dealt ahead

#### Scenario: Boards of a slow type passed over are each followed by a kept one

- **WHEN** three boards are kept for a type whose deal ahead was slow, and New
  game is pressed three times running
- **THEN** each press plays a kept board, the one kept longest first, and none
  runs the generator
- **AND** boards of that type are dealt ahead until three are kept again

#### Scenario: A quick type keeps one board

- **WHEN** a type's deal ahead took less than the time that makes a deal slow
- **THEN** one board is kept for it and no further board is dealt ahead until
  that one is played

#### Scenario: A kept board is for the board as it will be dealt

- **WHEN** the chosen type would be dealt turned on its side to fit the screen
- **THEN** the board dealt ahead is dealt at the turned params
- **AND** a kept board of the unturned params is not played in its place

#### Scenario: A kept board survives a visit and not a build

- **WHEN** the page is reopened by the build that kept a board
- **THEN** New game plays that board
- **AND** a build with another version stamp finds no board kept and deals

#### Scenario: Choosing another type abandons the deal ahead

- **WHEN** a board is being dealt ahead and the player chooses another type
- **THEN** that deal is stopped and one for the new type begins

#### Scenario: A slow deal with no board kept says what it is doing

- **WHEN** New game finds no board kept and no board has been found within a
  second
- **THEN** the app says it is looking for a board until one is dealt, the
  generator gives up, or the player stops the search

## ADDED Requirements

### Requirement: A deal a player waits for runs off the board's thread and can be stopped

A New game that finds no board kept SHALL wait on a deal run off the thread
that serves the board in play, and SHALL hand the board that deal finds to the
engine to play as a kept board is played. The engine's own thread SHALL NOT
run a generator for a New game. Where a deal ahead is already under way for the
type, the New game SHALL wait on that deal and SHALL NOT start a second, and
the board it finds SHALL be played and not kept as well.

A generator owns its thread until it returns, and at a Custom size that can be
minutes. Run beside the board, the search leaves the board in play answering
moves, hints and undo, and can be ended where a generator cannot.

While the app says it is looking for a board it SHALL offer a control that
stops the search, reachable by touch, by keyboard and by mouse. The words and
the control SHALL stand apart from the place a hint's words are shown, so that
a hint asked of the board in play does not remove the way out. Stopping SHALL
end the deal at once, leave the board in play and its moves as they were, and
put the type chosen back to that board's, as a deal that found no board does.
A stopped deal SHALL say nothing further.

A deal that found no board SHALL answer with the sentence the engine gives
for a generator that gave up, and SHALL leave the board in play and put the
type chosen back to its type.

A wait SHALL end, without a board, when the player opens another board by its
id or from a save, and SHALL give way to a later New game. Where the type
chosen changes during a wait and no New game follows, the board found for the
type left SHALL NOT be handed to the engine; the wait SHALL go on for the type
now chosen.

Where no board is in play, stopping SHALL fall back as a deal that found no
board does there: the app deals the game's first preset. That deal, having
nothing to go back to, SHALL offer no control to stop it.

#### Scenario: The board in play is played through a wait

- **WHEN** a New game finds no board kept for a type whose deal takes many
  seconds
- **THEN** the board in play stays on screen and takes moves and hints
- **AND** the board the deal finds replaces it when it arrives

#### Scenario: One deal serves the type just chosen

- **WHEN** a type is chosen, its deal ahead begins, and New game is asked for
  before that deal ends
- **THEN** the New game waits on that deal and plays its board
- **AND** no second deal is started and the board is not kept

#### Scenario: A player stops the search

- **WHEN** the app says it is looking for a board and the player uses the
  control beside those words
- **THEN** the deal ends at once and the board in play is as it was, with its
  moves
- **AND** the type chosen is that board's again
- **AND** the type left is not dealt ahead until a New game asks for it

#### Scenario: Asking again deals again

- **WHEN** a search was stopped and the player asks for the same type again
- **THEN** a deal for it begins and the app waits on it

#### Scenario: A hint during the wait leaves the way out

- **WHEN** the app is looking for a board and the player asks the board in
  play for a hint
- **THEN** the hint's words are shown and the control that stops the search
  is still offered

#### Scenario: A deal that finds nothing says so

- **WHEN** the deal a New game waits on runs its retry bound out
- **THEN** the player is told no board of the type was found, in the engine's
  sentence, and the board in play and its type stay

#### Scenario: Stopping with no board in play

- **WHEN** a page opens on a type whose deal is slow, with no board to show,
  and the player stops the search
- **THEN** the game's first preset is dealt, and that deal offers no control
  to stop it
