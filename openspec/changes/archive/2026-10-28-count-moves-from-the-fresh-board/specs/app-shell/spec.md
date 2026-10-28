## RENAMED Requirements

- FROM: `### Requirement: The timeline names a restart and the boards kept either side`
- TO: `### Requirement: The timeline names the runs kept either side`

## ADDED Requirements

### Requirement: The move counter counts from the fresh board

The move counter SHALL count the moves made since the board in play was last
drawn fresh: by a New game, a type change, a shared or loaded game, or a Start
over. A Start over SHALL NOT be shown as a move.

#### Scenario: Start over after thirteen moves

- **WHEN** a player makes thirteen moves and chooses Start over
- **THEN** the counter reads move 0 of 0
- **AND** Undo brings back the moves, and the counter reads move 13 of 13

## MODIFIED Requirements

### Requirement: Undo reaches back across a Restart and a replaced board

Start over and New game are the two commands that put a player's work away,
and the app SHALL let Undo take either back, as `ts-engine` keeps a restart as
a step of the history and the boards a new one replaces. Undo SHALL reach back
across both, in the order they were done, through moves made since.

#### Scenario: Restart, then Undo

- **WHEN** a player makes moves, chooses Start over and presses Undo
- **THEN** the moves are back, and the timeline offers the board started over
  after them

#### Scenario: A move on the new board

- **WHEN** a player chooses New game, moves on the new board and undoes that
  move
- **THEN** Undo is still available, and brings back the board left

### Requirement: A board's checkpoints leave and return with it

A run's checkpoints are move numbers in that run, play from a fresh board. They
SHALL leave with the run when it is left, by a New game or a Start over, so
that a fresh board starts with none, and SHALL return with it when Undo or Redo
brings it back. The app SHALL follow the run by the number the engine gives it
and not by its id, which two boards can share and one board can change.

#### Scenario: New game, then Undo

- **WHEN** a player makes moves, sets a checkpoint, chooses New game and
  presses Undo before moving
- **THEN** the old board is back with its moves, its checkpoint and its time

#### Scenario: Start over, then Undo

- **WHEN** a player sets a checkpoint, chooses Start over and presses Undo
- **THEN** the board started over has no checkpoint, and the moves brought
  back have theirs

### Requirement: The app says when Undo has brought back a board

When an Undo brings back a board, or the moves a Start over put away, the app
SHALL say so where a hint's words go, since the whole board has changed under
a control that usually takes back one move, and SHALL take the words down when
Redo returns.

#### Scenario: Undo brings back the board a New game replaced

- **WHEN** a player chooses New game and presses Undo before moving
- **THEN** the app says the board is back and that Redo returns

#### Scenario: Undo brings back the moves a Start over put away

- **WHEN** a player chooses Start over and presses Undo
- **THEN** the app says the moves are back and that Redo starts over again

### Requirement: The timeline names the runs kept either side

The timeline SHALL count the run in play, and SHALL offer the run one Undo
before its first move and the run one Redo after its last, named for how it was
left: *Previous board* and *Next board* for another board, *Before starting
over* and *Started over* for the same board either side of a Start over. The
help SHALL describe taking back both Start over and New game
(`help/features.md`, "Taking back Start over or a New game").

#### Scenario: The timeline after an Undo across a New game

- **WHEN** a player chooses New game, presses Undo and opens the timeline
- **THEN** it offers *Next board* after the last move

#### Scenario: The timeline after a Start over

- **WHEN** a player makes moves, chooses Start over and opens the timeline
- **THEN** it shows no move, and offers *Before starting over* before the start
