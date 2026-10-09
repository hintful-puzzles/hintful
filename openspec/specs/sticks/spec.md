# sticks Specification

## Purpose
Sticks (Tatebo-Yokobo), the puzzle of filling every blank cell with a horizontal
or vertical line, where a number on a line gives its length, no line covers two
numbers, and a number on a block counts the lines running into it. This
capability specifies the game: its parameters and descriptions, the deductive
solver and the generator it gates, input, mistake checking, the explained hint
and the drawing.

## Requirements

### Requirement: Sticks parameters and what each check refuses

Parameters SHALL be a width, a height, a percentage of blocks, and a symmetry
(none, 2-way mirror, 2-way rotational, 4-way mirror, or 4-way rotational).
Width and height SHALL each be at least 2 and the symmetry SHALL be a known
one; both are declared on `paramConfig`, so the engine refuses them at every
check. `validateParams` SHALL refuse, on a full parameter check only, a block
percentage outside 5 to 100, and 4-way rotational symmetry on a grid that is
not square.

#### Scenario: A short check ignores the generation-only limits

- **WHEN** a non-square grid with a block percentage of 0 and 4-way rotational
  symmetry is checked without the full flag
- **THEN** it is accepted

#### Scenario: A full check refuses 4-way rotational symmetry off a square

- **WHEN** a 5x6 grid with 4-way rotational symmetry is checked in full
- **THEN** it is refused

### Requirement: Sticks parameters round-trip through their encoding

The full encoding of the parameters SHALL carry the width, height, block
percentage and symmetry, and SHALL round-trip through decode. The short
encoding SHALL be the bare `width x height`. A bare `width x height` ID SHALL
decode without a symmetry marker.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded in full and decoded
- **THEN** the same width, height, block percentage and symmetry are
  recovered

#### Scenario: A bare size decodes

- **WHEN** `10x10` is decoded
- **THEN** the parameters have width 10 and height 10

### Requirement: Sticks descriptions use the run-length blank encoding

A Sticks description SHALL encode the fixed puzzle data, blocks and clue
numbers, over the grid cells in row-major order: runs of plain blank cells SHALL
be abbreviated with lowercase letters, a block SHALL carry a marker with an
optional adjacent clue digit, and a clue number SHALL be written inline as
decimal digits. The description SHALL account for exactly the grid's cell count.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: A Sticks description is validated against the grid

Validation SHALL reject a description that accounts for more or fewer cells than
the grid holds, distinguishing too many from too few, and SHALL reject a
description containing an unknown character.

#### Scenario: A description with the wrong number of cells is rejected

- **WHEN** a description accounting for more or fewer cells than the grid has is
  validated
- **THEN** it is rejected with a message distinguishing too long from too short

### Requirement: Sticks ports the deductive solver and solver-gated generator

Sticks SHALL provide a deductive solver that fills the blank cells with horizontal
or vertical lines consistent with every clue, or reports that the board is
invalid. The solver SHALL work by contradiction on single cells: it SHALL try each
blank cell as one orientation and, when that makes the board provably invalid,
commit the opposite orientation, iterating until no further cell is forced. The
solver SHALL NOT use backtracking, and SHALL classify a board as complete,
unfinished, or invalid.

#### Scenario: A board with no clues is unfinished

- **WHEN** a board of blank cells carrying no clues at all is solved
- **THEN** no cell is forced and the board is classified unfinished

### Requirement: Sticks validity is checked against the puzzle rules

Validity SHALL be checked against the puzzle rules: a numbered line SHALL have the
stated length, a line SHALL overlap at most one number, and a numbered block
SHALL connect to the stated number of lines.

#### Scenario: The solver completes a soluble board

- **WHEN** a generated board is solved from its clues alone
- **THEN** the solver returns the unique completion, with every numbered line at
  its stated length and every numbered block at its stated connection count

### Requirement: The Sticks generator keeps only what the solver completes

The generator SHALL place blocks under the chosen symmetry, fill and clue
the board, and retain a candidate only while the deductive solver deduces it to a
unique completion; it SHALL then remove clues in a randomized order, keeping each
removal only while the board stays uniquely solvable. Generation from a given seed
SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

