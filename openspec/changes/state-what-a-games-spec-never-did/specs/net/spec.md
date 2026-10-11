## ADDED Requirements

### Requirement: Net descriptions are a hex digit a tile, with its barriers

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

### Requirement: Net refuses a single square and a grid past a million squares

`validateParams` SHALL refuse a grid whose width and height are both 1, and
one of more than 1,000,000 squares, whether or not a board is to be dealt. A
grid one square wide and longer SHALL be admitted at Easy.

#### Scenario: The smallest and the largest grids

- **WHEN** a 1×1, a 1×2, a 1000×1000 and a 1000×1001 grid are validated at
  Easy
- **THEN** the 1×1 is refused with "At least one of width and height must be
  greater than one.", the 1000×1001 as too large, and the other two admitted

### Requirement: Net's one preference keeps loop highlighting to locked squares

A wire that is part of a loop SHALL be drawn in the error color. The
preference `unlocked-loops`, "Highlight loops involving unlocked squares",
SHALL be on by default. Turned off, a wire SHALL be drawn so only where the
loop it is part of runs through locked squares alone.

#### Scenario: A loop with one square unlocked

- **WHEN** four squares are turned into a loop and three of them are locked
- **THEN** the loop's wires are in the error color with the preference on,
  and in their ordinary color with it off

### Requirement: Net's cursor wraps round the grid

An arrow key SHALL move the cursor one square, and from an edge on to the
opposite edge, whether or not the grid wraps.

#### Scenario: Left from the first column of a bounded grid

- **WHEN** the cursor is on the top-left square of a 5×5 grid that does not
  wrap and Left is pressed
- **THEN** the cursor is on the top-right square

### Requirement: A notes-mode drag repeats its note or its lock

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

### Requirement: Net's hint takes the easiest step first

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

### Requirement: Net's status bar counts the squares lit

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
