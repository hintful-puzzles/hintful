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