### Requirement: Every generated Sticks board has one solution, reached without guessing

Sticks offers one difficulty tier, so that tier has to be what it claims to be:
every generated board SHALL have exactly one solution, and the shipped deduction
SHALL reach it with no guessing anywhere.

#### Scenario: A generated board has exactly one solution

- **WHEN** a generated board is enumerated by a search that propagates the shipped
  deduction and branches on the cells it leaves undecided
- **THEN** exactly one solution is found

### Requirement: Uniqueness is established by a witness independent of the solver

Uniqueness SHALL be established by a witness independent of the deductive
solver, because the solver returning "complete" reports only on the line of play
it followed and is not evidence about how many solutions exist. That witness
SHALL itself be shown capable of reporting more than one solution, or the
assertion is vacuous.

#### Scenario: The uniqueness witness can report more than one

- **WHEN** the search that propagates the shipped deduction and branches on the
  cells it leaves undecided is run on a board carrying no clues at all
- **THEN** it reports more than one solution

### Requirement: The segment-reachability look-behind bounds are kept

The two look-behind bounds in the segment-reachability computation
(`x > 1` / `y > 1`, where the geometry admits `x > 0` / `y > 0`) SHALL be kept,
although they make the checker weaker than intended.

#### Scenario: The look-behind is not made one cell in from the edge

- **WHEN** the room of a numbered line is walked toward the left or the top and
  reaches a free cell one in from that edge
- **THEN** that cell is counted as room without looking at whether the edge
  cell beyond it holds a line of another number

### Requirement: Sticks is played by drag, click and keyboard cursor

Sticks SHALL be played by dragging to draw a line, clicking to place a line, or
using a keyboard cursor with keys to place or clear a line. A left click SHALL
cycle a cell through empty, vertical, horizontal and empty again, and a right
click SHALL cycle it the other way, placing a horizontal line on an empty cell.

#### Scenario: A left click on an empty cell places a vertical line

- **WHEN** an empty cell is left-clicked three times
- **THEN** it holds a vertical line, then a horizontal line, then nothing

### Requirement: A Sticks drag draws along its dominant axis

A drag SHALL draw the orientation of its dominant axis across the cells it
passes. A drag started on a line of the orientation it is dragged in SHALL
instead clear the lines in the cells it passes.

#### Scenario: Dragging draws a line

- **WHEN** the pointer is dragged horizontally or vertically within the grid past
  the drag threshold
- **THEN** a line of the dragged orientation is placed in the cells the drag
  crosses

### Requirement: A block takes no line, and a no-op is not a move

Blocks SHALL never take a line, and placing a line already in that state SHALL
be a no-op that does not reach the undo history.

#### Scenario: A key that would change nothing makes no move

- **WHEN** the key that places a vertical line is pressed with the cursor on a
  cell already holding a vertical line
- **THEN** no move is made

### Requirement: Sticks findMistakes flags only lines that contradict the solution

`findMistakes` SHALL re-solve the board from its fixed clues and flag every cell
whose player-drawn line contradicts the unique solution; a merely missing line
SHALL NOT be flagged.

#### Scenario: A contradicting line is flagged as a mistake

- **WHEN** the board is checked and a placed line differs from the unique
  solution's line for that cell
- **THEN** that cell is reported as a mistake

### Requirement: Sticks completion flashes once and nothing is animated

The game SHALL be reported solved when every blank cell carries a line
consistent with all clues, and SHALL flash once on completion. There SHALL be no
interpolated animation of line placement.

#### Scenario: Completing the grid consistently wins

- **WHEN** every blank cell carries a line consistent with all clues
- **THEN** the game is reported solved and flashes

### Requirement: A Sticks hint names the clue a tentative line would break, and how

A step's explanation SHALL name **which clue** the tentative line would break
and **how** it would break it, distinguishing at least: a line exceeding its
number, a line that could no longer reach its number, a line covering two
numbers, a block's clue gaining more lines than it counts, and a block's clue
losing a side it still needed.

#### Scenario: A forced line is explained by the clue it would break

- **WHEN** a hint is requested on a board where one orientation of a square
  would violate a clue
