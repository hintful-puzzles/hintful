# net Specification

## Purpose
Net, the puzzle of rotating tiles until every wire joins one connected network
with no loops. Its boards are uniquely solvable without guessing, its tiles
rotate and lock, its jumble replays deterministically, its source is movable,
and its player can note the sides of tiles.

## Requirements

### Requirement: Rules: Net's board and what counts as solved

A Net board SHALL be a `w × h` grid of wire tiles, each a 4-bit mask of
connections (`R=1`, `U=2`, `L=4`, `D=8`), whose solved configuration is a
spanning tree rooted at a source square. The player SHALL rotate tiles, and
the game SHALL be solved when every tile is connected to the source and
powered.

#### Scenario: The last tile is turned into place

- **WHEN** the player turns the one tile that was cut off so that it joins the
  network
- **THEN** every tile is powered from the source and the game is solved

### Requirement: Rules: Jumble is deterministic on replay

The `j` jumble SHALL rotate every unlocked tile by a random amount, and SHALL
record the result as an explicit per-tile rotation list so that replaying the
move log reproduces the same board without the RNG. The keypad SHALL offer a
Jumble key, making the same move as `J`.

#### Scenario: A jumbled board restores exactly on load

- **WHEN** a game is jumbled, saved, and restored
- **THEN** the restored board matches the jumbled board tile-for-tile

#### Scenario: The Jumble key jumbles

- **WHEN** the player presses the keypad's Jumble key
- **THEN** a jumble move is made, as `J` makes it

### Requirement: Rules: Net takes side notes

Net SHALL let the player note, on the side two tiles share, that a wire
crosses it or that none does. A note SHALL be a move, an absolute set of one
side's note, named from the tile left of the side or above it, so undo covers
it and a save carries it. A save that carries no notes SHALL load unchanged. A
side with a wall on it SHALL take no note.

#### Scenario: A wall takes no note

- **WHEN** notes mode is on and the player clicks near a side with a wall on it
- **THEN** no move is produced

### Requirement: Rules: Net flags wrong locks and notes

Net SHALL implement `findMistakes`, taking the board's one answer from the
search that counts its answers, at either difficulty, and flagging a locked
tile the answer turns differently and a side note the answer contradicts. A
tile turned wrong but unlocked SHALL NOT be flagged. Where the search did not
prove exactly one answer it SHALL flag nothing. A flagged note SHALL be drawn
in the error color, and a flagged lock SHALL be ringed in it.

#### Scenario: A wrong note is flagged

- **WHEN** the player notes a wire across a side the solution leaves empty, and checks the board
- **THEN** that note is the one mistake reported, and it is drawn in the error color

#### Scenario: A wrong lock on an Unreasonable board is flagged

- **WHEN** the hint has stopped on an Unreasonable board and the player locks
  a square a quarter turn from where the answer has it
- **THEN** the mistake check reports it

### Requirement: Rules: A Net answer is one network with no loop

An answer SHALL be a turning of every tile in which every wire end meets
another across a side with no wall, the wires join every tile, and no loop is
closed. A board whose tiles can be joined up only with a loop SHALL have no
answer.

#### Scenario: A loop is no answer

- **WHEN** a 2×2 board of four corners, which join up only as a loop, is
  entered
- **THEN** it is refused as contradictory

### Requirement: Params: Net's params and their encoding

