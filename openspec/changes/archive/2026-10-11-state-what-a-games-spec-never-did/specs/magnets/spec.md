## ADDED Requirements

### Requirement: The Magnets cursor walks onto the clues

The keyboard cursor SHALL range over the tiles and the ring of clue slots
around them, and SHALL NOT enter the four corners, which hold no clue.
`CURSOR_SELECT` on a clue slot SHALL toggle that clue's done mark as a
left-click there does, and `CURSOR_SELECT2` on one SHALL do nothing.

#### Scenario: Up from the top row, then Enter

- **WHEN** the 5x6 board
  `13231,210232,31222,301123,LRTLRTTBLRBBTTTLRBBBTLRLRBLRLR` is opened and the
  player presses Up and then Enter
- **THEN** the cursor shows on the first column's `+` clue, above the grid, and
  that clue is marked done

#### Scenario: The cursor stops short of a corner

- **WHEN** the cursor is on the first column's `+` clue and the player presses
  Left
- **THEN** the cursor stays where it is

### Requirement: A Magnets drag repeats its press across tiles or across clues

Magnets SHALL declare a sweep for both buttons. A drag on from a press on a
tile SHALL repeat the press on each square that holds what the pressed square
held, a square's contents and its `?` mark together being what it holds, and
SHALL pass over every clue. A drag on from a press on a clue SHALL repeat it on
each clue whose done mark matched, and SHALL pass over every tile. A singleton
square SHALL never be swept.

#### Scenario: A drag off the grid marks no clue

- **WHEN** the player presses an empty tile, which puts a `+` there, and drags
  across a neutral tile, another empty tile and out over a clue
- **THEN** the second empty tile takes a `+` in the square the pointer crossed,
  and the neutral tile and the clue are left as they were

### Requirement: Strip clues removes each number a Magnets board does not need

With `stripclues` set, `newDesc` SHALL take the board's `+` and `−` numbers in
a random order and remove each one without which the solver at the board's
difficulty still reaches the same answer, so a row or column may carry no
number for a pole. A removed number SHALL be written `.` in the description. A
params label with it set SHALL end in the words "strip clues".

#### Scenario: A stripped preset and a board of it

- **WHEN** the preset whose params are `5x6dtS` is read
- **THEN** it is titled "5x6 Normal, strip clues", and on a board of it such
  as `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` only the third
  and fourth of the five columns have a `+` number, 3 and 1

### Requirement: Magnets' hint settles one tile from what its ends cannot hold

A hint step about one tile SHALL conclude it from the poles the board rules
out of its two ends. A tile marked `?` with a pole ruled out of one end SHALL
take the other pole there ("This magnet's + can't go here, …, so this end must
be −"), or that pole at its other end when the fact is the far end's ("…can't
go at the other end, …, so it must go here"). An unmarked tile SHALL be made
neutral when one pole fits at neither end, or when one end can take neither
pole.

#### Scenario: A marked magnet beside a pole

- **WHEN** a tile marked `?` has an end beside a `−`
- **THEN** the step reads "This magnet's − can't go here, beside another −, so
  this end must be +."

#### Scenario: A tile lying along a met column

- **WHEN** the hint is asked of the unplayed 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB`
- **THEN** it reads "This tile lies along a column with all its −s, so it must
  be neutral." of the tile at the foot of the second column, whose `−` number
  is 0

### Requirement: Magnets' hint counts a line's neutral squares

Of a line with both its numbers, the hint SHALL conclude: when the numbers
leave no more neutral squares, that every tile with an empty square in the line
is a magnet, asking a `?` on each; when the line needs as many more neutral
squares as it has empty squares outside marked magnets, that those squares are
neutral; and, in the Normal tier's part, when it has room for just one more
neutral square, that each undecided tile lying along it is a magnet, asking a
`?` on each.

#### Scenario: A row whose numbers fill it

- **WHEN** the hint is asked of the unplayed 5x6 board
  `13231,210232,31222,301123,LRTLRTTBLRBBTTTLRBBBTLRLRBLRLR`, whose top row
  needs two `+` and three `−` in its five squares
- **THEN** it reads "This row's clues need a + or − in every one of its empty
  squares, so each tile there must be a magnet." and asks a `?` on the row's
  first tile

#### Scenario: Marked magnets are set aside

- **WHEN** the hint is followed on that board through the top row's three `?`
  marks, the middle one on a tile that reaches down into the second row,
  which needs one `+` and no `−`
- **THEN** the next step reads "This row needs 4 more neutral squares and only
  these 4 aren't in marked magnets, so they must be neutral."

### Requirement: Magnets' hint counts the squares that can still take a line's pole

When a line needs as many more of one pole as it has empty squares that can
still take that pole, the hint SHALL conclude that those squares hold it, and
SHALL place each of their tiles that way round.

#### Scenario: One square left for a pole

- **WHEN** a row needs one more `+` and its one empty square can take it
- **THEN** the step reads "This row needs one more + and only this square can
  still take one, so it must be +."

### Requirement: Magnets' hint counts the tiles that can still give a line its pole

In the Normal tier's part the hint SHALL count a line's tiles, one lying along
it counting once. Where the line needs as many more of a pole as it has
undecided tiles, each SHALL be a magnet and take a `?`. Where it needs as many
more as it has tiles that can still give one, a tile able to take the pole at
only one of its squares there SHALL take it. For `−` on a line with a `+`
number, that count takes in the tiles that can still give a `+`, so it
concludes only when none can.

#### Scenario: A tile lying along the column counts once

- **WHEN** the hint is asked of the 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` with its second
  column's bottom tile neutral
- **THEN** its step begins "This column needs 3 more +s, one per magnet, and
  just 3 tiles can give one"

#### Scenario: Every undecided tile is needed

- **WHEN** a row needs three more `−` and has three undecided tiles
- **THEN** the step reads "This row needs 3 more −s and has only 3 undecided
  tiles, so each must be a magnet."

### Requirement: Magnets' hint starts a line's one odd gap with the pole it has more of

When a line has all its neutral squares, needs exactly one more of one pole
than of the other, and exactly one of its runs of empty squares is of odd
length, the hint SHALL conclude that the first square of that run, the leftmost
or the topmost, holds the pole the line needs more of: "This row's empty
squares take alternating poles, one more + than −, so this odd-length gap must
start with +."

#### Scenario: Two odd gaps conclude nothing

- **WHEN** a line that needs one more `+` than `−` has two runs of empty
  squares of odd length
- **THEN** no step of this kind is offered for that line

### Requirement: Magnets' hint tries one tile first, then the lines, columns before rows

The hint SHALL begin again from its first technique after every step: a tile
settled from its ends; then a line's neutral count or pole count met or exactly
reachable; the odd gap; and then the Normal tier's part, in the order one
neutral square left, every undecided tile needed, and a tile's only end. A
technique about a line SHALL try the columns left to right and then the rows
top to bottom. Every technique SHALL be tried whatever the board's difficulty.

#### Scenario: A Normal board opens on a single tile

- **WHEN** the hint is asked of the unplayed 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB`, of the preset
  `5x6dtS`
- **THEN** its first step makes the tile at the foot of the second column
  neutral, and only the next counts a column's tiles
