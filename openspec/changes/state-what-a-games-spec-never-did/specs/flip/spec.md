## ADDED Requirements

### Requirement: Flip descriptions are two hex strings

A Flip description SHALL be the toggle matrix, a comma, then the starting
lights, each a bitmap in lowercase hex, four bits a digit, the first bit
highest. The matrix holds `w·h` bits for each square in reading order, a set
bit naming a square that pressing it flips; the lights hold one bit a square,
set where the square is unlit. `newState` SHALL refuse any other character, a
set bit past a bitmap's last, a missing comma and anything after the lights.

#### Scenario: A dealt 3×3 Crosses board

- **WHEN** `d074191345d1644c17058,288` is opened under `3x3c`
- **THEN** the matrix is its first 21 digits, whose first nine bits,
  `110100000`, say the top-left square flips itself, the square to its right
  and the square below it
- **AND** `288` is the bits `001010001`, so the third, fifth and ninth squares
  in reading order start unlit and the other six lit

#### Scenario: A bit past the last square

- **WHEN** the last digit of that description is changed from `8` to `9`,
  which sets a bit after the ninth square's
- **THEN** the description is refused

### Requirement: A square that flips nothing takes no press

A press on a square whose row of the matrix is empty SHALL make no move, by
the pointer or by the select keys, so it adds nothing to the move count and
nothing to undo. Only a description typed by hand has such a square: a dealt
board's every square flips itself.

#### Scenario: A hand-typed matrix with an empty row

- **WHEN** a description whose matrix gives the top-left square no square to
  flip is opened, and the player presses Enter twice, once to show the cursor
  there and once to press the square
- **THEN** the status bar still reads `Moves: 0` and there is nothing to undo

### Requirement: Solve counts a move for each square it presses

The game's own words in the status bar SHALL be `Moves: ` and the number of
presses made on the board. Solve SHALL add one to that number for each square
of its answer, although it is one step of the history.

#### Scenario: Solve on a board that takes five presses

- **WHEN** the player uses Solve on `d074191345d1644c17058,288` opened under
  `3x3c`, whose shortest answer is five presses
- **THEN** the status bar reads `Auto-solved. Moves: 5`, the first two words
  being the engine's, and one undo takes the count back to 0
