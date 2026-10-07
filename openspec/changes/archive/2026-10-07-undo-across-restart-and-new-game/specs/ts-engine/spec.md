## ADDED Requirements

### Requirement: A restart is a step of the history

`restartGame` SHALL enter the board as it started as the next step of the
history, after the cursor, keeping every step before it. Undo SHALL cross the
step back to the board as it was played and Redo SHALL cross it forward again,
as any other step; a step made after undoing a restart SHALL drop it, as it
drops any step ahead of the cursor. This is upstream's restart
(`midend.c`, `movetype = RESTART`). The port had replaced the history with its
first state since its first midend, with no reason recorded.

The board as it started SHALL be state 0, and for a game that has superseded
its description the board its public description builds ("A game can supersede
its game description mid-play").

A restart SHALL do nothing where nothing has been played since the board
started or was last restarted: at the first position, and at a position a
restart reached. A step there would change nothing on screen and would cost
the steps ahead of the cursor.

**The solver record belongs to a stretch of play.** Whether the solver was used
is one flag of the midend and no part of a state, and a restart is where it
begins again. Each restart in the history SHALL keep the record of the play on
the far side of it from the cursor, and the two SHALL be exchanged whenever
the cursor crosses the restart, so that a board solved with help reads so
again when its restart is undone, and a board solved by hand after a restart
is not marked by a solve made before it.

A restart SHALL NOT reset the solve timer and SHALL NOT hold it: the time is
the time spent on the board. Crossing a restart in either direction SHALL play
no move animation, since the two boards are not one move apart.

The state notification SHALL list the positions restarts reached
(`restarts`).

**The save envelope carries a restart.** Its entry in `moves` SHALL be `null`,
and the envelope SHALL list each restart apart from the moves, as its index
and the solver record it keeps (`restarts`), because a move is the game's own
shape and no marker inside the list could be told from one. The envelope
version SHALL be 3. A version 2 envelope holds no restart and SHALL be lifted
by its version alone. On load a restart SHALL be replayed to the board a
restart made at that point of play reached: one logged before the description
was superseded goes to state 0.

#### Scenario: Undo after a restart returns the moves

- **WHEN** a player makes moves, restarts and presses Undo
- **THEN** the board is as it was before the restart, and further Undo walks
  back through the moves
- **AND** Redo restarts again

#### Scenario: A restart with nothing played does nothing

- **WHEN** a restart is asked for at the first position, with moves ahead of
  the cursor
- **THEN** the history is unchanged and Redo still reaches those moves

#### Scenario: The solver record returns with the moves it belongs to

- **WHEN** a board solved by the Solve command is restarted and solved by hand
- **THEN** its status is solved
- **AND** undoing back across the restart shows it solved-with-help

#### Scenario: A save holding a restart round-trips on either side of it

- **WHEN** a game with a restart in its history is saved with the cursor after
  the restart, or before it, and restored
- **THEN** the restored game has the same position, the same steps each way,
  and the same solver record on each side of the restart

#### Scenario: A save written before a restart was a step opens

- **WHEN** a version 2 envelope is loaded
- **THEN** it restores as it did, with no restart in its history

### Requirement: The board a new one replaces is kept, one deep

When a board in play is replaced, by a deal, an id or a loaded save, the
midend SHALL keep it as a save of itself, and SHALL bring it back when Undo is
asked for at the new board's first position. The board undone from SHALL be
kept the same way, and brought back when Redo is asked for at the last
position of the board Undo returned. A board returns as it was left: its
history and cursor, its time, its help and solver records, and its type as the
type chosen.

**Undo and Redo keep one meaning.** A step of the board in play is taken first
in each direction; the other board lies beyond the first position and beyond
the last. No press means either of two things.

Both kept boards SHALL be dropped at the first step made on the board in play,
a move or a restart, and SHALL NOT be dropped by Undo or Redo. One board is
kept each way: replacing a board drops the board kept before it. Neither is
written to a save or survives the page.

An unplayed copy of the board that replaces it SHALL NOT be kept: nothing of
it is missing. That is what a deterministic deal leaves, and what a page
leaves when it opens a board by id and then that board's autosave.

The board is kept in the midend, and not by the app, because every way a board
is replaced ends in one function there.

The state notification SHALL report whether a board is kept each way
(`boardBefore`, `boardAfter`), SHALL count them in `canUndo` and `canRedo`,
and SHALL number the board in play (`board`): the number changes when the
board is replaced, and a board brought back returns under the number it had,
so that what the app holds per board can follow it.

#### Scenario: Undo on an unplayed new board returns the old one

- **WHEN** a board with moves on it is replaced and Undo is pressed
- **THEN** the old board is in play at the position it was left in, with its
  moves ahead of and behind the cursor, and its time

#### Scenario: Redo returns to the new board

- **WHEN** Undo has brought a board back and Redo is pressed past its last move
- **THEN** the board undone from is in play, and Undo there returns again

#### Scenario: The first move drops the other board

- **WHEN** a move is made on a board that replaced another
- **THEN** undoing that move leaves nothing further to undo

#### Scenario: A deal that finds no board keeps nothing new

- **WHEN** a New game finds no board
- **THEN** the board in play, and the board kept before it, are as they were

### Requirement: A load reports the board once

While the midend replays a save's log it SHALL send no change notification.
When the board is as the save holds it, it SHALL send the board's id, its
params, its state and its status, once each. A replayed step is made as a
player's and is not one: a state reported midway carries a position the
player never sees, and the app keeps what it holds per board (checkpoints,
the autosave) by the states it is told of.

#### Scenario: A long save is one state

- **WHEN** a save of many moves is loaded
- **THEN** one state notification is sent, at the saved position
