# flip Specification

## Purpose
Flip, the puzzle of lighting every square by pressing squares, where each press
also flips a fixed pattern of neighbors. Its boards are generated solvable and
not already solved, and its solver finds a shortest set of presses by
elimination over GF(2).

## Requirements

### Requirement: Flip parameters and presets

Flip SHALL support a width, a height, and a matrix type of `crosses` or
`random`. It SHALL offer the presets 3×3, 4×4 and 5×5 in each of Crosses and
Random. Parameter decoding SHALL accept the lenient forms: `"5"` is 5×5,
`"5x4"` names both dimensions, and a trailing `c` or `r` is optional, a string
without one decoding as `crosses`. The full encoding SHALL round-trip a decoded
parameter set.

#### Scenario: Preset and game-ID parameters select a board

- **WHEN** a Flip preset or a `params:desc` / `params#seed` game ID is
  chosen
- **THEN** the engine produces a Flip board of the requested size and
  matrix type
- **AND** `"5"`, `"5x4"`, and `"5x5r"` all decode to the expected
  parameters

### Requirement: Flip refuses a size it cannot use

Invalid parameters SHALL be refused with a human-readable reason: a
non-positive width or height, which the engine refuses from the lower bound of
1 that Flip declares on each, and unreasonably large dimensions, which Flip's
`validateParams` refuses.

#### Scenario: A width of zero

- **WHEN** a params string with a width of 0 is validated
- **THEN** it is refused, with a reason the player can read

### Requirement: Flip generates solvable, non-trivial boards

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

### Requirement: Flip's two toggle matrices

The `crosses` matrix SHALL be the deterministic plus-shaped neighborhood
matrix: a square flips itself and the squares directly above, below and to
either side of it. The `random` matrix SHALL be grown by the ordered-multiset
growth algorithm, in which each square's set starts as the square itself and
grows within the eight squares around it, with every choice drawn from the
engine's seeded random source, and a matrix with two identical rows SHALL be
discarded and grown again.

#### Scenario: A corner square in Crosses

- **WHEN** a Crosses board is generated
- **THEN** its top-left square flips itself, the square to its right and the
  square below it, and no other

#### Scenario: A square in Random

- **WHEN** a Random board is generated
- **THEN** every square flips itself, and flips no square more than one step
  from it in either direction

### Requirement: Flip's solver finds a shortest set of presses

The Flip solver SHALL perform Gaussian elimination over GF(2) on the toggle
matrix and return a shortest set of presses, or report that no solution exists
for a hand-entered position. Solve SHALL press every square of the solution in
one move.

#### Scenario: Unsolvable hand-entered position

- **WHEN** the solver runs on a position with no solution
- **THEN** it reports that no solution exists rather than returning a
  move

#### Scenario: Solve is one move

- **WHEN** the player uses Solve on a board that takes several presses
- **THEN** every square is lit after one move, and one undo restores the board
  as it was

### Requirement: A press flips the square and its matrix-defined neighbors

Clicking a square, or selecting it with the keyboard cursor, SHALL toggle the
square and its matrix-defined neighbors. `executeMove` SHALL be pure: it
returns a new state. Moving the keyboard cursor SHALL redraw without adding a
history entry.

#### Scenario: A press leaves the state it was made on alone

- **WHEN** `executeMove` applies a press to a state
- **THEN** the state it returns has the pressed square's matrix row flipped
- **AND** the state it was given is unchanged

#### Scenario: The cursor moves

- **WHEN** the player moves the keyboard cursor to another square
- **THEN** the cursor is redrawn there and undo has nothing new to take back

### Requirement: Flip is solved when every square is lit

The game SHALL report `solved` when every square is lit, upgraded to
`solved-with-help` when the solver was used. The upgrade is the engine's,
made on the `solved` that Flip's own `status` reports.

#### Scenario: Solving and completion

- **WHEN** the player flips cells until every square is lit
- **THEN** the game status becomes `solved`
- **AND** if the built-in solver was used to get there it is
  `solved-with-help`

### Requirement: Flip rendering, timing, and text format

Flip SHALL render the grid, the per-square toggle diagram and the keyboard
cursor through `GameDrawing`, with a flip animation on a move and a win flash
on completion. It SHALL provide a status bar string reporting the move count,
which the engine's completed and auto-solved words are prefixed to, and a
plain-text format of the board. The background, the squares' surface and the
grid lines SHALL be derived from the supplied default background.

#### Scenario: Flip renders and animates through the engine

