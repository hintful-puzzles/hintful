# net Specification

## Purpose
Net, the puzzle of rotating tiles until every wire joins one connected network
with no loops. This capability specifies its port to the TS engine, with boards
uniquely solvable without guessing unless the player opts out, tile rotation and
locking, a jumble that replays deterministically, and a movable source.

## Requirements

### Requirement: Net game implements the Game interface

The engine SHALL provide a registered `net` game implementing `Game<NetParams, NetState,
NetMove, NetUi, NetDrawState, NetMistake>`: a `w × h` grid of wire tiles (a 4-bit mask of connections
`R=1`, `U=2`, `L=4`, `D=8`) whose solved configuration is a spanning tree rooted at a source
square. The player SHALL rotate tiles until every tile is connected to the source and powered.

Params SHALL be `w`, `h`, `wrapping`, `barrierProbability` and `unique`, encoded
`{w}x{h}[w][b{prob}][a]` (`w` = wrapping, the `b` suffix only in the full encoding, `a` = not
unique). Upstream's presets SHALL be offered, its two 13×11 boards (plain and
wrapping) turned to 11×13 so that no preset draws wider than tall. `validateParams` SHALL reject a `unique`
`wrapping` board with a side of length 2.

The game SHALL provide `solve` and `statusbarText`, and SHALL NOT provide `textFormat`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, wrapping: true, barrierProbability: 0.25, unique: true }` are
  encoded in full
- **THEN** the result is `5x5wb0.25` and decoding it round-trips the params

### Requirement: Generated boards are uniquely solvable without guessing

When `unique` is set, the generator SHALL gate every board through its own solver, perturbing
the wiring until the board has exactly one solution reachable by pure deduction, and SHALL then
keep the board only if the hint's engine finishes it from the opening position, dealing another
otherwise. A board that requires guessing, or that the hint cannot finish, SHALL be reachable
only by explicitly opting out of uniqueness.

#### Scenario: A generated board has one deducible solution

- **WHEN** a board is generated with `unique` set
- **THEN** the solver reports it uniquely solvable, and no guess is required to reach the
  solution

#### Scenario: A generated board is hinted to the end

- **WHEN** a board is generated with `unique` set and the player follows the hint from the opening position
- **THEN** every step agrees with the solution and the board ends solved

### Requirement: Tiles rotate and lock; no-op inputs are suppressed locally

Left-click SHALL rotate a tile anticlockwise, right-click clockwise, and `f` by 180°.
Middle-click (or `s`) SHALL toggle a tile's lock; a locked tile SHALL NOT rotate. Inputs that
change nothing — a click outside the grid, a click in the gutter between tiles, or a rotate on
a locked tile — SHALL be suppressed in `interpretMove` by returning no move, WITHOUT comparing
serialized game states.

#### Scenario: Rotating a locked tile does nothing

- **WHEN** the player left-clicks a tile that is locked
- **THEN** no move is produced and the board is unchanged

#### Scenario: A tile rotated full circle leaves ordinary undo history

- **WHEN** the player rotates a tile anticlockwise and then clockwise
- **THEN** the board is back to its original wiring and there are two ordinary undo entries —
  the engine performs no state-equality suppression

### Requirement: Jumble is deterministic on replay

The `j` jumble SHALL rotate every unlocked tile by a random amount, and SHALL record the result as an explicit per-tile rotation list so that replaying the move log reproduces the same board without the RNG. The RNG SHALL NOT be part of the Ui: it is neither where the player is nor anything replay reads.

#### Scenario: A jumbled board restores exactly on load

- **WHEN** a game is jumbled, saved, and restored
- **THEN** the restored board matches the jumbled board tile-for-tile

### Requirement: The source and origin are movable Ui state

The powered source square SHALL be movable with Ctrl+arrow, and — on a wrapping grid — the
display origin SHALL be shiftable with Shift+arrow. Both SHALL be Ui state (not board state),
SHALL survive a save, and SHALL NOT be offered on a grid whose every border edge is walled
(such a grid is treated as non-wrapping).

#### Scenario: The source moves and re-powers the board

- **WHEN** the player moves the source square with Ctrl+arrow
- **THEN** the powered/active set is recomputed from the new source

### Requirement: Net takes side notes

Net SHALL let the player note, on the side two tiles share, that a wire crosses it or that none does. A note SHALL be a move — an absolute set of one side's note, named from the tile left of the side or above it — so undo covers it and a save carries it, and a save written before notes existed SHALL load unchanged. A side with a wall on it SHALL take no note.

Notes SHALL be taken in the collection's notes mode (`ui.pencilMode`, toggled by the Marks key and `P`, shown by the pencil at the canvas's top-right). In notes mode a left-click notes a wire across the side of the tile it lands nearest and a right-click (or held finger) notes none, each toggling off a note it would repeat; from the keyboard a select picks a tile, and a select on a neighbor notes the side between them — Enter a wire, Space none — and Escape lets go of the picked tile. On a wrapping grid the tiles either side of a wrapping edge SHALL be neighbors.

#### Scenario: A tap notes the nearest side

- **WHEN** notes mode is on and the player left-clicks near the right side of a tile
- **THEN** the move notes a wire across that side, and the same click again takes the note off

#### Scenario: A note from the keyboard

- **WHEN** notes mode is on, the player selects a tile, moves the cursor to its neighbor and presses Space
- **THEN** the move notes that no wire crosses the side between them

#### Scenario: A wall takes no note

- **WHEN** notes mode is on and the player clicks near a side with a wall on it
- **THEN** no move is produced

### Requirement: Net flags wrong locks and notes

Net SHALL implement `findMistakes`, flagging a locked tile the solution turns differently and a side note the solution contradicts. A tile turned wrong but unlocked SHALL NOT be flagged, and neither SHALL a note on a side the solution does not settle. A flagged note SHALL be drawn in the error color, and a flagged lock SHALL be ringed in it.

#### Scenario: A wrong note is flagged

- **WHEN** the player notes a wire across a side the solution leaves empty, and checks the board
- **THEN** that note is the one mistake reported, and it is drawn in the error color

### Requirement: Net's hint reasons from notes, locks and walls

Net SHALL provide an explained `hint` that reasons only from the facts a player records — side notes and locked tiles — and the walls the board shows, treating an unlocked tile as unknown however it is turned. Each step SHALL add one fact: a note on a side every surviving way of turning a tile agrees on, or a lock on a tile only one way of turning survives for. A way of turning SHALL be ruled out only by a known side it contradicts, a loop it would close through wires already known, or a group of tiles it would seal off from the rest of the grid, and the step's words SHALL name each reason it rests on. A lock step whose tile must turn first SHALL be one journey of the turn and the lock, and every step's moves SHALL be ones the declared verbs make. The hint SHALL refuse while `findMistakes` reports a wrong lock or note.

#### Scenario: A tile against the wall

- **WHEN** a straight on the edge of a bounded grid is turned into the wall, and the player asks for a hint
- **THEN** the step rings the straight, says it must fit the wall so only one way fits, turns it, and then locks it

#### Scenario: A wrong note stops the hint

- **WHEN** a note the solution contradicts is on the board
- **THEN** the hint refuses and asks for the mistakes to be fixed first
