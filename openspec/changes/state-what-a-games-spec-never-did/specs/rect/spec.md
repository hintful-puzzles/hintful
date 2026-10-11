## ADDED Requirements

### Requirement: A Rectangles description's number is from 1 to the grid's area

Parsing a desc SHALL refuse a number below 1 or above `w * h`. A `_` SHALL be
required between two numbers with no empty square between them, and SHALL be
refused anywhere else.

#### Scenario: A dealt 7×7 board

- **WHEN** `2e6b2_4c5d2b2a4b6a2e2c4_2_2c4c` is read as a 7×7 board
- **THEN** its first row is a 2, five empty squares and a 6, and its second
  row opens with two empty squares, a 2 and a 4 side by side

#### Scenario: A number larger than the grid

- **WHEN** the first `2` of that description is changed to `50`
- **THEN** the board is refused with "This game ID has a number out of range
  for its board."
- **AND** with `49` there instead, the description is read

#### Scenario: Two numbers with no separator

- **WHEN** the `_` of that description's `2_4` is taken out
- **THEN** the two read as one square holding 24, and the description is
  refused as too short for its board

### Requirement: Rectangles refuses a grid of more than a million squares

`validateParams` SHALL refuse a grid of more than 1,000,000 squares, whether a
board is to be dealt or one arrives with its description.

#### Scenario: One row too many

- **WHEN** the height of `7x7de` is changed to 142858
- **THEN** the params are refused with "Width times height must not be
  unreasonably large."
- **AND** with a height of 142857 they are not

### Requirement: Rectangles' Enter draws from the cursor's square and Space clears

Enter or Space on a hidden cursor SHALL only show it. On a showing cursor
either SHALL start a drag at the middle of the cursor's square, and the arrows
SHALL then stretch it a square at a time. The same key again SHALL end it:
Enter SHALL draw the rectangle's outline and clear the lines inside it, and
Space SHALL only clear the lines inside. Ending with the other key SHALL make
no move and end the drag. A pointer press SHALL abandon a drag the keys
started.

#### Scenario: Space clears an area

- **WHEN** Space is pressed on a square, the cursor is moved one square right
  and one down, and Space is pressed again, over an area with lines inside it
- **THEN** one move clears the lines inside those four squares and draws none

#### Scenario: Enter twice on one square

- **WHEN** Enter is pressed twice with no arrow between
- **THEN** no move is made

### Requirement: Rectangles' hint tries its five deductions plainest first

At each step the hint SHALL give the first that fires of its five deductions,
in this order: a clue with one fit, a square only one clue's fits reach,
squares another clue is sure to cover, a fit that would leave no room, and
last a line. It SHALL look across the whole board for one before it tries the
next.

#### Scenario: A line is the last resort

- **WHEN** some clue has one fit left and some edge could also be drawn as a
  line
- **THEN** the step draws the clue's rectangle

## MODIFIED Requirements

### Requirement: Rectangles input

`interpretMove` SHALL support a left-drag drawing a rectangle outline, a
right-drag erasing interior edges, a click near an edge toggling it,
and a keyboard cursor, moved square to square, with press-to-drag. Escape,
Backspace or Delete SHALL cancel that drag, or else hide the cursor. A pointer
position SHALL resolve to a grid corner or a square's center when close to
one, else to the nearer edge. The status bar SHALL show a dragged rectangle's
size.

#### Scenario: A drag draws a rectangle outline

- **WHEN** the player left-drags from one grid vertex to another spanning a
  rectangle
- **THEN** `interpretMove` yields a rectangle move whose execution sets the four
  boundary edges of that rectangle and clears its interior edges

#### Scenario: A no-op click yields no move

- **WHEN** the player clicks where the pointer resolves to a grid corner or to
  a square's center, which names no edge
- **THEN** `interpretMove` yields no move (returns null or a UI update only)

#### Scenario: The status bar gives the dragged size

- **WHEN** a drag spans a rectangle three squares wide and two tall
- **THEN** the status bar reads `3x2`, and it is empty once the drag ends
