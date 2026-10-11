## ADDED Requirements

### Requirement: A Rome description is the walls, a comma, then the clues

The wall list SHALL cover the borders between side-by-side squares, row by
row, then the borders between rows, each in reading order. A letter `a`–`y`
SHALL be that many open borders followed by one wall. A `,` SHALL follow the
list, and then the clue grid, in which `a`–`z` is a run of 1 to 26 empty
squares. A missing comma, and either part running past its count, SHALL be
refused.

#### Scenario: A dealt 4×4 board

- **WHEN** `9a1aba2b,cLeRDXcL` is read as a 4×4 board
- **THEN** the first nine borders within the rows are walls and the tenth is
  open, so the bottom row's first two squares share an area
- **AND** the clues are a left arrow ending the top row, a right arrow, a down
  arrow and a goal ending the third row, and a left arrow ending the bottom
  row

#### Scenario: The comma left out

- **WHEN** the `,` of that description is taken out
- **THEN** the board is refused, naming the `c` as a character the game ID
  cannot have there

### Requirement: A Rome params string with no difficulty letter is Easy

Decoding a string with no `d` SHALL give Easy. A `d` followed by anything but
`e`, `n` or `t` SHALL decode to a difficulty out of range, which validation
refuses in a sentence that names the three difficulties.

#### Scenario: A string with no letter

- **WHEN** `4x4` is decoded
- **THEN** the board is Easy, and its full encoding is `4x4de`

#### Scenario: A letter that is no difficulty

- **WHEN** the `n` of `4x4dn` is changed to `z`
- **THEN** the params are refused with "Difficulty must be one of Easy,
  Normal, Tricky."

### Requirement: Rome's Enter and Space arm the cursor for one arrow key

Enter on a square that is not fixed SHALL show the cursor and arm it to
place: the next arrow key SHALL place that arrow and disarm, Enter again SHALL
disarm, and Space SHALL clear the square's arrow and disarm. Space on an empty
square SHALL arm the cursor to mark: the next arrow key SHALL toggle that mark
and disarm, and Space again SHALL disarm. While the cursor is armed the arrow
keys SHALL NOT move it. An arrow the square already holds SHALL make no move.

#### Scenario: Enter, then an arrow

- **WHEN** Enter and then the up arrow are pressed with the cursor on an empty
  square below the top row
- **THEN** an up arrow is placed in that square, and the next up arrow moves
  the cursor

#### Scenario: Space while placing

- **WHEN** Enter and then Space are pressed on a square holding the player's
  arrow
- **THEN** the arrow is cleared and the cursor is no longer armed

### Requirement: Rome's digits 8, 2, 4 and 6 type the arrows

With the cursor showing on a square that is not fixed, the characters `8`,
`2`, `4` and `6` SHALL enter the up, down, left and right arrow, from the
number row and the numeric keypad alike, and Backspace or Delete SHALL clear.
Each SHALL act as the on-screen key does, which sends the same character: an
arrow is placed, or toggled as a mark while the cursor is armed to mark or
notes mode is on.

#### Scenario: A digit on the selected square

- **WHEN** the cursor shows on an empty square and `6` is typed
- **THEN** a right arrow is placed in it

### Requirement: Rome's hint places an arrow for one of three reasons

A step that places an arrow SHALL say one of: every other arrow has been ruled
out in the square, where its marks are down to one; every other way the square
can point is already used in its area, where the square carries no marks; or
its area must hold all four arrows and only this square can still point that
way, with the area striped.

#### Scenario: A square with no marks

- **WHEN** a square with no marks is the last empty one of an area whose other
  three squares hold arrows
- **THEN** the step places the fourth arrow and says every other way the
  square can point is already used in its area

### Requirement: Rome's hint strikes an arrow its area already holds

The leg that strikes a placed arrow from the rest of its area SHALL stripe the
area, outline the placed arrow, and say that the area now has that arrow, so no
other square in it can point that way.

#### Scenario: The leg after a placement

- **WHEN** a hint step places an up arrow in an area whose other squares still
  carry an up mark
- **THEN** the leg that follows strikes those marks and says the area now has
  its up arrow

### Requirement: Rome's hint keeps the squares an area's arrows must go in

In an area of four squares, where one square alone can still take some arrow,
a step SHALL strike that square's other marks and say the area must hold all
four arrows and only this square can still point that way. Where two squares
of an area must take the same two arrows between them, a step SHALL outline
the pair and strike those two arrows from the area's other squares.

#### Scenario: The one square that can still point up

- **WHEN** a square of a four-square area carries marks for up and for other
  arrows, and no other square of the area can still point up
- **THEN** the step says only this square can still point up, and that its
  other marks must go

### Requirement: Rome's hint keeps the one mark that leads to a goal

Where one mark alone, anywhere on the board, still points into the group of
squares that already lead to a goal, a step SHALL ring that mark, stripe the
group, and strike the other marks of the mark's square, saying every square
must reach a goal.

#### Scenario: The last way into a goal's group

- **WHEN** every square beside the squares leading to a goal has lost its mark
  pointing into them, but one
- **THEN** the step keeps that mark and strikes the rest of its square's marks

### Requirement: Rome's hint rules out an arrow into a square that could only point back

Where a square's marks are down to up and down, or to left and right, a step
SHALL strike, from each neighbor on that line that shares its area, the mark
pointing at it, saying an arrow into it would close a loop or be the area's
second arrow that way. Each neighbor's strike SHALL be a leg of its own, told
from that neighbor's square, and the two SHALL be one journey.

#### Scenario: A square that can only point up or down

- **WHEN** a square can only point up or down, and the square above it is in
  its area and still carries a down mark
- **THEN** the step strikes that down mark, outlines the two-way square as the
  struck square's lower neighbor, and says an arrow into it would close a loop
  or be the area's second down

### Requirement: Rome's rules are met in one order, Easy first

The solver SHALL try its rules in this order, each only where those before it
find nothing, and the hint SHALL record that solver: a square down to one
arrow, an arrow its area already holds, and an arrow that would close a loop,
at Easy; the squares an area's arrows must go in, a pair, and the one mark
that leads to a goal, at Normal; and an arrow into a square that could only
point back, at Tricky.

#### Scenario: A Tricky rule on an Easy board

- **WHEN** the hint is followed from the dealt position of a board dealt at
  Easy
- **THEN** no step is a Normal or a Tricky rule: none keeps an area's arrows
  to their squares, names a pair, keeps the one mark that leads to a goal, or
  rules out an arrow into a square that could only point back

### Requirement: Rome's hint pencils marks in only as a step needs them

Rome SHALL offer the shared `hint-notes` preference, defaulting to `implicit`:
unless the player chooses otherwise, the hint SHALL read a square with no
marks as holding every arrow its area has not used that does not point off the
grid, and SHALL pencil marks in only where a step needs them.

#### Scenario: A board with no marks and no stored preference

- **WHEN** the hint is followed from the dealt position of a board with no
  preference stored
- **THEN** no step is the Mark-all fill, and a step that needs a square's marks
  pencils in that square's alone
