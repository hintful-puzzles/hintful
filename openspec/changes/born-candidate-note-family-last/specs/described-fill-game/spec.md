## ADDED Requirements

### Requirement: A born game's clue at the board may be derived from its answer

A clue at the board whose deal samples an answer SHALL be dealt as one
record for each value of every field but the last, in their values' order,
the last field read off the answer by the meaning `E = f(k)`. A meaning of
any other shape, or a key field whose values are no range of numbers, SHALL
be refused by the compiler. While the answer is built, the clue SHALL hold
no record.

#### Scenario: The totals of a board

- **WHEN** a `totaling` board is dealt and solved
- **THEN** its clue holds a record for blocks and one for discs, each
  counting the squares of the answer holding it

### Requirement: A born game's ID may write a clue at the board

The ID's `numbers` segment of a clue at the board the deal derives SHALL
write each record's last field, in the records' order, and a desc whose
value is past the field's range SHALL be refused.

#### Scenario: The totals written first

- **WHEN** a `totaling` board is dealt
- **THEN** its ID begins with the count of blocks and of discs, and reads
  back to the same board

### Requirement: A born game's clue at the board may be drawn as a row of counts

`play.counts` SHALL draw a clue at the board the deal derives beneath the
board, each record its value's piece and its count, the count in the error
color where the rules break the record and gray where every one of its
value is placed; the row SHALL be centered within the board's width. A
press on a record SHALL place its value as the value's key does.

#### Scenario: A pressed count places its value

- **WHEN** the cursor is on an open square of a `totaling` board and the
  disc's count is pressed
- **THEN** the square holds a disc

#### Scenario: A finished count

- **WHEN** every ghost of a `portraying` board's total is placed
- **THEN** the ghost's count is gray, and not in the error color

### Requirement: A row of counts may read in the player's style

`play.countStyle` SHALL offer the player a preference, under the key it
names, for how a count reads: Total, Remaining, Placed/Total, or
Left/Total, the last by default, every style fitting the same row.

#### Scenario: A count in each style

- **WHEN** a `portraying` board whose total of ghosts is 3 holds one ghost,
  drawn in each count style
- **THEN** the ghost's count reads `3`, `−2`, `1/3` and `2/3`

### Requirement: A born game's board of numbers may be drawn as pictures

`play.numbers.pictures` SHALL draw each value the player places by the
painter it names in place of its glyph: placed, as a piece filling its
square; noted, as a small piece in a two-by-two grid filling the square;
and in a row of counts, as its record's piece. The player's preference,
named by the description and pictures by default, SHALL draw the glyphs
instead, and `A` SHALL switch it.

#### Scenario: Pictures and letters

- **WHEN** a `portraying` board is drawn, and drawn again with the
  preference switched
- **THEN** a given ghost is drawn as a ghost and no `G`, then as a `G` and
  no ghost, and the row of counts likewise

#### Scenario: Notes drawn as pictures

- **WHEN** an open square of a `portraying` board is noted a ghost, a
  vampire and a zombie
- **THEN** it draws three small monsters, the first two side by side and
  the third beneath the first

### Requirement: A picture's name is how a player is told its value

Each picture SHALL have a name, which the hint says its value by, with its
article ("can only be a ghost", "the struck ghost must go"), and the keypad
labels its key with, capitalized. A digit SHALL type the value it numbers
whatever the alphabet's letters.

#### Scenario: The keypad of a board of monsters

- **WHEN** the keys of a `sighting` board are asked for, and `1` and `3`
  are typed on an open square
- **THEN** they are labeled Ghost, Vampire, Zombie and Clear, and the square
  holds a ghost, then a zombie

### Requirement: The compiler refuses pictures a board cannot draw

The compiler SHALL refuse `play.numbers.pictures` naming a painter no
description may name, painting values that are not every value from 1,
beside an alphabet of another length or holding A, or beside a raised
value or an empty square.

#### Scenario: An alphabet holding A

- **WHEN** a `portraying` description's alphabet is `GAZ`
- **THEN** the compiler refuses it, since `A` switches the pictures

### Requirement: A board of notes no placement narrows offers no auto-pencil preference

A born game whose board has no unit and no technique run on placing SHALL
offer no preference to remove what a placement rules out, since a placement
rules out nothing.

