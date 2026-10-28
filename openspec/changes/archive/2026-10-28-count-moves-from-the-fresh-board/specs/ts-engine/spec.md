## RENAMED Requirements

- FROM: `### Requirement: The board a new one replaces is kept, one deep`
- TO: `### Requirement: The boards a new one replaces are kept, up to a hundred`
- FROM: `### Requirement: The state notification lists the restarts`
- TO: `### Requirement: The state notification counts the run in play`
- FROM: `### Requirement: A restart leaves the timer running and plays no animation`
- TO: `### Requirement: A restart starts the timer again and plays no animation`

## REMOVED Requirements

### Requirement: A kept board is dropped at the first step made on the board in play

**Reason**: Undo reaches back across every board replaced, through moves made
since, up to a bound; only the boards ahead are dropped by a step.
**Migration**: "A step drops the boards kept after the board in play".

## MODIFIED Requirements

### Requirement: A restart starts the timer again and plays no animation

A restart SHALL start the solve timer again from zero, and the record of help
with it: starting over is starting again. The timer SHALL count from the first
move after it, as it counts from a new board's first move. Each restart SHALL keep the time and
the help of the play on the far side of it from the cursor, as it keeps the
solver record, and the two SHALL be exchanged whenever the cursor crosses, so
that Undo across a restart brings back the time the moves took. Crossing a
restart in either direction SHALL play no move animation, since the two boards
are not one move apart.

#### Scenario: A timed board is restarted

- **WHEN** a board with time on its clock and a hint shown is restarted
- **THEN** the readout reads zero and unassisted, and the board appears without
  a move animation
- **AND** Undo brings back the time and the assisted readout

### Requirement: The save envelope carries a restart

A restart's entry in the envelope's `moves` SHALL be `null`, and the envelope
SHALL list each restart apart from the moves, as its index and the solver
record, time and help it keeps (`restarts`: `at`, `cheated`, `elapsed`,
`hinted`), because a move is the game's own shape and no marker inside the list
could be told from one. A restart written before a restart reset the clock has
no `elapsed` or `hinted`, and SHALL be read as one the time and help ran on
through. The envelope version SHALL be 3. A version 2 envelope holds no restart
and SHALL be lifted by its version alone.

#### Scenario: A save holding a restart round-trips on either side of it

- **WHEN** a game with a restart in its history is saved with the cursor after
  the restart, or before it, and restored
- **THEN** the restored game has the same position, the same steps each way,
  and the same solver record, time and help on each side of the restart

#### Scenario: A save written before a restart was a step opens

- **WHEN** a version 2 envelope is loaded
- **THEN** it restores as it did, with no restart in its history

#### Scenario: A save written before a restart reset the clock opens

- **WHEN** a save whose restart has no `elapsed` is loaded and Undo crosses it
- **THEN** the readout keeps the save's time and help

### Requirement: The boards a new one replaces are kept, up to a hundred

When a board in play is replaced, by a deal, an id or a loaded save, the midend
SHALL keep it as a save of itself behind the boards already kept, up to a
hundred, and SHALL bring the last of them back when Undo is asked for at the
new board's first position. The board undone from SHALL be kept the same way,
and brought back when Redo is asked for at the last position of the board Undo
returned. The boards SHALL be kept in the midend and not by the app, because
every way a board is replaced ends in one function there.

#### Scenario: Redo returns to the new board

- **WHEN** Undo has brought a board back and Redo is pressed past its last move
- **THEN** the board undone from is in play, and Undo there returns again

#### Scenario: A deal that finds no board keeps nothing new

- **WHEN** a New game finds no board
- **THEN** the board in play, and the boards kept before it, are as they were

#### Scenario: Two boards back

- **WHEN** a board is replaced, a move is made on the new one, and that is
  replaced in turn
- **THEN** Undo walks back through the second board's move to the first board

#### Scenario: The bound

- **WHEN** a hundred and one boards have been replaced
- **THEN** Undo brings back the last hundred and not the first

### Requirement: The state notification counts the run in play

A run is play from a fresh board: from the board's first position, or from a
position a restart reached, to the next restart or the end of the history. The
state notification SHALL give the cursor's position and the moves in the run
(`currentMove`, `totalMoves`) counted from the run's first position, so that a
restart is no move. It SHALL name what lies one Undo before the run's first
position and one Redo after its last (`boardBefore`, `boardAfter`): `restart`
for the same board across a restart, `board` for a kept board, or nothing.

#### Scenario: A board is restarted after three moves

- **WHEN** a player makes three moves and restarts
- **THEN** the state notification reads position 0 of 0, with `boardBefore`
  `restart`
- **AND** after Undo it reads position 3 of 3, with `boardAfter` `restart`

### Requirement: The state notification reports the kept boards and numbers the board in play

The state notification SHALL count the kept boards in `canUndo` and `canRedo`,
and SHALL number the run in play (`board`). The number SHALL change when the
board is replaced or restarted, and a run brought back SHALL return under the
number it had, its restarts' runs included, so that what the app holds per run
can follow it. A run begun SHALL take a number higher than every run before it.

#### Scenario: A board is brought back by Undo

- **WHEN** a board is replaced and Undo at the new board's first position
  brings it back
- **THEN** `canUndo` was true there, and the returned board's notification
  carries the number it had before it was replaced

#### Scenario: A restart numbers its run

- **WHEN** a board is restarted, replaced, and brought back by Undo
- **THEN** the run after the restart has its own number, which it has again
  when brought back, and Undo across the restart returns the board's first
  number

## ADDED Requirements

### Requirement: A step drops the boards kept after the board in play

A step made on the board in play, a move or a restart, SHALL drop the boards
kept after it, as it drops the steps ahead of the cursor, and SHALL keep the
boards before it. Replacing a board SHALL drop the boards kept after it.
Neither SHALL be written to a save or survive the page: another board is no
part of this one's save.

#### Scenario: A move keeps the boards before

- **WHEN** a move is made on a board that replaced another, and undone
- **THEN** Undo at the first position brings back the board replaced

#### Scenario: A move drops the boards after

- **WHEN** Undo has brought back a board and a move is made on it
- **THEN** Redo at its last position returns to no other board