- **THEN** the step names that clue and the way the tentative line breaks it,
  and concludes that the square must take the other orientation

### Requirement: A Sticks hint concludes in the necessity voice and names a clue by its number

The explanation SHALL state its conclusion in the necessity voice of a
deductive game, and SHALL refer to a clue by the number the player can see.

#### Scenario: The conclusion says what the square must be

- **WHEN** a step forces a square that carries the number 2 to be vertical
- **THEN** its explanation says that this 2 must be vertical

### Requirement: One clue ruling out several Sticks squares is one journey

Where one clue and one rule rule out **several** squares at once, they SHALL be
one journey rather than several hints, each of its later legs saying that it
continues the same argument while keeping its own square's specifics.

#### Scenario: One clue ruling out several squares is one hint

- **WHEN** a single clue and rule force more than one square on the same board
- **THEN** those squares arrive as one continuing journey, each leg naming the
  square it decides and the orientation that square must take

### Requirement: The Sticks hint draws the forced line in the hint color

The hint SHALL show where to act in the game's own vocabulary: the forced
square carrying a line of the forced orientation, in the hint color, since a
uniform highlight could not say *which* orientation, and that is the whole of
the move. It SHALL NOT draw the line in the color of a placed line.

#### Scenario: The forced orientation is visible, not merely described

- **WHEN** a hint step is displayed
- **THEN** the forced square shows a line of the forced orientation in the hint
  color, and no square shows a line in the placed-line color that the player
  did not place

### Requirement: The Sticks hint shows its evidence, and the marks count out against the words

The hint SHALL also show the evidence its reasoning rests on, marked so that the
evidence does not hide what makes it evidence. Where the explanation states a
count (a run's length, the room a line has left, the lines or open sides a
block's clue has) the marked squares SHALL number what the explanation says, so
the player can count the picture against the words. Where the explanation names
a run or a span, that run or span SHALL be the one the deduction actually
walked.

#### Scenario: A length argument marks the run it counts

- **WHEN** a step says a line would run a number's line to 3 squares
- **THEN** exactly the 3 squares of that run are marked as evidence

### Requirement: No two roles on the Sticks board share a color

No two roles on the board SHALL share a color: the hint SHALL take the
collection's hint color and the keyboard cursor SHALL take the collection's
cursor color, which the board has not otherwise spent.

#### Scenario: The cursor is told from the hint

- **WHEN** the keyboard cursor sits on a square while a hint step is displayed
- **THEN** the cursor's frame and the hint's forced line are different colors

### Requirement: Sticks draws its cells on the collection's quiet surface

`redraw` SHALL draw an open cell as the collection's cell surface, with the
collection's surface grid line between cells and a frame round the grid no
heavier than that line. A number on an open cell SHALL be drawn in ink.

#### Scenario: The grid recedes behind the lines

- **WHEN** a board with a line drawn in it is painted
- **THEN** the line between two open cells is the surface's grid line
- **AND** the player's line is drawn in its own color over the cell surface

### Requirement: A Sticks block is a solid mass in the wall color

A block SHALL be a solid fill in the collection's wall color, over its whole
tile, so that adjacent blocks read as one mass, with its number in a white that
is the same in both schemes. The hint's evidence ring on a block SHALL carry a
line in the number's white inside it, so the ring is told from the block in both
schemes.

#### Scenario: Adjacent blocks are one mass

- **WHEN** two blocks are adjacent
- **THEN** no grid line is drawn between them

### Requirement: A player's line is drawn in the placed-piece color

A line the player draws SHALL be drawn at its own weight in the collection's
color for a placed piece, the theme pair's first member: it is the content, and
the grid is not.

#### Scenario: A placed line is a bar in the piece's color

- **WHEN** a cell holding a horizontal line is painted
- **THEN** a horizontal bar in the placed-piece color crosses the cell surface

### Requirement: Sticks calls the cell a block

The game's words (its hint, its help page and its Custom dialog) SHALL call the
cell a block, never a black cell.

#### Scenario: The hint names a block by its number

- **WHEN** a step reasons from a block carrying the number 2
- **THEN** its explanation calls it the 2 block