#### Scenario: A board of monsters

- **WHEN** the preferences of a `sighting` game are listed
- **THEN** none of them removes what a placement rules out

### Requirement: The compiler refuses a step the walk never reads

The compiler SHALL refuse a board of notes' step worded under a name the
candidate walk reads on no board and no other step's clause speaks, since
the walk says its singles and its opening in the engine's words.

#### Scenario: A worded single

- **WHEN** a `boxing` description words a step `single`
- **THEN** the compiler refuses it

### Requirement: A born game's board of numbers may hold values only the deal places

`play.given` on a board of numbers SHALL name values, running on from one
another above every value the player places, that only a clue fixing a
cell holds: each SHALL be drawn by its painter whatever the player's
preference, printed as its glyph, offered no key and taken by no note, and
the keypad SHALL end below them. The answer's domain MAY differ from cell
to cell where such a clue narrows it, and the board's givens SHALL be the
values below them.

#### Scenario: A mirror on a board of monsters

- **WHEN** a `sighting` board with a mirror is drawn as pictures and again
  as letters
- **THEN** the mirror is drawn as the same lines both times, and its
  keypad offers a ghost and a zombie alone

### Requirement: A born game's derived clue may read a kind dealt before it

A clue a sampled deal derives whose meaning reads another clue kind SHALL
be handed the clues dealt before it, and the compiler SHALL refuse one
reading a kind dealt after it. A clue at the board read a binding whose
binding or fields read a clue kind, directly or through a definition,
SHALL be handed the clues dealt before it the same way.

#### Scenario: Sightlines through mirrors

- **WHEN** the `sighting` description lists its sightline numbers after
  its mirrors, and again before them
- **THEN** the first deals the numbers through the mirrors, and the second
  is refused

#### Scenario: Runs between walls

- **WHEN** an `opening` board is dealt, its list read along the runs a
  definition finds between its walls
- **THEN** the list holds each run's digits

### Requirement: A born game's ID may write slots side by side, a side backwards

An `id:` segment of a kind at slots, `numbers` or a stream, SHALL write
the slots side by side in the order `sides` names, each side left to right
or top to bottom, or the other way where it is named `backwards`, and the
compiler SHALL refuse a side named twice. The text format SHALL print a
row of counts beneath the grid, each record its value's glyph and count.

#### Scenario: Upstream Undead's clockwise numbers

- **WHEN** a `sighting` ID writes twelve numbers round a 3x3 grid as
  top, right, bottom backwards, left backwards
- **THEN** each number is read at the slot going round the grid clockwise
  from the top left, and the board writes back the same ID

### Requirement: A born game's first cells may be laid a cell at a time, each one of several values

A sample's `first` cells SHALL be laid either by a share and a symmetry
the settings give, or each cell alone at a `chance`, the board drawn again
until the share laid is within `within`; of a list of values, each cell
laid SHALL take one at random. A build on first cells SHALL read only the
clue kinds the answer's domain reads.

#### Scenario: Undead's mirrors

- **WHEN** the `sighting` fixture deals 4x4 boards, its mirrors laid at a
  chance of one in five within a tenth and a half of the squares
- **THEN** each board holds between two and eight mirrors, and both ways
  of mirror appear among them

### Requirement: A born game's deal may refuse its first cells and its board by tier

A first cells' `keep`, one formula or one a tier, SHALL draw the first
cells again before the build or the uniform draw unless it holds of the
clues they deal and the sizes, and the compiler SHALL refuse one reading a
kind the domain does not read. A deal's `keep` SHALL draw a board again unless it holds of the
clues its answer derives, before any is hidden. The compiler SHALL refuse
a keep by tier that leaves a tier out, and one that is no truth.

#### Scenario: Upstream Undead's sightlines and kinds of monster

- **WHEN** the `sighting` fixture deals boards with a keep on its first
  cells' longest sightline and one on its counts
- **THEN** no dealt board's sightline passes more squares than the keep
  allows, and every dealt board's counts hold as the keep says

### Requirement: A born game's build may fill sightlines first, each singled out by its numbers

A sample's `sightlines` SHALL, before the build, take each sightline
through the cells of a kind, the fewest squares first, and give its
undecided cells at random a filling whose two end clues no other filling
of them derives, until no more than the tier's `open` cells are undecided.