Params SHALL be `w`, `h`, `wrapping`, `barrierProbability` and the difficulty,
encoded `{w}x{h}[w][b{prob}]d{e|u}`: `w` for wrapping, and the `b` suffix and
the difficulty, Easy as `de` or Unreasonable as `du`, only in the full
encoding. An ID with no difficulty letter SHALL decode as Easy. Decoding SHALL
skip the letter `a`, which elsewhere asks for an unchecked board, and encoding
SHALL never write it. `validateParams` SHALL reject a `wrapping` board with a
side of length 2.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 7, h: 9, wrapping: true, barrierProbability: 0.25 }` at
  Unreasonable are encoded in full
- **THEN** the result is `7x9wb0.25du`, the shared encoding is `7x9w`, and
  decoding the full one round-trips the params

#### Scenario: A string from before the tiers

- **WHEN** `7x9wb0.25`, written before the game had tiers, is decoded
- **THEN** the params are Easy, and their full encoding is `7x9wb0.25de`

#### Scenario: The unchecked-board letter

- **WHEN** `7x9wb0.25a` is decoded
- **THEN** the params are those of `7x9wb0.25`

### Requirement: Params: Net refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide, wrapping or not, and without wrapping one two wide and
up to six long, a 3×3 one and a 3×4 one. The solver settles every board of
those shapes that has one answer.

#### Scenario: The small boards are not dealt at Unreasonable

- **WHEN** a 1×9, a 2×6 and a 4×3 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×6 board is still dealt at Easy, and a 3×4 wrapping board is
  admitted at Unreasonable

#### Scenario: Every board of a refused shape is tried

- **WHEN** every network on a 2×2 to 2×6, a 3×3 and a 3×4 board, with every
  set of walls on the sides it leaves unwired, is given to the solver, and
  those it leaves unfinished are counted
- **THEN** none of them has exactly one answer
- **AND** the same walk over a 3×4 wrapping board finds one that does

### Requirement: Params: Unreasonable Net is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 900 squares, one without wrapping under seven squares wide
and over 40 long, a wrapping one longer than 80 squares, or longer than 30
where it is four squares wide, and one with a barrier probability over 0.2,
each with a reason naming the difficulty. The same board SHALL still be asked
for at Easy.

#### Scenario: A board past a bound is refused at Unreasonable only

- **WHEN** a 31×30 board, a 6×41 board, a 10×81 wrapping board, a 31×4
  wrapping board and a 7×7 board with a barrier probability of 0.21 are
  checked for dealing at each difficulty
- **THEN** each is refused at Unreasonable and not at Easy
- **AND** a 30×30, a 7×128, a 6×40, a 10×80 wrapping, a 4×30 wrapping and a
  7×7 board with a barrier probability of 0.2 are admitted at Unreasonable

### Requirement: Params: Net refuses Unreasonable without wrapping where it is too rare

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board without wrapping whose shorter side is under five squares, and a 5×5
one, each as too rare to deal. The hint finishes nearly every such board the
solver stops on. The same board SHALL still be asked for at Easy, and with
wrapping at Unreasonable.

#### Scenario: The small boards without wrapping

- **WHEN** a 5×5, a 4×30, a 3×5 and a 2×7 board are asked for at Unreasonable
- **THEN** each is refused as too rare to deal
- **AND** a 5×6 and a 7×7 board are admitted, and so are a 5×5 and a 4×4
  wrapping board

### Requirement: Params: Net's menu offers each size at the difficulties it deals

Net's presets SHALL offer 5×5 as Easy, each of 7×7, 9×9, 11×11 and 11×13 as
Easy and as Unreasonable, then one wrapping 7×7 board at Easy, and the default
SHALL be the Easy 5×5.

#### Scenario: Every size from 7×7 is offered at both difficulties

- **WHEN** Net's preset menu is read
- **THEN** 5×5 appears as Easy alone, the four larger sizes each appear as
  Easy and then as Unreasonable, and the wrapping board comes last

### Requirement: Params: Net refuses a single square and a grid past a million squares

`validateParams` SHALL refuse a grid whose width and height are both 1, and
one of more than 1,000,000 squares, whether or not a board is to be dealt. A
grid one square wide and longer SHALL be admitted at Easy.

#### Scenario: The smallest and the largest grids

- **WHEN** a 1×1, a 1×2, a 1000×1000 and a 1000×1001 grid are validated at
  Easy
- **THEN** the 1×1 is refused with "At least one of width and height must be
  greater than one.", the 1000×1001 as too large, and the other two admitted

### Requirement: Description: Net descriptions are a hex digit a tile, with its barriers

The desc SHALL give the tiles in reading order, each as one lowercase hex
digit of its wire mask, followed by `v` where a barrier stands on its right
side and then `h` where one stands below it. The last column SHALL take no
`v` and the last row no `h` unless the params wrap: a board that does not
wrap is walled round its border, which the desc does not write. A desc with
any other character, an `h` before its tile's `v`, or more or fewer than
`w·h` tiles SHALL be refused.

#### Scenario: A dealt board with no barrier inside it

- **WHEN** `843886bbb66dae95ceda11112` is opened on a 5×5 grid
- **THEN** its first tile is a dead end pointing down (`8`), its third a
  corner joining right and up (`3`), and the only walls are the border's

#### Scenario: A wrapping board walled all round

- **WHEN** `000v000v0h0h0vh` is opened on a wrapping 3×3 grid
- **THEN** every tile of the last column has a wall on its right and every
  tile of the last row one below it, and the board does not wrap in play

#### Scenario: Each refusal

- **WHEN** `843886bbb66dae95ceda11112` is offered on a 5×5 grid with its last
  digit dropped, with its first digit changed to `g`, and with `hv` put after
  its first digit
- **THEN** the first is refused as too short, the second for its `g` and the
  third for its `v`

### Requirement: Generation: Every Easy Net board is uniquely solvable without guessing

At Easy the generator SHALL gate every board through its own solver,
perturbing the wiring until the board has exactly one solution reachable by
pure deduction, and SHALL then keep the board only if the hint's engine
finishes it from the opening position, dealing another otherwise. The boards
it deals for a seed SHALL be upstream's, draw for draw.

#### Scenario: A generated board has one deducible solution

- **WHEN** a board is generated at Easy
- **THEN** the solver reports it uniquely solvable, and no guess is required to reach the
  solution

#### Scenario: A generated board is hinted to the end

- **WHEN** a board is generated at Easy and the player follows the hint from the opening position
- **THEN** every step agrees with the solution and the board ends solved

### Requirement: Generation: A board two squares wide is dealt

The generator SHALL deal a board with a side of two squares without fail. Its
shuffle reads the grid as a torus when it looks for loops, where two tiles
side by side on such a board can be joined twice, and SHALL take the two
joins as a loop.

#### Scenario: Forty deals of each two-wide board

- **WHEN** 2×5, 5×2 and 2×9 boards are dealt from forty seeds each
- **THEN** every deal returns a board

### Requirement: Generation: A pasted Net board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the hint finishes
it, whether or not the solver does, and as Unreasonable where it has exactly
one answer that the hint does not reach, whatever lower difficulty its ID
states. A board with several answers SHALL be refused as having more than one
solution, and a board with none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 3×4 wrapping ID whose board has one answer the hint does not
  reach is entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `3x4wdu`

#### Scenario: A board the hint finishes past the solver opens as Easy

- **WHEN** `5x5:81924a3be3be5731bb848cca2`, which the solver stops short of
  and the hint finishes, is entered with no difficulty letter
- **THEN** it opens, and the board's params read `5x5de`

#### Scenario: A board with several answers or none is refused

- **WHEN** a network as first drawn that other turnings join up too, and a
  board with one wire end too many, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Generation: An Unreasonable Net board has one answer that the hint does not reach

At Unreasonable the generator SHALL stop the perturbing of the wiring at the
first network the solver cannot settle that the search proves has one answer,
within the engine's dealing budget, and SHALL draw another network where the
solver settles one. The board SHALL be kept only when, as dealt with its walls
drawn, the solver stops short of it and so does the hint's engine, asked from
the tiles the solver settled.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards at 3×4 and 4×4 wrapping, at
  5×6 and 6×6, and at 5×5 wrapping with a barrier probability of 0.2
- **THEN** the solver leaves each unfinished, and so does the hint's engine
- **AND** exactly one turning fits each, by a count that has no search in it
- **AND** that answer is the network the board was drawn as

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 3×4 wrapping board, a 5×6 board and an 11×13 board
  is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Solver: Net counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
solver: where the solver stops, it SHALL take the first tile with the fewest
turnings left and assume each in turn. It SHALL report one answer, several,
none, or that it stopped at its budget, which SHALL be counted in positions
and never in time. Solve SHALL take the answer from it at either difficulty,
or from the network a dealt board was drawn as.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 3×4 wrapping board the solver finishes, on one
  with one answer that it does not reach, on a network as first drawn that
  other turnings join up too, and on a board with one wire end too many
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given four positions on a board that needs five
- **THEN** it reports that it stopped, and with five it reports one answer
- **AND** the same holds however the board's tiles are turned when it is asked

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×4 to 5×5, networks as first drawn, the same
  boards with two tiles swapped and with one wall changed are each counted by
  turning the tiles one at a time in reading order and reading each finished
  grid for one network
- **THEN** the search reports one answer exactly where one turning fits,
  several where more do and none where none does

### Requirement: Controls: Tiles rotate and lock

Left-click or `a` SHALL rotate a tile anticlockwise, right-click or `d` clockwise, and `f`
by 180°. `s` SHALL toggle a tile's lock, and so SHALL a tap in the middle
third of a tile in notes mode, where the pointer's other taps note sides:
outside notes mode both buttons rotate, so notes mode is where the pointer
reaches the lock. A locked tile SHALL NOT rotate.

#### Scenario: A tap in the middle of a tile in notes mode locks it

- **WHEN** notes mode is on and the player taps, or right-clicks, the middle third of a tile
- **THEN** the tile's lock toggles, and a tap nearer one of its sides notes that side instead

### Requirement: Controls: The source and origin are movable Ui state

The powered source square SHALL be movable with Ctrl+arrow, and on a wrapping
grid the display origin SHALL be shiftable with Shift+arrow. Both SHALL be Ui
state (not board state) and SHALL survive a save. A shift of the origin SHALL
NOT be offered on a grid whose every border edge is walled: such a grid is
treated as non-wrapping.

#### Scenario: The source moves and re-powers the board

- **WHEN** the player moves the source square with Ctrl+arrow
- **THEN** the powered/active set is recomputed from the new source

### Requirement: Controls: The pointer notes the side a tap lands nearest

Notes SHALL be taken in the collection's notes mode. In notes mode a
left-click SHALL note a wire across the side of the tile it lands
nearest and a right-click, or a held finger, SHALL note none, each toggling
off a note it would repeat.

#### Scenario: A tap notes the nearest side

- **WHEN** notes mode is on and the player left-clicks near the right side of a tile
- **THEN** the move notes a wire across that side, and the same click again takes the note off

### Requirement: Controls: The keyboard notes the side between two tiles

In notes mode a select SHALL pick a tile, and a select on a neighbor of the
picked tile SHALL note the side between them: Enter a wire, Space none. Escape
SHALL let go of the picked tile. On a wrapping grid the tiles either side of a
wrapping edge SHALL be neighbors.

#### Scenario: A note from the keyboard

- **WHEN** notes mode is on, the player selects a tile, moves the cursor to its neighbor and presses Space
- **THEN** the move notes that no wire crosses the side between them

### Requirement: Controls: Net's view controls and jumble have pointer routes

Every action Net's keyboard offers outside its verbs SHALL also be reachable
by a pointer alone: moving the source, the jumble, and scrolling the origin of
a wrapping grid. Source mode and a scroll in progress SHALL be transient `Ui`
state that a save does not carry.

#### Scenario: A save taken in Source mode

- **WHEN** a game is saved while Source mode is on, and restored
- **THEN** Source mode is off, and the source and the origin are where they
  were

### Requirement: Controls: The Source key arms a tap that moves the source

The keypad SHALL offer a Source key, also `C` on the keyboard, that arms
Source mode, in which the next press on a square, or a select at the cursor,
moves the source there and ends the mode. Escape SHALL end it without moving
the source, and the status line SHALL say while it is on. Ctrl+arrow SHALL
still move the source.

#### Scenario: The Source key and a tap move the source

- **WHEN** the player presses the Source key and then taps a square
- **THEN** the network is lit from that square, no move is recorded, and Source mode is off

### Requirement: Controls: A margin drag scrolls a wrapping grid

A drag begun in the margin around a wrapping grid SHALL scroll its origin by
whole squares, the grid following the pointer, as Shift+arrow scrolls it. On a
grid that does not wrap, a press in the margin SHALL start no scroll.

#### Scenario: A margin drag scrolls as the keys do

- **WHEN** the player drags two squares to the right from the margin of a wrapping grid
- **THEN** the origin is where two presses of Shift+Left leave it

### Requirement: Controls: A Net click off a tile or on a locked tile makes no move, and a turn back is a move

A click outside the grid, a rotating click in the gutter between tiles, and a
rotate on a locked tile SHALL produce no move. A turn that undoes the turn
before it SHALL still be a move of its own.

#### Scenario: Rotating a locked tile does nothing

- **WHEN** the player left-clicks a tile that is locked
- **THEN** no move is produced and the board is unchanged

#### Scenario: A tile rotated full circle leaves ordinary undo history

- **WHEN** the player rotates a tile anticlockwise and then clockwise
- **THEN** the board is back to its original wiring and there are two ordinary undo entries

### Requirement: Controls: Net's cursor wraps round the grid

An arrow key SHALL move the cursor one square, and from an edge on to the
opposite edge, whether or not the grid wraps.

#### Scenario: Left from the first column of a bounded grid

- **WHEN** the cursor is on the top-left square of a 5×5 grid that does not
  wrap and Left is pressed
- **THEN** the cursor is on the top-right square

### Requirement: Controls: A notes-mode drag repeats its note or its lock

In notes mode a drag on from a press SHALL be the engine's sweep. From a side
it SHALL give the press's note to each further side it passes near the middle
of that held what the pressed side held; from the middle of a square it SHALL
lock, or unlock, each further square whose lock stood as the pressed one's
did. A drag from a side SHALL take no middle and one from a middle no side.
Outside notes mode a drag SHALL turn nothing further.

#### Scenario: A drag of wire notes passes a side already noted

- **WHEN** notes mode is on and the player presses the left button near a
  side with no note and drags past a side noted as having no wire and a side
  with no note
- **THEN** both unnoted sides are noted as having a wire across them and the
  third keeps its note

### Requirement: Preferences: Net's one preference keeps loop highlighting to locked squares

A wire that is part of a loop SHALL be drawn in the error color. The
preference `unlocked-loops`, "Highlight loops involving unlocked squares",
SHALL be on by default. Turned off, a wire SHALL be drawn so only where the
loop it is part of runs through locked squares alone.

#### Scenario: A loop with one square unlocked

- **WHEN** four squares are turned into a loop and three of them are locked
- **THEN** the loop's wires are in the error color with the preference on,
  and in their ordinary color with it off

### Requirement: Hint: Net's hint reasons from notes, locks and walls

Net SHALL provide an explained `hint` that reasons only from the facts a
player records, side notes and locked tiles, and the walls the board shows,
treating an unlocked tile as unknown however it is turned. Each step SHALL add
one fact: a note on a side every surviving way of turning a tile agrees on, or
a lock on a tile only one way of turning survives for.

#### Scenario: A tile turned right but not locked

- **WHEN** a tile already shows the only way it can turn and is not locked
- **THEN** the step that settles it locks it without turning it, and no step
  before it rests on how that tile is turned

### Requirement: Hint: A hint's lock is one journey of the turn and the lock

A lock step of Net's hint whose tile must turn first SHALL be one journey of
the turn and the lock.

#### Scenario: A lock that needs a turn

- **WHEN** the hint locks a tile that is not yet turned the one way that fits
- **THEN** the plan holds a rotation of that tile and then its lock, the lock
  continuing the rotation's step

### Requirement: Hint: Net's hint follows a wire through tiles not settled yet

A way of turning a tile SHALL count as sealing a group off when each of its
wires stops within a bounded run of tiles and together they reach fewer tiles
than the grid holds. The run past a side SHALL be bounded over every way the
tiles it enters can turn, among the ways that fit the known sides and close
no loop through known wires. A side whose wire could lead on, or come back
round, SHALL bound nothing. Where no step follows, it SHALL be bounded again
with the tile held as turned.

#### Scenario: Two dead ends and two straights in one column

- **WHEN** the hint is asked on the wrapping board `5x5w:19d7aaae8449d5636cad43c44`
- **THEN** the plan finishes the board, every step agreeing with the solver's answer, and one step locks a straight lying across because, standing upright, it would lead only into the striped squares

#### Scenario: Upstream's boards are hinted to the end

- **WHEN** the generator is run on a seed whose board from upstream's generator is recorded
- **THEN** the hint's engine finishes upstream's board for that seed, and the generator returns that board

#### Scenario: A group sealed only once the tile's own wires count

- **WHEN** the hint is followed on `5x5:64432a4be63e6364eb7815332`, which the
  solver stops short of
- **THEN** the plan finishes the board, every step agreeing with its one
  answer, and no step rests on a tile beside the one it turns

### Requirement: Hint: A hint says when a wire only leads into open tiles

Where the one turning a step rules out as sealing reaches its group across a
side not yet known to be wired, or past a tile only a loop keeps from leading
on, and the step cites no loop, its words SHALL say that the turning leads
only into the striped squares, where its wire must stop however they turn,
adding "without closing a loop" in the second case. Any step whose sealed
group is reached across such a side SHALL rank as harder than one whose group
the known wires already join.

#### Scenario: A tile on the way could lead on only round a loop

- **WHEN** a tile the wire enters has a way of turning that fits its known sides and would carry the wire on, and that way closes a loop through known wires
- **THEN** the turning is still ruled out as sealing the group, and the step's words say the wire must stop however the tiles turn without closing a loop

### Requirement: Hint: Net's hint stops where its deductions do

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the notes and locks its four reasons force from the player's locks,
notes and the walls, and no others, and where none is forced it SHALL refuse
with the collection's sentence that deduction has run out. It SHALL go on
from the squares the player then locks.

#### Scenario: The hint stops, and goes on from a square locked rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** with a square locked as the solution has it wherever the hint stops,
  the hint finishes the board

### Requirement: Hint: A way of turning is ruled out for four reasons only

In Net's hint a way of turning a tile SHALL be ruled out only by a known side
it contradicts, a loop it would close through wires already known, a group of
tiles it would seal off from the rest of the grid, or a tile beside it that it
would leave no way to turn. The step's words SHALL name each reason it rests
on.

#### Scenario: A tile against the wall

- **WHEN** a straight on the edge of a bounded grid is turned into the wall, and the player asks for a hint
- **THEN** the step rings the straight, says it must fit the wall so only one way fits, turns it, and then locks it

### Requirement: Hint: A turning that leaves the tile beside it no way is ruled out

Where no step follows from the facts as recorded, a way of turning a tile
SHALL be ruled out when, with the tile held that way, every way of a tile
beside it contradicts a known side or closes a loop through known wires, the
held tile's sides and wires among the known. A way of the tile beside it SHALL
NOT be ruled out there by a group it would seal off. The step SHALL outline
the tile beside it and stripe the squares the loops run through.

#### Scenario: A T that leaves a straight no way

- **WHEN** the hint is followed on `5x5:81924a3be3be5731bb848cca2` to the T at
  column 2 of row 3, whose ways but two contradict locked tiles
- **THEN** the step rings the T and says that, pointing up, down and left, it
  would leave the outlined straight no way to fit it without closing a loop
  through the striped squares
- **AND** the straight beside it is outlined, and the four squares the loop
  runs through are striped

### Requirement: Hint: Net's hint takes the easiest step first

Each step SHALL be the easiest the recorded facts give, judged by the hardest
reason it cites: walls alone, then a note or a lock, then a loop, then a
sealed group the known wires join, then one a wire reaches through open
tiles, then a tile beside it left no way. Among steps equally hard a lock
SHALL come before a note, and then the tile first in reading order. A tile
SHALL be looked at as turned only where no step follows from the facts as
recorded.

#### Scenario: The walls come first

- **WHEN** the hint's plan is read on the 5×5 board
  `843886bbb66dae95ceda11112`
- **THEN** it opens "This straight must fit the wall, so only one way fits:
  turn it." and then locks that straight
- **AND** its one journey that cites a sealed group, a dead end that would
  join another and close the two off, comes after 23 steps that cite sides
  alone

### Requirement: Status bar: Net's status bar counts the squares lit

While the source square holds a wire and some square that holds one is not
lit, the status bar SHALL read `Active: {lit}/{wired}`: the squares lit from
the source, over the squares that hold a wire. It SHALL be empty otherwise.
In Source mode it SHALL read "Tap a square to light the network from it."
before that count, or alone where there is none.

#### Scenario: A board as dealt, and Source mode

- **WHEN** `843886bbb66dae95ceda11112` is opened on a 5×5 grid
- **THEN** the status bar reads "Active: 3/25"
- **AND** with Source mode on it reads "Tap a square to light the network
  from it. Active: 3/25"

### Requirement: Look: Net draws its tiles on a quiet surface and lifts a locked one

`redraw` SHALL draw a tile the player may still turn on the collection's cell
surface, with the surface's grid line between tiles and no heavier frame round
the grid; a wall keeps its own color and weight, since it is content. The
strip outside the grid, where only a wall's outline lands, SHALL stay the
board.

#### Scenario: An untouched board has no lifted tile

- **WHEN** a freshly dealt board is drawn
- **THEN** no tile is drawn on the lifted surface

### Requirement: Look: A locked tile sits on the lifted surface

A locked tile SHALL sit on the collection's lifted surface, the one a given
sits on elsewhere, since a locked tile is one the player has fixed. Locked
SHALL be told by a surface the collection names and SHALL NOT be told by a
step of gray of the game's own.

#### Scenario: A locked tile is the lifted one

- **WHEN** a board is drawn with one tile locked
- **THEN** that tile's surface is the lifted surface and every other tile's is
  the cell surface

### Requirement: Look: The completion flash spreads from the source along the wires

The completion flash SHALL spread from the source along the wires: a tile's
position SHALL be its distance from the source in tiles along the connections,
through the wrap of a wrapping board and never through a barrier. A lit tile's
ground SHALL be filled with a flash color, locked or not, and the tile SHALL
keep its wires. The keyboard cursor, the note pin and a hint's ring SHALL stay
rings inside the tile's edge, over whichever ground the tile has.

#### Scenario: The ripple reaches an unlocked tile

- **WHEN** the board is solved and the flash's highlight is on an unlocked tile
- **THEN** that tile's ground is a flash color, and the cell surface again
  once the highlight has left it

#### Scenario: The ripple reaches a locked tile

- **WHEN** the highlight is on a tile the player locked
- **THEN** that tile's ground is a flash color, and the lifted surface again
  once the highlight has left it

#### Scenario: A neighbor the wires do not join

- **WHEN** a tile beside the source has no wire into it
- **THEN** it lights when the highlight has traveled the wires that do reach
  it, later than the tiles the source is wired to
