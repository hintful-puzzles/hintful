## ADDED Requirements

### Requirement: Undo reaches back across a Restart and a replaced board

Restart and New game are the two commands that put a player's work away, and
the app SHALL let Undo take either back (`ts-engine`, "A restart is a step of
the history" and "The board a new one replaces is kept, one deep"). The Undo
and Redo controls, their shortcuts and the timeline SHALL need nothing of
their own for it: the engine's `canUndo` and `canRedo` already count a restart
and a kept board.

A board's checkpoints are move numbers on that board. They SHALL leave with
the board when it is replaced, so that a new board starts with none, and SHALL
return with it when Undo or Redo brings it back. The app SHALL follow the
board by the number the engine gives it and not by its id, which two boards
can share and one board can change.

When an Undo brings back a board, the app SHALL say so where a hint's words
go, since the whole board has changed under a control that usually takes back
one move, and SHALL take the words down when Redo returns.

The timeline SHALL name each restart at its move, and SHALL offer the board
kept before the first move as *Previous board* and the board kept after the
last as *Next board*.

The help SHALL describe both (`help/features.md`, "Taking back a Restart or a
New game").

#### Scenario: Restart, then Undo

- **WHEN** a player makes moves, chooses Restart and presses Undo
- **THEN** the moves are back, and the timeline shows the restart ahead

#### Scenario: New game, then Undo

- **WHEN** a player makes moves, sets a checkpoint, chooses New game and
  presses Undo before moving
- **THEN** the old board is back with its moves, its checkpoint and its time
- **AND** the app says the board is back and that Redo returns

#### Scenario: A move on the new board

- **WHEN** a player moves on the new board and undoes that move
- **THEN** Undo is unavailable
