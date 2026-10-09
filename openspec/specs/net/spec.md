# net Specification

## Purpose
Net, the puzzle of rotating tiles until every wire joins one connected network
with no loops. Its boards are uniquely solvable without guessing, its tiles
rotate and lock, its jumble replays deterministically, its source is movable,
and its player can note the sides of tiles.

## Requirements

### Requirement: Net game implements the Game interface

The engine SHALL provide a registered `net` game implementing `Game`: a
`w × h` grid of wire tiles (a 4-bit mask of connections `R=1`, `U=2`, `L=4`,
`D=8`) whose solved configuration is a spanning tree rooted at a source square.
The player SHALL rotate tiles until every tile is connected to the source and
powered.

#### Scenario: The last tile is turned into place

- **WHEN** the player turns the one tile that was cut off so that it joins the
  network
- **THEN** every tile is powered from the source and the game is solved

### Requirement: Net's params and their encoding

Params SHALL be `w`, `h`, `wrapping` and `barrierProbability`, encoded
`{w}x{h}[w][b{prob}]`: `w` for wrapping, and the `b` suffix only in the full
encoding. Decoding SHALL skip the letter `a`, which elsewhere asks for a board
with no promised single answer, and encoding SHALL never write it.
`validateParams` SHALL reject a `wrapping` board with a side of length 2.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, wrapping: true, barrierProbability: 0.25 }` are
  encoded in full
- **THEN** the result is `5x5wb0.25` and decoding it round-trips the params

#### Scenario: The unchecked-board letter

- **WHEN** `7x9wb0.25a` is decoded
- **THEN** the params are those of `7x9wb0.25`

### Requirement: No Net preset draws wider than tall

The presets SHALL be the bounded boards 5×5, 7×7, 9×9, 11×11 and 11×13, and
one wrapping board. No preset SHALL be wider than it is tall.

#### Scenario: The largest preset stands upright

- **WHEN** the presets are listed
- **THEN** the largest is 11 wide and 13 tall, and exactly one preset wraps

### Requirement: Net loads only a board its hint finishes

The game SHALL provide `solve` and `statusbarText`, and SHALL NOT provide
`textFormat`. It SHALL implement `finishesByDeduction` as its solver settling
every tile and its hint's engine finishing the board, so that a board that
loads is one its hint finishes.

#### Scenario: A board the hint cannot finish

- **WHEN** a board has one solution and the hint's engine stops before every
  tile is locked
- **THEN** `finishesByDeduction` answers no

### Requirement: Generated boards are uniquely solvable without guessing

The generator SHALL gate every board through its own solver, perturbing
the wiring until the board has exactly one solution reachable by pure deduction, and SHALL then
keep the board only if the hint's engine finishes it from the opening position, dealing another
otherwise. No parameter SHALL deal a board that requires guessing or that the hint cannot finish.

#### Scenario: A generated board has one deducible solution

- **WHEN** a board is generated
- **THEN** the solver reports it uniquely solvable, and no guess is required to reach the
  solution

#### Scenario: A generated board is hinted to the end

- **WHEN** a board is generated and the player follows the hint from the opening position
- **THEN** every step agrees with the solution and the board ends solved

### Requirement: Tiles rotate and lock

Left-click SHALL rotate a tile anticlockwise, right-click clockwise, and `f`
by 180°. `s` SHALL toggle a tile's lock, and so SHALL a tap in the middle
third of a tile in notes mode, where the pointer's other taps note sides:
outside notes mode both buttons rotate, so notes mode is where the pointer
reaches the lock. A locked tile SHALL NOT rotate.

#### Scenario: A tap in the middle of a tile in notes mode locks it

- **WHEN** notes mode is on and the player taps, or right-clicks, the middle third of a tile
- **THEN** the tile's lock toggles, and a tap nearer one of its sides notes that side instead

### Requirement: No-op inputs are suppressed locally

An input that changes nothing SHALL be suppressed in `interpretMove` by
returning no move, and never by comparing serialized game states: a click
outside the grid, a rotating click in the gutter between tiles, and a rotate
on a locked tile.

#### Scenario: Rotating a locked tile does nothing

- **WHEN** the player left-clicks a tile that is locked
- **THEN** no move is produced and the board is unchanged

#### Scenario: A tile rotated full circle leaves ordinary undo history

- **WHEN** the player rotates a tile anticlockwise and then clockwise
- **THEN** the board is back to its original wiring and there are two ordinary undo entries:
  the engine performs no state-equality suppression

### Requirement: Jumble is deterministic on replay

The `j` jumble SHALL rotate every unlocked tile by a random amount, and SHALL record the result as an explicit per-tile rotation list so that replaying the move log reproduces the same board without the RNG. The RNG SHALL NOT be part of the Ui: it is neither where the player is nor anything replay reads.

#### Scenario: A jumbled board restores exactly on load

- **WHEN** a game is jumbled, saved, and restored
- **THEN** the restored board matches the jumbled board tile-for-tile

### Requirement: The source and origin are movable Ui state

The powered source square SHALL be movable with Ctrl+arrow, and on a wrapping
grid the display origin SHALL be shiftable with Shift+arrow. Both SHALL be Ui
state (not board state) and SHALL survive a save. A shift of the origin SHALL
NOT be offered on a grid whose every border edge is walled: such a grid is
treated as non-wrapping.

#### Scenario: The source moves and re-powers the board

- **WHEN** the player moves the source square with Ctrl+arrow
- **THEN** the powered/active set is recomputed from the new source

### Requirement: Net takes side notes

Net SHALL let the player note, on the side two tiles share, that a wire
crosses it or that none does. A note SHALL be a move, an absolute set of one
side's note, named from the tile left of the side or above it, so undo covers
it and a save carries it. A save that carries no notes SHALL load unchanged. A
side with a wall on it SHALL take no note.

#### Scenario: A wall takes no note

- **WHEN** notes mode is on and the player clicks near a side with a wall on it
- **THEN** no move is produced

### Requirement: The pointer notes the side a tap lands nearest

Notes SHALL be taken in the collection's notes mode (`ui.pencilMode`, toggled
by the Marks key and `P`, shown by the pencil at the canvas's top-right). In
notes mode a left-click SHALL note a wire across the side of the tile it lands
nearest and a right-click, or a held finger, SHALL note none, each toggling
off a note it would repeat.

#### Scenario: A tap notes the nearest side

- **WHEN** notes mode is on and the player left-clicks near the right side of a tile
- **THEN** the move notes a wire across that side, and the same click again takes the note off

### Requirement: The keyboard notes the side between two tiles

In notes mode a select SHALL pick a tile, and a select on a neighbor of the
picked tile SHALL note the side between them: Enter a wire, Space none. Escape
SHALL let go of the picked tile. On a wrapping grid the tiles either side of a
wrapping edge SHALL be neighbors.

#### Scenario: A note from the keyboard

- **WHEN** notes mode is on, the player selects a tile, moves the cursor to its neighbor and presses Space
- **THEN** the move notes that no wire crosses the side between them

### Requirement: Net flags wrong locks and notes

Net SHALL implement `findMistakes`, flagging a locked tile the solution turns differently and a side note the solution contradicts. A tile turned wrong but unlocked SHALL NOT be flagged, and neither SHALL a note on a side the solution does not settle. A flagged note SHALL be drawn in the error color, and a flagged lock SHALL be ringed in it.

#### Scenario: A wrong note is flagged

- **WHEN** the player notes a wire across a side the solution leaves empty, and checks the board
- **THEN** that note is the one mistake reported, and it is drawn in the error color

### Requirement: Net's hint reasons from notes, locks and walls

Net SHALL provide an explained `hint` that reasons only from the facts a
player records, side notes and locked tiles, and the walls the board shows,
treating an unlocked tile as unknown however it is turned. Each step SHALL add
one fact: a note on a side every surviving way of turning a tile agrees on, or
a lock on a tile only one way of turning survives for.

#### Scenario: A tile turned right but not locked

- **WHEN** a tile already shows the only way it can turn and is not locked
- **THEN** the step that settles it locks it without turning it, and no step
  before it rests on how that tile is turned

### Requirement: A way of turning is ruled out for three reasons only

In Net's hint a way of turning a tile SHALL be ruled out only by a known side
it contradicts, a loop it would close through wires already known, or a group
of tiles it would seal off from the rest of the grid. The step's words SHALL
name each reason it rests on.

#### Scenario: A tile against the wall

- **WHEN** a straight on the edge of a bounded grid is turned into the wall, and the player asks for a hint
- **THEN** the step rings the straight, says it must fit the wall so only one way fits, turns it, and then locks it

### Requirement: A hint's lock is one journey of the turn and the lock

A lock step of Net's hint whose tile must turn first SHALL be one journey of
the turn and the lock. Every step's moves SHALL be ones the declared verbs
make.

#### Scenario: A lock that needs a turn

- **WHEN** the hint locks a tile that is not yet turned the one way that fits
- **THEN** the plan holds a rotation of that tile and then its lock, the lock
  continuing the rotation's step

### Requirement: Net gives no hint while a lock or note is wrong

No hint SHALL be given while `findMistakes` reports a wrong lock or note.

#### Scenario: A wrong note stops the hint

- **WHEN** a note the solution contradicts is on the board
- **THEN** the hint is refused and the player is asked to fix the mistakes first

### Requirement: Net's view controls and jumble have pointer routes

Every action Net's keyboard offers outside its verbs SHALL also be reachable
by a pointer alone: moving the source, the jumble, and scrolling the origin of
a wrapping grid. Source mode and a scroll in progress SHALL be transient `Ui`
state that a save does not carry.

#### Scenario: A save taken in Source mode

- **WHEN** a game is saved while Source mode is on, and restored
- **THEN** Source mode is off, and the source and the origin are where they
  were

### Requirement: The Source key arms a tap that moves the source

The keypad SHALL offer a Source key, also `C` on the keyboard, that arms
Source mode, in which the next press on a square, or a select at the cursor,
moves the source there and ends the mode. Escape SHALL end it without moving
the source, and the status line SHALL say while it is on. Ctrl+arrow SHALL
still move the source.

#### Scenario: The Source key and a tap move the source

- **WHEN** the player presses the Source key and then taps a square
- **THEN** the network is lit from that square, no move is recorded, and Source mode is off

### Requirement: The keypad offers a Jumble key

The keypad SHALL offer a Jumble key, making the same move as `J`.

#### Scenario: The Jumble key jumbles

- **WHEN** the player presses the keypad's Jumble key
- **THEN** a jumble move is made, as `J` makes it

### Requirement: A margin drag scrolls a wrapping grid

A drag begun in the margin around a wrapping grid SHALL scroll its origin by
whole squares, the grid following the pointer, as Shift+arrow scrolls it. On a
grid that does not wrap, a press in the margin SHALL start no scroll.

#### Scenario: A margin drag scrolls as the keys do

- **WHEN** the player drags two squares to the right from the margin of a wrapping grid
- **THEN** the origin is where two presses of Shift+Left leave it

### Requirement: Net's hint follows a wire through tiles not settled yet

A way of turning a tile SHALL count as sealing a group off when each of its
wires stops within a bounded run of tiles and together they reach fewer tiles
than the grid holds. The run past a side SHALL be bounded over every way the
tiles it enters can turn, among the ways that contradict no known side and
close no loop through wires already known. A side whose wire could lead on, or
come back round, SHALL bound nothing.

#### Scenario: Two dead ends and two straights in one column

- **WHEN** the hint is asked on the wrapping board `5x5w:19d7aaae8449d5636cad43c44`
- **THEN** the plan finishes the board, every step agreeing with the solver's answer, and one step locks a straight lying across because, standing upright, it would lead only into the striped squares

#### Scenario: Upstream's boards are hinted to the end

- **WHEN** the generator is run on a seed whose board from upstream's generator is recorded
- **THEN** the hint's engine finishes upstream's board for that seed, and the generator returns that board

### Requirement: A hint says when a wire only leads into open tiles

Where the one turning a step rules out as sealing reaches its group across a
side not yet known to be wired, and the step cites no loop, its words SHALL
say that the turning leads only into the striped squares and that its wire
must stop there however they turn. They SHALL add "without closing a loop"
when a loop is what keeps one of those tiles from leading on. Any step whose
sealed group is reached across such a side SHALL rank as harder than one whose
group the known wires already join.

#### Scenario: A tile on the way could lead on only round a loop

- **WHEN** a tile the wire enters has a way of turning that fits its known sides and would carry the wire on, and that way closes a loop through known wires
- **THEN** the turning is still ruled out as sealing the group, and the step's words say the wire must stop however the tiles turn without closing a loop

### Requirement: Net draws its tiles on a quiet surface and lifts a locked one

`redraw` SHALL draw a tile the player may still turn on the collection's cell
surface, with the surface's grid line between tiles and no heavier frame round
the grid; a wall keeps its own color and weight, since it is content. The
strip outside the grid, where only a wall's outline lands, SHALL stay the
board.

#### Scenario: An untouched board has no lifted tile

- **WHEN** a freshly dealt board is drawn
- **THEN** no tile is drawn on the lifted surface

### Requirement: A locked tile sits on the lifted surface

A locked tile SHALL sit on the collection's lifted surface, the one a given
sits on elsewhere, since a locked tile is one the player has fixed. Locked
SHALL be told by a surface the collection names and SHALL NOT be told by a
step of gray of the game's own.

#### Scenario: A locked tile is the lifted one

- **WHEN** a board is drawn with one tile locked
- **THEN** that tile's surface is the lifted surface and every other tile's is
  the cell surface

### Requirement: The completion flash ripples through the lifted surface

The completion flash SHALL swap each tile between the cell surface and the
lifted surface as its ripple passes, the same surface a lock gives. The
keyboard cursor, the note pin and a hint's ring SHALL stay rings inside the
tile's edge, over whichever surface the tile has.

#### Scenario: The ripple reaches an unlocked tile

- **WHEN** the board is solved and the flash's ripple passes an unlocked tile
- **THEN** that tile is drawn on the lifted surface for a frame and then on
  the cell surface again
