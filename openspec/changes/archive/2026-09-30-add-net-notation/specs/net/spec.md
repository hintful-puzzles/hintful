## ADDED Requirements

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

## MODIFIED Requirements

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

### Requirement: Jumble is deterministic on replay

The `j` jumble SHALL rotate every unlocked tile by a random amount, and SHALL record the result as an explicit per-tile rotation list so that replaying the move log reproduces the same board without the RNG. The RNG SHALL NOT be part of the Ui: it is neither where the player is nor anything replay reads.

#### Scenario: A jumbled board restores exactly on load

- **WHEN** a game is jumbled, saved, and restored
- **THEN** the restored board matches the jumbled board tile-for-tile

## REMOVED Requirements

### Requirement: Net does not offer mistake-checking

**Reason**: Its premise was that every reachable configuration can still be rotated to the solution, so no state is wrong-but-legal. With side notes, and with locks read as the player's claims (the facts Net's hint reasons from), a wrong lock or a wrong note is exactly such a state.

**Migration**: Replaced by "Net flags wrong locks and notes".