- **WHEN** Flip is played through the app
- **THEN** moves animate, completion flashes, the status bar shows the
  move count and completion wording, and the surface is derived from
  the host background
- **AND** the board has a correct plain-text representation

### Requirement: A square's state is a piece of the two-state pair

`redraw` SHALL draw the board as pieces on a quiet surface. A square's two
states SHALL be the two members of the collection's two-state pair: an unlit
square holds the first member and a lit square the second, each drawn in that
member's color and shape, inset on its square, so a finished board is every
square holding the second member. No state SHALL be a step of gray.

#### Scenario: A lit square is told from an unlit one by its piece

- **WHEN** a board with lit and unlit squares is drawn, in either scheme
- **THEN** every unlit square holds the pair's first piece and every lit square
  the second, on the same surface

### Requirement: The diagram is on the piece, and the cursor and marks beside it

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

### Requirement: A flip shows one piece at a time, and the win flash is a ring

A move SHALL animate each square it flips as the old piece shrinking away and
the new one growing in its place, never both at once. The win flash SHALL be a
ring of squares showing the first member, moving outward from the middle of
the board.

#### Scenario: Halfway through a flip

- **WHEN** a square is drawn before the midpoint of its flip, and again after
  it
- **THEN** the first frame holds only the old piece, smaller than whole, and
  the second only the new one

### Requirement: Flip names no hue for either state

The game SHALL name no hue of its own for either state: its hint sentences and
hint-mark legends SHALL say "lit" and "unlit", and its help page SHALL name the
two pieces by placeholder and by shape.

#### Scenario: The help page names the pieces

- **WHEN** a player reads Flip's help page
- **THEN** an unlit square's piece and a lit square's are each named by the
  pair's placeholder and its shape, and by no color word written in the page

### Requirement: Flip is registered in the engine registry

The `flip` puzzle SHALL be implemented as a `Game` registered in the engine
registry, so the worker serves `flip` through the midend.

#### Scenario: Flip loads on the engine

- **WHEN** the app opens `flip`
- **THEN** it is constructed by the midend-backed puzzle

### Requirement: Flip's hint presses the shortest answer in reading order and says what forces each press

Flip's hint SHALL plan the presses of the solver's shortest answer in reading
order, one step a press, and SHALL say of each press before the last which of
two kinds it is: the last square in reading order that flips some unlit square,
or a square whose every flipped square is also flipped by a later one. A step
SHALL claim nothing the code has not checked on the board the step is shown on.

#### Scenario: Following the hint to the end

- **WHEN** the player follows every step of the plan
- **THEN** the board is solved in as few presses as any set of presses takes

### Requirement: A press that is an unlit square's last chance is said as a deduction

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

### Requirement: A press the order does not decide is offered as one of the fewest

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

### Requirement: The last press says it finishes the board

The plan's last press SHALL say that it finishes the board, whichever of the
two kinds it is, and SHALL outline every other unlit square.

#### Scenario: The last press

- **WHEN** one press is left in the plan
- **THEN** the step says pressing the ringed square lights the outlined
  squares and finishes the board
- **AND** the outlined squares are every unlit square but the ringed one, and
  the press flips each of them

### Requirement: The hint's plan is the same plan after each of its presses

The plan SHALL be the same plan after each of its presses: a hint asked again
once a step's square is pressed SHALL give the steps that were left, with the
same words.

#### Scenario: Following the hint

- **WHEN** the player presses the square a step rings and asks again
- **THEN** the hint gives the steps that were left, unchanged

### Requirement: The hint refuses a board no set of presses lights

A board no set of presses lights SHALL be refused by the hint as a puzzle whose
solution cannot be determined.

#### Scenario: A hand-entered board with no answer

- **WHEN** a hint is asked on a board no set of presses lights
- **THEN** it refuses, saying the puzzle's solution cannot be determined

### Requirement: Flip's rulesets are Crosses and Random

Flip SHALL declare Crosses and Random as its two rulesets, each with the rule
for which squares a press flips, so the Type menu holds a section for each, a
params label starts with the ruleset's name, and the help page states each
one's rule in its opening list. The params encoding SHALL be the width and
height, followed in the full form by `c` for Crosses or `r` for Random.

#### Scenario: The menu keeps the two apart

- **WHEN** the player opens Flip's Type menu
- **THEN** the Crosses presets and the Random presets are in separate sections

#### Scenario: The help says what Random changes

- **WHEN** a player reads Flip's help page
- **THEN** its rules say which squares a press flips in Crosses and which in
  Random
