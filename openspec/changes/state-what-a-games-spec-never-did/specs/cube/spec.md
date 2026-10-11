## ADDED Requirements

### Requirement: Cube descriptions are a hex mask of the painted squares and a start square

A Cube description SHALL be the painted squares as uppercase hex digits, then
a comma and the start square in decimal. The squares SHALL be taken in the
arena's order, four to a digit with the first in the high bit, and the last
digit's unused low bits SHALL be clear. `newState` SHALL refuse any other
character, a set unused bit, a mask of the wrong length and a start square
outside the arena. It SHALL read a start square that is painted as any other.

#### Scenario: The board the first preset deals

- **WHEN** `3905,6` is read for `c4x4`
- **THEN** squares 2, 3, 4, 7, 13 and 15 are painted, counting from 0 along
  the rows, and the solid starts on square 6

#### Scenario: A start square that is painted

- **WHEN** `3905,2`, the first preset's board with its start square changed,
  is opened for `c4x4`
- **THEN** it loads, the solid standing on painted square 2 with no face
  painted

#### Scenario: A last digit with bits to spare

- **WHEN** `E38,4` is read for `c3x3`, whose nine squares take three digits
- **THEN** the top and bottom rows are painted, the `8` painting the ninth
  square alone
- **AND** `E39,4`, the same with its last digit changed, is refused for the
  `9`

#### Scenario: A start square off the arena

- **WHEN** `3905,16`, the first preset's board with its start square changed,
  is read for `c4x4`
- **THEN** it is refused as holding a number out of range

### Requirement: Cube numbers its arena from the top, a band's downward triangles first

A description's mask and start square SHALL count the arena's squares from 0.
A grid of squares SHALL be counted row by row from the top left. A grid of
triangles SHALL be counted band by band from the top, and within a band the
triangles that point down from left to right and then the ones that point up.

#### Scenario: A board the tetrahedron's preset deals

- **WHEN** `9048,4` is read for `t1x2`, thirteen triangles in bands of three,
  five and five
- **THEN** triangles 0, 3, 9 and 12 are painted: the top band's one downward
  triangle, the second band's first, the middle one of the third band's three,
  and the third band's last upward triangle, which the `8` paints alone
- **AND** the solid starts on triangle 4, the second band's second downward
  one

### Requirement: A Cube description loads only with exactly a solid's worth of paint

`hasNoSolution` SHALL hold for a board whose painted squares and painted faces
together do not number the solid's faces, so a description painting more
squares or fewer does not load: a roll moves paint between a square and a face
and never makes or loses any.

#### Scenario: A seventh painted square

- **WHEN** `3915,6`, the first preset's board with its third digit changed to
  paint a seventh square, is opened for `c4x4`
- **THEN** it reads as a description and is refused as a puzzle with no
  solution

### Requirement: Cube refuses a grid too small for its solid

`validateParams` SHALL refuse a grid of squares with a dimension below 2 and a
grid of triangles with both dimensions 0. It SHALL refuse a grid with fewer
squares of a kind than the solid has faces to land on them, a tetrahedron's
faces landing on four kinds of triangle and an octahedron's on the two that
point up and down, and a grid that leaves no unpainted square to start on.

#### Scenario: A grid one square wide

- **WHEN** `c1x4`, the cube's preset with its width changed, is checked
- **THEN** it is refused with "Both grid dimensions must be greater than one."

#### Scenario: Too few triangles for the octahedron

- **WHEN** `o2x0`, the octahedron's preset with its second dimension changed,
  is checked
- **THEN** it is refused with "The grid is too small to place all the painted
  squares.", a triangle of four having one that points up for four faces

### Requirement: A click rolls the solid toward the pointer

A left click SHALL roll the solid across the side of its square that faces the
pointer, judged from the square's center: one of four sides on a square, split
along its diagonals, and one of three on a triangle. A click exactly on that
center, and a roll across a side with no square beyond it, SHALL do nothing.
The right button SHALL do nothing.

#### Scenario: A click far from the solid

- **WHEN** the solid stands on a square grid and the square two rows above it
  and one column to its right is clicked
- **THEN** the solid rolls one square up

#### Scenario: A click past the edge

- **WHEN** the solid stands in the leftmost column and the board's margin to
  its left is clicked
- **THEN** nothing moves and no move is made

### Requirement: The arrows and the numeric keypad roll the solid

The arrow keys, and `8`, `2`, `4` and `6` on the numeric keypad, SHALL roll
the solid up, down, left and right. A triangle has no roll toward its point,
and that key SHALL do nothing there. On a triangle the keypad's `7`, `9`, `1`
and `3` SHALL roll too: the two that lean toward the triangle's flat side roll
across it, and the other two roll left and right. On a square, and from the
main row of digits, those four SHALL do nothing.

#### Scenario: A triangle pointing down

- **WHEN** the solid stands on a triangle whose flat side is its top
- **THEN** `7` and `9` each roll it up across that side, `1` rolls it left and
  `3` right, and the Down arrow does nothing

#### Scenario: A diagonal on the cube's grid

- **WHEN** the keypad's `7` is pressed on a grid of squares
- **THEN** nothing moves

### Requirement: Cube's status bar reads the count of rolls

`statusbarText` SHALL read `Moves: ` and the number of rolls that led to the
position on display.

#### Scenario: An undone roll is not counted

- **WHEN** three rolls are made and the last is undone
- **THEN** the status bar reads `Moves: 2`