#### Scenario: Upstream Undead's get_unique

- **WHEN** the sightlines are laid on a 4x4 with no mirror
- **THEN** the first sightline's two numbers are those of its filling
  alone

### Requirement: A born game's tier may bound how often a rung fires

A technique's `most` SHALL make a board that the ladder at the
technique's own tier finishes only by firing it more often than that a
board of the tier above. The hint and the solve SHALL run the technique as
often as it fires.

#### Scenario: Upstream Undead's Easy passes

- **WHEN** a board of ghosts is solved at Easy with its sightline rung
  allowed one firing, and allowed none
- **THEN** the first is solved at Easy, and the second only at the tier
  above

### Requirement: A born game's clue at the board may be a list read a binding

A clue at the board the deal states records for (`deal.records`) SHALL be
dealt one record for each binding of its `for`, each field read off its
formula, a list field the answer's values along the ordered cells its
formula gives, and the records SHALL be held sorted, field by field, a
list shorter first and then member by member. A field read off no formula,
or a list field off anything but an ordered set of cells, SHALL be refused
by the compiler.

#### Scenario: Every line's digits

- **WHEN** a `listing` board is dealt and solved
- **THEN** its clue holds each row's and each column's digits, sorted

### Requirement: A born game's ID may write a list read a binding whole

The ID's `numbers` segment of a clue at the board read a binding SHALL
write every record whole, a digit a member, between commas, and read
records to the desc's end, held sorted however the desc orders them. The
compiler SHALL refuse the segment anywhere but last, and a list field
whose members are not digits.

#### Scenario: The digits written whole

- **WHEN** a `listing` board is dealt
- **THEN** its ID is each record's digits between commas, and reads back
  to the same clue in any order

### Requirement: A born game's answer may be drawn a value a cell

A deal whose sample is `uniform` SHALL draw each cell a value from 1 to the
top of the answer's domain at random, each alike, after its first cells,
whose values it lays on no other cell. The top SHALL be read with the
clues the first cells deal, where the domain reads them.

#### Scenario: A board drawn with nothing to steer it

- **WHEN** a `listing` board is dealt, whose list no build can read
- **THEN** a board is dealt, and the ladder finishes it

### Requirement: A born game's first cells may be what an opening leaves

First cells `opened` SHALL be laid on every cell an opening leaves: the
cells opened one at a time in a random order, tried before each opening
and after the last, until every two by two block holds an open cell and
the open cells are joined, the opening begun again where it tries every
cell and never gets there. Each try SHALL lay any cell whose block's other
three are open, opened or not.

#### Scenario: Upstream Crossing's walls

- **WHEN** `opening` boards are dealt at 5x4, 7x7 and 9x6
- **THEN** every two by two block of each holds a wall and an open square,
  and every open square has an open neighbor

#### Scenario: A layout the keep refuses

- **WHEN** `opening` boards are dealt at 7x7, its keep refusing a run
  longer than four squares
- **THEN** no board holds one, and layouts were refused before an answer
  was drawn on them

### Requirement: A born game's opening may keep a symmetry

With first cells `opened` under a `symmetry`, on where flag `when` is on
or always with no `when`, a cell the opening opens or lays SHALL open or
lay its orbit with it.

#### Scenario: Symmetric walls on a board even in a side

- **WHEN** `opening` boards are dealt at 7x6 with the symmetric flag on,
  and with it off
- **THEN** every board with it on is the same turned half round, and some
  with it off are not

### Requirement: The compiler refuses an opening laid any other way besides

The compiler SHALL refuse first cells `opened` with a share, a symmetry
of their own, a chance or a bound, a `when` that is no flag the settings
give, and a `when` with no symmetry.

#### Scenario: An opening at a chance

- **WHEN** the `opening` description's first cells are given a chance
  beside their opening, and then a `when` naming a size
- **THEN** each is refused

### Requirement: A born game's ID may write a marker's cells as runs

The ID's `spans` segment of a cell's one-valued marker SHALL write every
cell in a run: a run of the marker's cells a letter, `a` one to `z` 26,
letters side by side adding, and a run of the other cells its length as a
number. It SHALL refuse runs past the board or short of it. The compiler
SHALL refuse the segment of a kind that is no one-valued marker.

