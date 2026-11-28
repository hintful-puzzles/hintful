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
reading a kind dealt after it.

#### Scenario: Sightlines through mirrors

- **WHEN** the `sighting` description lists its sightline numbers after
  its mirrors, and again before them
- **THEN** the first deals the numbers through the mirrors, and the second
  is refused

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
cells again before the build unless it holds of the clues they deal and
the sizes, and the compiler SHALL refuse one reading a kind the domain does
not read. A deal's `keep` SHALL draw a board again unless it holds of the
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
whose values it lays on no other cell.

#### Scenario: A board drawn with nothing to steer it

- **WHEN** a `listing` board is dealt, whose list no build can read
- **THEN** a board is dealt, and the ladder finishes it
