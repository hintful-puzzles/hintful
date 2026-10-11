## ADDED Requirements

### Requirement: Pegs descriptions are one letter for each cell

A Pegs description SHALL hold one letter for each cell of the `w` × `h` grid in
reading order: `P` a peg, `H` an empty hole, `O` a cell that is not part of
the board. `newState` SHALL refuse any other character, and a description
longer or shorter than the grid. It SHALL refuse a board with fewer than two
pegs, on which no peg could ever jump, and a board with no empty hole, each in
a sentence of the game's own.

#### Scenario: The dealt 5×7 Cross

- **WHEN** `OPPPOOPPPOPPPPPPPHPPPPPPPOPPPOOPPPO` is read as a `5x7cross` board
- **THEN** its first two rows and its last two are each three pegs between two
  cells off the board, its three middle rows are five cells wide, and its one
  hole is the middle cell of the fourth row

#### Scenario: A board with no hole

- **WHEN** the `H` of that description is changed to `P`
- **THEN** the board is refused with "This game ID has no empty hole for a peg
  to jump into."

### Requirement: Pegs params are a size and a board-type word

Params SHALL encode as `{w}x{h}` followed, in the full form only, by the board
type as a lowercase word: `cross`, `octagon` or `random`. Decoding SHALL read a
string with no such word, or with any other text after the size, as a Cross
board.

#### Scenario: The three words

- **WHEN** `5x7cross`, `7x7octagon` and `5x5random` are decoded
- **THEN** they are a 5×7 Cross, a 7×7 Octagon and a 5×5 Random board, and
  their short forms are `5x7`, `7x7` and `5x5`

#### Scenario: A string with no word

- **WHEN** `5x7` is decoded
- **THEN** the board is a Cross, and its full encoding is `5x7cross`

### Requirement: Pegs refuses a board its type cannot make

When a board is to be dealt, `validateParams` SHALL refuse a width or a height
of 3 or less, a Cross board unless each side is 5, 7 or 9 and they are not both
5, and an Octagon board unless it is 7×7. A board that arrives with its
description SHALL NOT be refused for any of these. A grid of more than 10,000
cells SHALL be refused either way.

#### Scenario: A Cross with both sides 5

- **WHEN** `5x5random` is changed to `5x5cross` and checked for dealing
- **THEN** it is refused with "This board type needs each side to be 5, 7 or
  9, and not both 5."
- **AND** the same params are not refused for a board that arrives with its
  description

#### Scenario: An Octagon of another size

- **WHEN** `7x7octagon` is changed to `7x9octagon` and checked for dealing
- **THEN** it is refused with "This board type is only supported at 7×7."

### Requirement: Pegs' cursor keeps to the board's cells

The keyboard cursor SHALL start on the board's first cell in reading order,
and an arrow SHALL NOT move it onto a cell that is not part of the board. With
a jump armed, an arrow whose direction does not hold a peg and then a hole
SHALL disarm the jump and leave the cursor where it is. Select on a hidden
cursor SHALL only show it, and select on an empty hole SHALL arm nothing. A
pointer press on a peg SHALL hide the cursor and disarm an armed jump.

#### Scenario: An arrow toward a cut corner

- **WHEN** the cursor is on the first peg of a Cross board's top row and the
  left arrow is pressed
- **THEN** the cursor stays on that peg

#### Scenario: An armed jump with nowhere to land

- **WHEN** a jump is armed on a peg of a fresh Cross board's top row and the up
  arrow is pressed
- **THEN** no jump is made and the cursor does not move
- **AND** the next arrow is a cursor move and makes no jump

### Requirement: Pegs' hint says the last jump finishes, and otherwise may name the jump alone

Where one jump leaves one peg, the step SHALL say that the jump finishes with
one peg and SHALL say nothing of any other jump. Where a step has nothing else
to show (no jump that cuts a peg off, no shape to clear, nothing settled about
the other jumps, and no stranded peg), it SHALL name the jump alone, by the
peg and the hole it rings.

#### Scenario: Two pegs left

- **WHEN** two pegs sit side by side with an empty hole beyond one of them, and
  no other peg is on the board
- **THEN** the step rings the far peg and that hole and says the jump finishes
  with one peg

### Requirement: Pegs' hint gives the first reason that holds

A step SHALL give the first of these that holds: the jump finishes; another
jump would cut a peg off at once; another jump would cut one off whatever is
jumped next; the line opens by clearing a shape; something is settled about
the other jumps; a stranded peg the jump lands beside; another jump that would
strand a peg. Of several jumps that cut a peg off alike, it SHALL show the one
whose peg starts nearest the offered jump's.

#### Scenario: A cut-off comes before a shape

- **WHEN** another jump would cut a peg off, and the line also opens with
  three jumps that clear a row and leave every other peg where it began
- **THEN** the hint is one step that stripes the other jump and outlines the
  peg, and not a journey of three