#### Scenario: Upstream Crossing's wall runs

- **WHEN** a 9x4 `opening` ID writes 27 walls and then 9 open squares
- **THEN** it reads `za9`, and `yb9` reads the same walls

### Requirement: A born game's clue at the board may be drawn as a list

`play.list` SHALL draw a clue at the board whose records are lists beneath
the board, each record its members' glyphs, laid out as upstream crossing.c's
`draw_numbers` lays its numbers: in columns, as many rows deep as fit the
board's width, the slack spread between them. A record SHALL be struck and
gray where its meaning holds of the board as placed, and in the error color
where the rules break it. The text format SHALL print the list beneath the
grid, a line a length.

#### Scenario: A number read once, and one read twice

- **WHEN** a `listing` board's first row reads 1123, and then its second
  row reads 1123 too
- **THEN** 1123 is struck and gray, and then in the error color and not
  struck

### Requirement: A hint marks a record of a list where the list draws it

A hint's ring and outline on a record of a clue at the board SHALL go round
it where the list draws it, and no tile SHALL draw them. The compiler SHALL
refuse a list naming no clue at the board the deal derives, or one whose
records are not one list each.

#### Scenario: A step reading a number

- **WHEN** a step of a `listing` board rings the number only one line fits
- **THEN** the ring goes round that number in the list, and none is drawn
  on the grid for it

### Requirement: A born game's typing may go along its list's sites

`play.along` SHALL make a value typed on a board of numbers move the
selection to the next square of the site it is filling, a site being the
ordered cells a binding of `deal.records` reads a record of the list off.
It SHALL NOT move for a note, a clear or with the `advance` preference off,
and after a site's last square a selection the pointer placed SHALL be put
away.

#### Scenario: A whole number after one press

- **WHEN** the first square of a `running` board's three-square row is
  pressed and its three digits typed
- **THEN** each digit fills the next square, and after the last no square
  is selected

#### Scenario: A value the square holds already

- **WHEN** a square holding 8 is selected and 8 is typed
- **THEN** no move is made and the selection moves on

### Requirement: The way typing goes along a site is the player's

On a board typed along its list's sites, the way the selection moves, a
row's or a column's, SHALL be set by the arrow last pressed, snapped to the
one site through a square that lies in one, and turned by a second press on
a square selected for typing that two sites cross; a second press elsewhere
SHALL put the selection away, as on any board of numbers.

#### Scenario: A second press turns the way

- **WHEN** a square where a row and a column cross is pressed twice and a
  digit typed
- **THEN** the selection moves down the column

### Requirement: A born game's list may be written whole into a site

On a board typed along its list's sites, a press on a record of the list
SHALL write it into a site through the square selected for typing that it
fits, or else pick it up, or put it down where it was held. A record SHALL
fit a site as long as it, agreeing with every value placed there, and read
along no other site; where both sites through the square take it, the one
holding more values SHALL, a tie going the selection's way. In notes a
press on a record SHALL only hold it.

#### Scenario: The run more written in takes it

- **WHEN** a `running` square where an empty row crosses a column holding
  one of 813's digits is selected, the way the row's, and 813 is pressed
- **THEN** 813 is written down the column

### Requirement: A held record is dropped into a site or put down

A press on a square of a site a held record fits SHALL write it there and
leave the square selected; a press on an open square it fits no site
through, or a value or clear typed, SHALL put it down; a press on a fixed
square, a right press and an arrow SHALL leave it held.

#### Scenario: A press where it cannot go

- **WHEN** the four-digit number of a `running` board is held and a square
  of three-square runs is pressed
- **THEN** nothing is written, no number is held, and the square is
  selected

### Requirement: A born game's sites through the selection are washed

On a board typed along its list's sites, the sites through the selection
SHALL be washed, the row's and the column's each its own color, unless the
`wash` preference is off or a hint shows. A held record's sites SHALL be
washed: the one it is read along, else every one it fits, its values
previewed on the empty squares where one site alone takes it.

#### Scenario: A number one run takes

- **WHEN** the one four-digit number of a `running` board is held
- **THEN** the four-square column is washed and the number's digits are
  previewed down it
