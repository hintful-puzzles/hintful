## ADDED Requirements

### Requirement: A Sixteen description is the tiles in reading order

A desc SHALL be the tile numbers in reading order, comma-separated, each
number from 1 to `w·h` once. A desc with too few or too many numbers, a number
outside that range, a number given twice, or any other character SHALL be
refused.

#### Scenario: A 3×3 board

- **WHEN** `4,1,3,2,8,6,5,7,9` is read for a 3×3 board
- **THEN** its rows are 4 1 3, then 2 8 6, then 5 7 9, with no move made

#### Scenario: A tile given twice

- **WHEN** the final 9 of `4,1,3,2,8,6,5,7,9` is changed to 7
- **THEN** it is refused with "This game ID gives the same number twice."

### Requirement: A Sixteen board no slides can order does not load

`hasNoSolution` SHALL answer that a board cannot be solved where both sides
are odd and the tiles are an odd permutation of their order: a slide of an odd
line is an even permutation, so no slides reach it. Where either side is even
it SHALL claim nothing.

#### Scenario: Two tiles exchanged on a 3×3 board

- **WHEN** the first two tiles of `4,1,3,2,8,6,5,7,9` are exchanged, giving
  `1,4,3,2,8,6,5,7,9`
- **THEN** the description is read as a board, and the board is refused with
  "This game ID's puzzle has no solution, so it can't be played here."

### Requirement: Sixteen writes its shuffle count wherever it is not zero

The `m` and the number of shuffling moves SHALL be written whenever that
number is not zero, in the short encoding as in the full one, and left out at
zero. A bare number SHALL decode as a square board, and a string with no `m`
as no shuffling moves. A width or a height below 2 SHALL be refused.

#### Scenario: A board shuffled by ten moves

- **WHEN** `4x4m10` is decoded and encoded again
- **THEN** it is a 4×4 board shuffled by 10 moves, and both encodings are
  `4x4m10`

#### Scenario: A strip is refused

- **WHEN** the preset `3x4` has its width changed to 1
- **THEN** the params are refused with "Width must be at least 2."

### Requirement: A shuffled Sixteen board's title counts its shuffles

A board dealt by shuffling SHALL be titled by its size and the number of
shuffling moves, and a board dealt in a random order by its size alone.

#### Scenario: Ten shuffling moves

- **WHEN** `4x4m10` is titled
- **THEN** the title is "4x4, 10 shuffles", and the preset `4x4` is titled
  "4x4"

### Requirement: A click on a Sixteen edge arrow slides its line one square

A left click on an arrow beside the grid SHALL slide that arrow's line by one
square toward the arrow: left from the arrow at a row's left end, right from
the one at its right end, up from the one above a column and down from the one
below it. A right click on an arrow SHALL slide the line the other way. A
click outside the grid that is on no arrow, and a right click on a square,
SHALL make no move.

#### Scenario: The arrow at the left of the middle row

- **WHEN** on the 3×3 board `4,1,3,2,8,6,5,7,9` the arrow at the left end of
  the middle row is clicked
- **THEN** that row reads 8 6 2, the 2 having come round to the right end
- **AND** a right click there instead makes it read 6 2 8

### Requirement: Sixteen's cursor walks the squares and the arrows round them

The plain arrow keys SHALL move the cursor over the squares and out onto the
edge arrows beside them, and a step past the end of one side's arrows SHALL
turn the cursor onto the nearest arrow of the adjacent side. On an edge arrow
Enter SHALL do what a left click there does and Space what a right click does.
Enter or Space with the cursor hidden SHALL only show it.

#### Scenario: Round a corner

- **WHEN** the cursor is on the arrow at the left end of the top row and Up is
  pressed
- **THEN** the cursor is on the arrow above the first column

### Requirement: Ctrl or Shift with an arrow key slides the cursor's line

With the cursor showing on a square, Ctrl or Shift with an arrow key SHALL
slide that square's row or column one square the arrow's way, the tile pushed
off the end coming back at the other. Under Ctrl the cursor SHALL go with its
tile, round the grid's edge with it, and under Shift it SHALL stay where it
is. With the cursor hidden either SHALL only show it, and on an edge arrow
either SHALL do nothing.

#### Scenario: Ctrl and Right from the first column

- **WHEN** the cursor is on the first square of a row and Ctrl+Right is pressed
- **THEN** the row slides one square right and the cursor is on the second
  square, with the tile it was on

#### Scenario: Ctrl and Left from the first column

- **WHEN** the cursor is on the first square of a row of three and Ctrl+Left is
  pressed
- **THEN** the row slides one square left and the cursor is on the third
  square, where its tile came round to

### Requirement: Enter or Space on a Sixteen square locks the arrow keys to sliding

With the cursor showing on a square, Enter SHALL lock the plain arrow keys to
what Ctrl with an arrow does, and Space to what Shift with an arrow does. The
same key again SHALL unlock them, and the other key SHALL change one lock for
the other.

#### Scenario: Enter twice

- **WHEN** Enter is pressed twice on a square
- **THEN** the arrow keys move the cursor again and slide nothing

### Requirement: Sixteen's status bar counts the moves

`statusbarText` SHALL return "Moves: N", `N` being the moves made on the board
shown, and "Moves: N (target M)" on a board dealt by `M` shuffling moves. A
Solve SHALL count as one move.

#### Scenario: A board shuffled by ten moves

- **WHEN** a 3×3 board dealt with `m10` is opened
- **THEN** the status bar reads "Moves: 0 (target 10)"
- **AND** after Solve the game's part of it reads "Moves: 1 (target 10)"
