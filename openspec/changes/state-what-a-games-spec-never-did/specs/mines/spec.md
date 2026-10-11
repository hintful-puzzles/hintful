## ADDED Requirements

### Requirement: Mines' short params leave out the mine count

The short encoding SHALL be `{w}x{h}` alone, and a string with no `n` SHALL
decode to a mine count of a tenth of the grid's area, rounded down. `X{x}` and
`Y{y}` SHALL name the first square of a board laid out with no click, which
the game in play never asks for: `newDesc` SHALL NOT read them, they SHALL be
written in the full encoding only when set, and one outside the grid SHALL be
refused.

#### Scenario: A string with no mine count

- **WHEN** `9x9`, the short encoding of the preset `9x9n10`, is decoded
- **THEN** the params are a 9×9 grid with 8 mines, whose full encoding is
  `9x9n8`

#### Scenario: The first-square letters

- **WHEN** `16x16n40aX3Y4` is decoded and encoded again
- **THEN** the first square is column 3 of row 4, the full encoding is
  `16x16n40X3Y4` and the short one `16x16`
- **AND** `9x9n10X9`, the preset `9x9n10` with `X9` added, is refused with
  "First-click x coordinate must be inside the grid."

### Requirement: Mines refuses a grid of 2²⁸ squares or more

`validateParams` SHALL refuse a grid whose width times height is 2²⁸ or more,
in the engine's words for an area too large, whether or not a board is to be
generated.

#### Scenario: The area bound falls between two grids

- **WHEN** a 16383×16384 grid and a 16384×16384 grid are validated
- **THEN** the first is admitted and the second refused

### Requirement: A Mines description before the first click is a mine count and a seed

The description `newDesc` writes SHALL be `r{n},u,{state}`: the mine count,
the letter `u`, and the random state the first click lays the board out from,
in lowercase hex at the length the engine encodes a random state to. It SHALL
be refused where `n` leaves fewer than nine squares without a mine, in a
sentence of the game's own; where the letter is neither `u` nor `a`; and where
the state is shorter, longer or other than what the encoder writes.

#### Scenario: A dealt description opens a board not laid out

- **WHEN**
  `r10,u,6a340dba8566f93f26b22672ce7dc53b17088d5ef6df68c873a45e1d18f41ba695c44fc5a74fe45cb7bf25462e8aafc6fdf89ace35538a69440ad3ec02`
  is opened on a 9×9 grid
- **THEN** the board holds ten mines not laid out yet, every square is
  covered, and the game answers `supersededDesc` with nothing

#### Scenario: Too many mines, and a state cut short

- **WHEN** that description is offered with its `r10` changed to `r73`, and
  again with its last digit dropped
- **THEN** the first is refused with "This game ID has more mines than its
  board can hold around a safe first click." and the second as too short

### Requirement: A laid-out Mines description is its first square and a masked layout

The description `supersededDesc` writes SHALL be `{x},{y},m{hex}`: the first
square, counted from zero, and the layout as one bit a square in reading
order, most significant bit first, masked by the engine's bitmap obfuscation
and written as `⌈w·h/4⌉` lowercase hex digits. `u` in place of `m` SHALL read
the same bits unmasked. `newState` SHALL open the first square, and the
board's mine count SHALL be the layout's, whatever the params' `n`.

#### Scenario: A layout upstream wrote

- **WHEN** `0,8,mff9452e1d83a0a7065160` is read on a 9×9 grid
- **THEN** the board has ten mines, the bottom-left square is opened with the
  squares its flood reaches, and `supersededDesc` answers the same string

#### Scenario: The same layout unmasked

- **WHEN** `0,8,u840900209000001020040`, the bits of that layout with no
  mask over them, is read on a 9×9 grid
- **THEN** the board is the one `0,8,mff9452e1d83a0a7065160` opens, and
  `supersededDesc` answers with the masked string

#### Scenario: The layout's count, not the params'

- **WHEN** `0,8,mff9452e1d83a0a7065160` is read on a 9×9 grid whose params
  ask for 35 mines
- **THEN** the board has ten mines

### Requirement: A Mines layout is read only as the encoder writes it

A layout SHALL be refused where a coordinate of its first square lies outside
the grid, where it has fewer or more hex digits than the grid needs, where a
digit is uppercase or sets a bit past the last square, and where neither `m`
nor `u` leads it. Each SHALL be refused in the collection's words for a
number out of range, a description too short or too long, and a character
where it cannot be.

#### Scenario: Each refusal

- **WHEN** `0,8,mff9452e1d83a0a7065160` is offered on a 9×9 grid with its
  first `0` changed to `9`, with its last digit dropped, with its first `f`
  written `F`, and with its `m` dropped
- **THEN** the first is refused as out of range, the second as too short, and
  the last two as having a character where it cannot be

