# flip Specification

## Purpose

Flip, the puzzle of lighting every square by pressing squares, where each press
also flips a fixed pattern of neighbors, in two rulesets. Its boards are
generated solvable and not already solved, its solver finds a shortest set of
presses, and its hint presses that answer in reading order, saying what forces
each press.

## Requirements

### Requirement: Rules: Flip's two toggle matrices

The `crosses` matrix SHALL be the deterministic plus-shaped neighborhood
matrix: a square flips itself and the squares directly above, below and to
either side of it. In the `random` matrix each square's set SHALL start as
the square itself and grow within the eight squares around it, and a matrix
with two identical rows SHALL be discarded and grown again.

#### Scenario: A corner square in Crosses

- **WHEN** a Crosses board is generated
- **THEN** its top-left square flips itself, the square to its right and the
  square below it, and no other

#### Scenario: A square in Random

- **WHEN** a Random board is generated
- **THEN** every square flips itself, and flips no square more than one step
  from it in either direction

### Requirement: Rules: A press flips the square and its matrix-defined neighbors

Clicking a square, or selecting it with the keyboard cursor, SHALL toggle the
square and its matrix-defined neighbors.

#### Scenario: A press

- **WHEN** the player presses a square
- **THEN** every square in the pressed square's matrix row is flipped, and no
  other

### Requirement: Rules: Flip is solved when every square is lit

The game SHALL report `solved` when every square is lit.

#### Scenario: Solving and completion

- **WHEN** the player flips cells until every square is lit
- **THEN** the game status becomes `solved`

### Requirement: Rules: Flip's rulesets are Crosses and Random

Flip SHALL declare Crosses and Random as its two rulesets, each with the rule
for which squares a press flips.

#### Scenario: The help says what Random changes

- **WHEN** a player reads Flip's help page
- **THEN** its rules say which squares a press flips in Crosses and which in
  Random

### Requirement: Params: Flip's params encoding

The params encoding SHALL be the width and height, followed in the full form
by `c` for Crosses or `r` for Random. Decoding SHALL accept these shorter forms:
`"5"` is 5×5, `"5x4"` names both dimensions, and the trailing letter is
optional, a string without one decoding as Crosses.

#### Scenario: The lenient forms decode

- **WHEN** `"5"`, `"5x4"` and `"5x5r"` are decoded
- **THEN** they give 5×5 Crosses, 5×4 Crosses and 5×5 Random

### Requirement: Params: Flip refuses a size it cannot use

Invalid parameters SHALL be refused with a human-readable reason: a
non-positive width or height, which the engine refuses from the lower bound of
1 that Flip declares on each, and unreasonably large dimensions, which Flip's
`validateParams` refuses.

#### Scenario: A width of zero

- **WHEN** a params string with a width of 0 is validated
- **THEN** it is refused, with a reason the player can read

### Requirement: Description: Flip descriptions are two hex strings

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

### Requirement: Generation: Flip generates solvable, non-trivial boards

For every preset, in both matrix types, `newDesc` SHALL produce a board whose
toggle matrix has no two identical rows and whose starting lights are not
already solved, and the Flip solver SHALL find a solution for every generated
board.

#### Scenario: Generated boards are solvable

- **WHEN** a Flip board is generated for any preset
- **THEN** its matrix has no duplicate rows and the start grid is
  non-trivial
- **AND** the solver returns a solution that, applied via
  `executeMove`, completes the game

### Requirement: Solver: Flip's solver finds a shortest set of presses

The Flip solver SHALL return a shortest set of presses, or report that no
solution exists for a hand-entered position. Solve SHALL press every square of
the solution in one move.

#### Scenario: Unsolvable hand-entered position

- **WHEN** the solver runs on a position with no solution
- **THEN** it reports that no solution exists rather than returning a
  move

#### Scenario: Solve is one move

- **WHEN** the player uses Solve on a board that takes several presses
- **THEN** every square is lit after one move, and one undo restores the board
  as it was

### Requirement: Controls: A square that flips nothing takes no press

A press on a square whose row of the matrix is empty SHALL make no move, by
the pointer or by the select keys, so it adds nothing to the move count and
nothing to undo. Only a description typed by hand has such a square: a dealt
board's every square flips itself.

#### Scenario: A hand-typed matrix with an empty row

- **WHEN** a description whose matrix gives the top-left square no square to
  flip is opened, and the player presses Enter twice, once to show the cursor
  there and once to press the square
- **THEN** the status bar still reads `Moves: 0` and there is nothing to undo

### Requirement: Hint: Flip names no hue for either state

The game SHALL name no hue of its own for either state: its hint sentences and
hint-mark legends SHALL say "lit" and "unlit", and its help page SHALL name the
two pieces by placeholder and by shape.

#### Scenario: The help page names the pieces

- **WHEN** a player reads Flip's help page
- **THEN** an unlit square's piece and a lit square's are each named by the
  pair's placeholder and its shape, and by no color word written in the page

### Requirement: Hint: Flip's hint presses the shortest answer in reading order and says what forces each press

Flip's hint SHALL plan the presses of the solver's shortest answer in reading
order, one step a press, and SHALL say of each press before the last which of
two kinds it is: the last square in reading order that flips some unlit square,
or a square whose every flipped square is also flipped by a later one. A step
SHALL claim nothing the code has not checked on the board the step is shown on.

