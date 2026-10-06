## MODIFIED Requirements

### Requirement: The next board is dealt ahead and kept

The app SHALL deal the board the next New game would deal before it is asked
for, off the thread that serves the board in play, and SHALL keep it until that
New game comes. A New game that finds a board kept for the params it deals at
SHALL play that board without running the generator, and SHALL otherwise deal
as before.

A deal is slow once a board, and some types take seconds to find one. Kept
ahead, the wait is paid by the first board of a type and by no later one.

A board SHALL be dealt ahead for every type, whatever its deal costs, and one
board SHALL be kept for a type whose deals are quick: a New game that finds
none kept there waits milliseconds.

A type SHALL keep three boards once a deal ahead of it was slow, so that a
board passed over, by New game pressed again straight away, is followed by one
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
the next New game deals. A type whose deal ahead found no board, or whose
params the game refuses to deal, SHALL NOT be dealt ahead again until a board
of it is asked for.

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

- **WHEN** New game finds no board kept and the generator has not answered
  within a second
- **THEN** the app says it is looking for a board until one is dealt or the
  generator gives up
