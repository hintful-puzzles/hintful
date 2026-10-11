## ADDED Requirements

### Requirement: Slide descriptions spell each square with a letter

A description SHALL write a square as `a` (a block's first square), `m` (the
main block's first), `e` (empty), `w` (wall), or `d` and the distance back to
the previous square of the same block. A run of one letter other than `d` MAY
be written as the letter and a count of at least 2, and `f` before such a
letter makes its squares forcefield. After the squares come `,tx,ty`, the
square the main block's first square must reach, and optionally `,` and the
minimum move count.

#### Scenario: A dealt 6 by 7 board

- **WHEN** `w7md1a2w2d5d1a2w2a4w2d6ad6efewd6d6aefew6,4,4,25` is loaded on a
  6 by 7 board
- **THEN** the top row and the first square of the second are wall, and the
  main block is the 2 by 2 whose corner is the second square of the second
  row: `m`, `d1`, and on the row below `d5` and `d1`
- **AND** the two `fe` squares, in the right-hand wall of the fifth and sixth
  rows, are the gate; the main block's corner must reach column 4 of row 4,
  counting from 0; and the shortest solution takes 25 moves

### Requirement: Slide refuses a count below 2, a forcefield block square and a target off the board

`newState` SHALL refuse a description in which a letter is followed by a count
of 0 or 1, in which `f` comes before `d`, in which a target coordinate is not
a column or row of the board, or in which anything follows the minimum move
count.

#### Scenario: A count of one

- **WHEN** the description of the dealt 6 by 7 board is loaded with its
  first `efew` written `efew1`
- **THEN** it is refused as holding a number out of range for its board

#### Scenario: A target outside the board

- **WHEN** the same description is loaded with its `,4,4,25` written
  `,6,4,25`
- **THEN** it is refused as holding a number out of range for its board

### Requirement: Slide's params write the limit as m and a number, or u

`encodeParams` SHALL write `{w}x{h}` and then `m{n}` for a solution-length
limit of `n`, or `u` for no limit, the same in the short form and the full.
`decodeParams` SHALL read a bare number as a square board, and a string with
neither `m` nor `u` as the default limit of 40.

#### Scenario: The two preset forms

- **WHEN** `6x7m25` and `6x7u` are decoded
- **THEN** the first is a 6 by 7 board with a limit of 25, and the second the
  same board with no limit

#### Scenario: A string that names no limit

- **WHEN** `7x6` is decoded
- **THEN** the board is 7 by 6 with a limit of 40
- **AND** `6u` is a 6 by 6 board with no limit

### Requirement: Slide's size limits hold for a board that arrives with its description

A width below 5 or above 251 and a height below 4 SHALL be refused as the
bounds of the Custom dialog's fields. `validateParams` SHALL refuse a board of
more than 48 squares whatever `full` says. Each limit therefore holds whether
the board is to be dealt or arrives with its description.

#### Scenario: A 7 by 7 board is refused with its description in hand

- **WHEN** a game ID opens with `7x7m25`, which is `6x7m25` one column wider,
  and carries a description
- **THEN** it is refused with "Width times height must be at most 48; the
  solver runs out of memory beyond that."
- **AND** `6x7m25` with its width written `4` is refused with "Width must be
  at least 5."

### Requirement: Either pointer button moves a Slide block

The right button's press, drag and release SHALL do what the left button's
do, so that a touch held still before it drags, which arrives as the right
button, still moves its block.

#### Scenario: A press held before the drag

- **WHEN** a block is pressed with the right button, dragged to a cell it can
  reach and released
- **THEN** the block moves there, as one move, as a left drag moves it

### Requirement: Escape, Backspace and Delete each cancel in Slide

Escape, Backspace and Delete SHALL each be a cancel key. With a block
grabbed, each SHALL hand it back to where it started, as "The keyboard select
grabs with the pointer's grab" says of canceling. With no block grabbed, each
SHALL hide the keyboard cursor when it shows, and SHALL do nothing when it
does not.

#### Scenario: Backspace with a block held

- **WHEN** a block has been picked up from the keyboard and Backspace is
  pressed
- **THEN** the block is put down where it was picked up and no move is made
- **AND** a second Backspace hides the cursor, and a third does nothing

#### Scenario: Escape after a block is put down

- **WHEN** a block has been moved from the keyboard and put down, and Escape
  is pressed
- **THEN** the cursor is hidden and the block stays where it was put

### Requirement: Slide's status bar counts moves beside the minimum

`statusbarText` SHALL read `Moves: {n}`, the displayed move count, followed
by ` (min {m})` where the description carries its minimum move count, and by
nothing where it carries none.

#### Scenario: A dealt board before its first move

- **WHEN** the board `w7md1a2w2d5d1a2w2a4w2d6ad6efewd6d6aefew6,4,4,25` has
  just been loaded
- **THEN** the status bar reads "Moves: 0 (min 25)"
- **AND** the same description without its final `,25` reads "Moves: 0"

### Requirement: A Slide board's name gives the limit on its shortest solution

A board's name SHALL give its size and then `max {n} moves` for a
solution-length limit of `n`, or `no move limit`. The limit is on the
shortest solution the board was dealt with and SHALL NOT bound the player,
whose move count may pass it.

#### Scenario: A player takes more moves than the name gives

- **WHEN** a player on the board named "6x7, max 25 moves" makes a 26th
  counted move without bringing the key block out
- **THEN** the move is made and the status bar reads "Moves: 26 (min 25)"