#### Scenario: A padding bit is set

- **WHEN** `0,8,mff9452e1d83a0a7065160` is offered on a 9×9 grid with its
  last digit changed to `1`, the 81st square being that digit's high bit
- **THEN** it is refused for its `1`

### Requirement: A Mines press opens on its release, and the secondary button flags

The left button SHALL act on its release: after a press on a covered square
it opens the covered square it is released over, and after a press on a
number it chords the number it is released over. A release off the grid SHALL
make no move. The secondary button SHALL flag a covered square or take its
flag off, and a drag on from it SHALL be the engine's sweep; the left button
has none. A flagged square SHALL NOT be opened, nor an opened one flagged.

#### Scenario: A press slid to another square

- **WHEN** the player presses the left button on a covered square, moves to
  another covered square and releases
- **THEN** the second square is opened and the first stays covered

#### Scenario: A flag drag

- **WHEN** the player presses the secondary button on a covered square and
  drags across a flagged square and another covered square
- **THEN** both covered squares are flagged and the flagged one keeps its flag

### Requirement: One Mines number alone settles its squares

A number that already touches as many proved mines as it counts SHALL make
its other unopened squares safe. A number with exactly as many unopened,
unproved squares as mines still to place SHALL make them all mines. The step
SHALL outline the number, and the mines it already touches, and ring the
squares it decides.

#### Scenario: A number with just enough room

- **WHEN** the hint is asked on `0,8,mff9452e1d83a0a7065160`
- **THEN** its first step flags one square, saying "The outlined 1 has
  exactly 1 unopened square around it, so the ringed square must be a mine."

### Requirement: Two Mines numbers that share squares settle the squares they do not

Where two numbers share unopened squares, and the first needs as many more
mines than the second as it has unopened squares the second does not touch,
those squares SHALL be mines and the second's squares the first does not
touch SHALL be safe. Where every unopened square of one number is also
another's, the other's remaining squares hold exactly the difference of what
the two need, and that set SHALL take a number's place in the comparison. No
set SHALL be taken from another set.

#### Scenario: Two numbers that need the same

- **WHEN** two numbers need one mine each and every unopened square of the
  first is also the second's
- **THEN** the second's other unopened squares are ringed as safe, and no
  square is flagged

### Requirement: Mines counts the mines left

Where every mine left is accounted for by up to five numbers whose unopened
squares do not overlap, one of them at most a set of the kind above, every
other unopened square SHALL be safe; where the squares outside them number
exactly the mines they leave over, those SHALL all be mines. With no number counted the same
SHALL hold of the whole board: all mines found, or as many squares as mines.
The step SHALL outline the numbers and stripe the squares they account for.

#### Scenario: Every mine is found

- **WHEN** the proved mines number the board's count and unopened squares
  remain that no deduction has proved
- **THEN** the step rings them as safe, saying that all the mines are found

### Requirement: Mines' hint takes the simplest deduction the board supports

Each step SHALL be the first deduction found in this order: one number alone,
the numbers taken in reading order; two numbers that share squares; a nested
set against a number, then against another set; the count of the mines left.
The plan SHALL look again from the top after every step, with the numbers the
step opened. A deduction that proves both SHALL flag its mines and then open
its safe squares, as one journey, and one that changes nothing on the board
SHALL NOT be shown.

#### Scenario: Single numbers come before a pair

- **WHEN** the hint's plan is read on `0,8,mff9452e1d83a0a7065160`
- **THEN** its first eight steps each rest on one number, and the ninth is the
  first to compare two

### Requirement: The Mines hint's first square is the middle one

Before the first click the hint SHALL ring the square at `⌊w/2⌋, ⌊h/2⌋`, and
its move SHALL be the first open of that square, carrying the layout the seed
gives it.

#### Scenario: The opening step of a 9×9 board

- **WHEN** the hint is asked on a 9×9 board not laid out yet
- **THEN** it rings the square at column 4 of row 4, counted from zero, and
  says "No mine is ever laid in the first square you open or beside it, so
  this square can't hold one: open it to begin."

### Requirement: The Mines status bar counts flags against mines

In play the status bar SHALL read `Marked: {flags} / {mines}`, the mines being
the description's count before the board is laid out. Where one to nine safe
squares are still covered it SHALL add ` (1 safe square remains)` or
` ({n} safe squares remain)`. A dead board SHALL read `DEAD!` in its place,
and a won board SHALL leave the words to the engine. Once the player has
died, `Deaths: {n}` SHALL follow after two spaces.

#### Scenario: Before and after a death

- **WHEN** the player opens a mine on a ten-mine board with no flag down, and
  then undoes
- **THEN** the status bar reads "DEAD!  Deaths: 1" on the dead board and
  "Marked: 0 / 10  Deaths: 1" after the undo
