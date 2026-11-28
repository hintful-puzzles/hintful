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
color where the rules break the record; the canvas SHALL hold the row. A
press on a record SHALL place its value as the value's key does.

#### Scenario: A pressed count places its value

- **WHEN** the cursor is on an open square of a `totaling` board and the
  disc's count is pressed
- **THEN** the square holds a disc

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

### Requirement: The compiler refuses pictures a board cannot draw

The compiler SHALL refuse `play.numbers.pictures` naming a painter no
description may name, painting values that are not every value from 1,
beside an alphabet of another length or holding A, or beside a raised
value or an empty square.

#### Scenario: An alphabet holding A

- **WHEN** a `portraying` description's alphabet is `GAZ`
- **THEN** the compiler refuses it, since `A` switches the pictures

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