#### Scenario: Following the hint to the end

- **WHEN** the player follows every step of the plan
- **THEN** the board is solved in as few presses as any set of presses takes

### Requirement: Hint: A press that is an unlit square's last chance is said as a deduction

Where a press before the plan's last is the last square in reading order that
flips some unlit square, the step SHALL say so as a deduction, naming the order
in its own words, ring the square to press, outline those unlit squares, and
stripe and name every other square the press flips, so that no square the
press changes is left unmarked.

#### Scenario: A press that is an unlit square's last chance

- **WHEN** the hint's next press is the last square in reading order that
  flips an unlit square, and is not the plan's last press
- **THEN** the step says that, row by row, only the ringed square can still
  light the outlined square, so it must be pressed
- **AND** every outlined square is unlit and is flipped by no square after the
  ringed one
- **AND** every other square the press flips is striped, and the step says
  the press flips the striped ones too

### Requirement: Hint: A press the order does not decide is offered as one of the fewest

Where every square a press before the plan's last flips is also flipped by a
later square, the step SHALL offer the press as one of the fewest presses that
light the board the step is shown on, saying how many that is, and SHALL say
there is only one way to light the board when no other set of presses does.

#### Scenario: A press the order does not decide

- **WHEN** every square the hint's next press flips is also flipped by a later
  square, and the press is not the plan's last
- **THEN** the step outlines and stripes nothing, says how many presses the
  board takes and no fewer, and offers the ringed square as one of them
- **AND** it says there is only one way to light the board exactly when the
  board has one answer

### Requirement: Hint: The last press says it finishes the board

The plan's last press SHALL say that it finishes the board, whichever of the
two kinds it is, and SHALL outline every other unlit square.

#### Scenario: The last press

- **WHEN** one press is left in the plan
- **THEN** the step says pressing the ringed square lights the outlined
  squares and finishes the board
- **AND** the outlined squares are every unlit square but the ringed one, and
  the press flips each of them

### Requirement: Hint: The hint's plan is the same plan after each of its presses

The plan SHALL be the same plan after each of its presses: a hint asked again
once a step's square is pressed SHALL give the steps that were left, with the
same words.

#### Scenario: Following the hint

- **WHEN** the player presses the square a step rings and asks again
- **THEN** the hint gives the steps that were left, unchanged

### Requirement: Hint: The hint refuses a board no set of presses lights

A board no set of presses lights SHALL be refused by the hint as a puzzle whose
solution cannot be determined.

#### Scenario: A hand-entered board with no answer

- **WHEN** a hint is asked on a board no set of presses lights
- **THEN** it refuses, saying the puzzle's solution cannot be determined

### Requirement: Status bar: Flip's status bar counts the moves

Flip SHALL provide a status bar string reporting the move count.

#### Scenario: The status bar after a press

- **WHEN** the player presses a square on a fresh board
- **THEN** the status bar reports one move

### Requirement: Status bar: Solve counts a move for each square it presses

The game's own words in the status bar SHALL be `Moves: ` and the number of
presses made on the board. Solve SHALL add one to that number for each square
of its answer, although it is one step of the history.

#### Scenario: Solve on a board that takes five presses

- **WHEN** the player uses Solve on `d074191345d1644c17058,288` opened under
  `3x3c`, whose shortest answer is five presses
- **THEN** the status bar reads `Auto-solved. Moves: 5`, the first two words
  being the engine's, and one undo takes the count back to 0

### Requirement: Look: A square's state is a piece of the two-state pair

`redraw` SHALL draw the board as pieces on a quiet surface. A square's two
states SHALL be the two members of the collection's two-state pair: an unlit
square holds the first member and a lit square the second, each drawn in that
member's color and shape, inset on its square, so a finished board is every
square holding the second member. No state SHALL be a step of gray.

#### Scenario: A lit square is told from an unlit one by its piece

- **WHEN** a board with lit and unlit squares is drawn, in either scheme
- **THEN** every unlit square holds the pair's first piece and every lit square
  the second, on the same surface

### Requirement: Look: The diagram is on the piece, and the cursor and marks beside it

The toggle diagram SHALL be drawn on the piece, in a color pinned against that
piece so that it reads in both schemes. The keyboard cursor and a hint's marks
SHALL sit at the square's edge, beside the piece.

#### Scenario: The diagram on each piece

- **WHEN** a board with lit and unlit squares is drawn, in either scheme
- **THEN** the diagram on each piece is drawn in a pinned color that the piece
  is not

#### Scenario: A hinted square under the cursor

- **WHEN** the keyboard cursor is on a square a hint rings
- **THEN** the cursor and the ring are each drawn as an outline along the
  square's edge, around the piece

### Requirement: Look: A flip shows one piece at a time, and the win flash sweeps the squares

A move SHALL animate each square it flips as the old piece shrinking away and
the new one growing in its place, never both at once. The win flash SHALL
sweep the squares along the diagonal, and a lit square's ground SHALL be
filled with a flash color, with its piece and the diagram on it unchanged.

#### Scenario: Halfway through a flip

- **WHEN** a square is drawn before the midpoint of its flip, and again after
  it
- **THEN** the first frame holds only the old piece, smaller than whole, and
  the second only the new one

#### Scenario: A move that does not solve the board

- **WHEN** a press flips squares and leaves a light on
- **THEN** no square's ground is a flash color in any frame of the flip
