# sticks Specification

## Purpose
Sticks (Tatebo-Yokobo), the puzzle of filling every blank cell with a horizontal
or vertical line, where a number on a line gives its length, no line covers two
numbers, and a number on a block counts the lines running into it. This
capability specifies what is the game's own: the params it refuses and what a
short params string means, its descriptions, the deductive solver and the
generator it gates, what its search assumes, its drag and its keys, mistake
checking, the hint's reasons and order, and the drawing.

## Requirements

### Requirement: Rules: Sticks validity is checked against the puzzle rules

Validity SHALL be checked against the puzzle rules: a numbered line SHALL have the
stated length, a line SHALL overlap at most one number, and a numbered block
SHALL connect to the stated number of lines.

#### Scenario: The solver completes a soluble board

- **WHEN** a generated board is solved from its clues alone
- **THEN** the solver returns the unique completion, with every numbered line at
  its stated length and every numbered block at its stated connection count

### Requirement: Rules: Sticks findMistakes flags only lines that contradict the solution

`findMistakes` SHALL flag every cell whose player-drawn line contradicts the
board's one fill; a merely missing line SHALL NOT be flagged.

#### Scenario: A contradicting line is flagged as a mistake

- **WHEN** the board is checked and a placed line differs from the unique
  solution's line for that cell
- **THEN** that cell is reported as a mistake

### Requirement: Rules: A Sticks board is solved when every blank cell carries a line that meets the clues

The game SHALL be reported solved when every blank cell carries a line
consistent with all clues.

#### Scenario: Completing the grid consistently wins

- **WHEN** every blank cell carries a line consistent with all clues
- **THEN** the game is reported solved

### Requirement: Rules: A Sticks block takes no line

Blocks SHALL never take a line.

#### Scenario: A line key on a block

- **WHEN** the key that places a vertical line is pressed with the cursor on a
  block
- **THEN** no move is made

### Requirement: Params: Sticks refuses, for a deal only, a block percentage outside 5 to 100 and a quarter-turn symmetry off a square

`validateParams` SHALL refuse, on a full parameter check only, a block
percentage outside 5 to 100, and 4-way rotational symmetry on a grid that is
not square.

#### Scenario: A short check ignores the generation-only limits

- **WHEN** a non-square grid with a block percentage of 0 and 4-way rotational
  symmetry is checked without the full flag
- **THEN** it is accepted

#### Scenario: A full check refuses 4-way rotational symmetry off a square

- **WHEN** a 5x6 grid with 4-way rotational symmetry is checked in full
- **THEN** it is refused

### Requirement: Params: A Sticks params string may leave out its blocks, its symmetry and its difficulty

Sticks' params (a size, a percentage of blocks, their symmetry and a tier),
their bounds, encoding and label words SHALL be those its `paramConfig` and
its declared codec give (`engine-params`, "A game declares its params encoding
once, and both codec halves are derived"), and its menu what `presets` builds.
A string with no `b` SHALL decode as 20 percent, one with no `s` as 2-way
rotational, and one with no difficulty letter as Easy.

#### Scenario: A string that leaves a field out

- **WHEN** `7x7`, the short form of every 7×7 board, is decoded
- **THEN** the board has 20 percent blocks in 2-way rotational symmetry, at
  Easy
- **AND** `7x7b20s2`, written before the game had tiers, decodes as Easy

#### Scenario: An asymmetric board

- **WHEN** `2x5b20s0du` is decoded
- **THEN** the params are 2 wide and 5 high, 20 percent blocks, no symmetry,
  and Unreasonable

### Requirement: Params: Sticks refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
2×2 board. The solver finishes every 2×2 board that has one fill.

#### Scenario: A 2×2 board is not dealt at Unreasonable

- **WHEN** a 2×2 board is asked for at Unreasonable
- **THEN** it is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×2 board is still dealt at Easy, and a 2×3 board is admitted at
  Unreasonable

#### Scenario: Every 2×2 board is tried

- **WHEN** every set of blocks, every fill, every square a line's number
  could sit on and every set of numbers left showing on a 2×2 board is given
  to the solver, and those it leaves unfinished are counted
- **THEN** none of them has exactly one fill
- **AND** the same walk over a 2×3 board finds some that do

### Requirement: Params: Unreasonable Sticks is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 100 squares or longer than 30 on a side, with a reason
naming the difficulty. The same size SHALL still be asked for at Easy.

#### Scenario: A size past the bound is refused at Unreasonable only

- **WHEN** an 11×11 board and a 2×40 board are checked for dealing at each
  difficulty
- **THEN** each is refused at Unreasonable and not at Easy
- **AND** a 10×10, a 4×25 and a 2×30 board are admitted at Unreasonable

### Requirement: Description: Sticks descriptions use the run-length blank encoding

A Sticks description SHALL encode the fixed puzzle data, blocks and clue
numbers, over the grid cells in row-major order: runs of plain blank cells SHALL
be abbreviated with lowercase letters, a block SHALL carry a marker with an
optional adjacent clue digit, and a clue number SHALL be written inline as
decimal digits. The description SHALL account for exactly the grid's cell count.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: Description: A Sticks description is validated against the grid

Validation SHALL reject a description that accounts for more or fewer cells than
the grid holds, distinguishing too many from too few, and SHALL reject a
description containing an unknown character.

#### Scenario: A description with the wrong number of cells is rejected

- **WHEN** a description accounting for more or fewer cells than the grid has is
  validated
- **THEN** it is rejected with a message distinguishing too long from too short

### Requirement: Description: A Sticks description spells a block `B` and parts two written cells with `_`

A letter `a` to `z` SHALL stand for 1 to 26 plain blank cells. A block SHALL
be `B`, with its number, 0 to 4, straight after it where it has one. A blank
cell's number, 1 to the longer side of the grid, SHALL be written as decimal
digits, with `_` before it exactly when the cell before it was written as a
cell and not within a run. `newState` SHALL refuse a number outside its range
and a `_` anywhere else.

#### Scenario: A dealt 5×5 board is read

- **WHEN** `3bB1b5c2aB3c2a2_2aB2b1` is read as a 5×5 board
- **THEN** the top row is a blank cell holding 3, two plain blank cells, a
  block holding 1 and a plain blank cell
- **AND** the `2_2` in it is two blank cells side by side that each hold a 2,
  in the fourth row, and the board ends on a blank cell holding 1

#### Scenario: A block's number past 4, and a missing `_`

- **WHEN** the `B1` of that description is changed to `B5`, or the `_` of its
  `2_2` is taken out
- **THEN** each is refused as holding a number out of range for its board, the
  second because `22` reads as one number

### Requirement: Generation: The Sticks generator keeps only what the solver completes

The generator SHALL place blocks under the chosen symmetry, fill and clue
the board, and retain a candidate only while the deductive solver deduces it to a
unique completion; it SHALL then remove clues in a randomized order. At Easy
it SHALL keep each removal only while the solver still completes the board.

#### Scenario: A clue the solver needs is put back

- **WHEN** an Easy board is stripped, and taking a clue out leaves a board the
  solver does not complete
- **THEN** that clue is put back, and the strip goes on to the next

### Requirement: Generation: Uniqueness is held by a count, and not by the solver's verdict alone

That a dealt board has exactly one fill SHALL be held by a count that branches
on every cell the deduction leaves undecided, and not by the solver's verdict
alone. That count SHALL itself be shown capable of reporting more than one
solution, or the assertion is vacuous.

#### Scenario: The uniqueness witness can report more than one

- **WHEN** the search that propagates the shipped deduction and branches on the
  cells it leaves undecided is run on a board carrying no clues at all
- **THEN** it reports more than one solution

### Requirement: Generation: An Unreasonable Sticks board has one answer that the solver does not reach

At Unreasonable the generator SHALL remove clues from a fill the solver
completes, each only while the search still proves one fill within a budget
of its own, well under the search's, and SHALL keep the board only when the
solver stops short on it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 3×3 to 5×5
- **THEN** the solver leaves each unfinished
- **AND** exactly one fill fits each, by a count that has no search in it

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 2×5 board, a 3×3 board and a 10×10 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Generation: A Sticks board is Easy where the solver and the hint both finish it

A board SHALL count as Easy where the solver and the hint finish it, and as
Unreasonable where it has exactly one fill that they do not reach.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one fill the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4b20s2du`

### Requirement: Solver: Sticks ports the deductive solver and solver-gated generator

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

### Requirement: Solver: The segment-reachability look-behind bounds are kept

The two look-behind bounds in the segment-reachability computation
(`x > 1` / `y > 1`, where the geometry admits `x > 0` / `y > 0`) SHALL be kept,
although they make the checker weaker than intended.

#### Scenario: The look-behind is not made one cell in from the edge

- **WHEN** the room of a numbered line is walked toward the left or the top and
  reaches a free cell one in from that edge
- **THEN** that cell is counted as room without looking at whether the edge
  cell beyond it holds a line of another number

### Requirement: Solver: Sticks' search assumes the first blank square's line across, then up and down

Where the solver stops, the search that counts a board's fills SHALL take the
first blank square and assume its line runs across, and then up and down.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 4×4 board the solver finishes, on one with
  one fill that it does not reach, on one with no block and no number, and on
  one whose corner square holds a 4 with a 1 beside it and a 1 below it
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 4×4, the same with numbers taken away and
  the same with one number changed are each counted by laying every white
  square each way and reading the finished board against its numbers
- **THEN** the search reports one answer exactly where one fill fits, several
  where more do and none where none does

### Requirement: Controls: Sticks is played by drag, click and keyboard cursor

Sticks SHALL be played by dragging to draw a line, clicking to place a line, or
using a keyboard cursor with keys to place or clear a line.

#### Scenario: A left click on an empty cell places a vertical line

- **WHEN** an empty cell is left-clicked three times
- **THEN** it holds a vertical line, then a horizontal line, then nothing

### Requirement: Controls: A Sticks drag draws along its dominant axis

A drag SHALL draw the orientation of its dominant axis across the cells it
passes. A drag started on a line of the orientation it is dragged in SHALL
instead clear the lines in the cells it passes.

#### Scenario: Dragging draws a line

- **WHEN** the pointer is dragged horizontally or vertically within the grid past
  the drag threshold
- **THEN** a line of the dragged orientation is placed in the cells the drag
  crosses

### Requirement: Controls: Sticks' line keys set a line outright

The key `1` SHALL place a vertical line in the cursor's square and `0` or `2`
a horizontal one, whatever line the square holds, and Backspace SHALL clear
it. A key that would leave the square as it is SHALL make no move.

#### Scenario: A key does not cycle

- **WHEN** the cursor is on a square holding a vertical line and `1` is
  pressed, and then `2`
- **THEN** the first press makes no move and the second turns the line
  horizontal, where two left-clicks would have cleared the square

### Requirement: Controls: Shift or Ctrl with an arrow draws through the squares the Sticks cursor joins

An arrow held with Shift or Ctrl SHALL move the cursor and, as one move, draw
a line in the square it leaves and the square it enters: with Ctrl a line
along the way the cursor moves, with Shift a line across it, and with both no
line, clearing them. A block, and a square that already holds what the key
would draw, SHALL be left out of the move, and where both are the press SHALL
only move the cursor.

#### Scenario: Ctrl and Right, then Shift and Right

- **WHEN** the cursor is on an empty square with two empty squares to its
  right, and Right is pressed with Ctrl and then with Shift
- **THEN** the first press draws a horizontal line in the first two squares
- **AND** the second turns the second square's line vertical and draws a
  vertical line in the third, as one step of Undo

#### Scenario: The cursor is against the edge

- **WHEN** the cursor is on an empty square in the rightmost column and Right
  is pressed with Ctrl
- **THEN** the cursor stays and that one square takes a horizontal line

### Requirement: Hint: A Sticks hint names the clue a tentative line would break, and how

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

### Requirement: Hint: A Sticks hint concludes in the necessity voice and names a clue by its number

The explanation SHALL state its conclusion in the necessity voice of a
deductive game, and SHALL refer to a clue by the number the player can see.

#### Scenario: The conclusion says what the square must be

- **WHEN** a step forces a square that carries the number 2 to be vertical
- **THEN** its explanation says that this 2 must be vertical

### Requirement: Hint: A Sticks hint's marks count out against the words

Where the explanation states a count (a run's length, the room a line has
left, the lines or open sides a block's clue has) the marked squares SHALL
number what the explanation says, so the player can count the picture against
the words. Where the explanation names a run or a span, that run or span SHALL
be the one the deduction actually walked.

#### Scenario: The forced orientation is visible, not merely described

- **WHEN** a hint step is displayed
- **THEN** the forced square shows a line of the forced orientation in the hint
  color, and no square shows a line in the placed-line color that the player
  did not place

#### Scenario: A length argument marks the run it counts

- **WHEN** a step says a line would run a number's line to 3 squares
- **THEN** exactly the 3 squares of that run are marked as evidence

### Requirement: Hint: Sticks calls the cell a block

The game's words (its hint, its help page and its Custom dialog) SHALL call the
cell a block, never a black cell.

#### Scenario: The hint names a block by its number

- **WHEN** a step reasons from a block carrying the number 2
- **THEN** its explanation calls it the 2 block

### Requirement: Hint: Sticks' hint stops where the solver does

On an Unreasonable board as on any other, the steps of Sticks' hint SHALL be
the squares in which a line one way would break a clue at once.

#### Scenario: The hint stops, and goes on from a line tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** with a line placed as the solution has it wherever the hint stops,
  the hint finishes the board

### Requirement: Hint: The Sticks hint takes the first forced square in reading order

`hint` SHALL decide the first blank square in reading order in which a line
one way would break a clue, trying a horizontal line before a vertical one,
and SHALL carry on in the same journey with every later square the same clue
and rule force on that board. Where the tentative line breaks several clues, the step SHALL
give the first of: a block with more lines than its number, a line longer than
its number, a line over two numbers, a block left too few open sides, a line
with too little room.

#### Scenario: A dealt board's first steps

- **WHEN** a hint is asked for on the 5×5 board `3bB1b5c2aB3c2a2_2aB2b1` with
  no line placed
- **THEN** the first step makes the top-left square, the 3, horizontal, since a
  vertical line there would leave it only 2 squares
- **AND** the next journey makes the second and third squares of the top row
  horizontal, both by that 3, which rules out neither until its own line is
  placed, and the journey after it reasons from the 1 block

#### Scenario: A line that would break a block's number and a line's length

- **WHEN** a horizontal line in a square would give a 1 block its second line
  and also run a 2's line to 3 squares
- **THEN** the step speaks of the block

### Requirement: Look: No two roles on the Sticks board share a color

No two roles on the board SHALL share a color: the hint SHALL take the
collection's hint color and the keyboard cursor SHALL take the collection's
cursor color, which the board has not otherwise spent.

#### Scenario: The cursor is told from the hint

- **WHEN** the keyboard cursor sits on a square while a hint step is displayed
- **THEN** the cursor's frame and the hint's forced line are different colors

### Requirement: Look: Sticks draws its cells on the collection's quiet surface

`redraw` SHALL draw an open cell as the collection's cell surface, with the
collection's surface grid line between cells and a frame round the grid no
heavier than that line. A number on an open cell SHALL be drawn in ink.

#### Scenario: The grid recedes behind the lines

- **WHEN** a board with a line drawn in it is painted
- **THEN** the line between two open cells is the surface's grid line
- **AND** the player's line is drawn in its own color over the cell surface

### Requirement: Look: A Sticks block is a solid mass in the wall color

A block SHALL be a solid fill in the collection's wall color, over its whole
tile, so that adjacent blocks read as one mass, with its number in a white that
is the same in both schemes. The hint's evidence ring on a block SHALL carry a
line in the number's white inside it, so the ring is told from the block in both
schemes.

#### Scenario: Adjacent blocks are one mass

- **WHEN** two blocks are adjacent
- **THEN** no grid line is drawn between them

### Requirement: Look: A player's line is drawn in the placed-piece color

A line the player draws SHALL be drawn at its own weight in the collection's
color for a placed piece, the theme pair's first member: it is the content, and
the grid is not.

#### Scenario: A placed line is a bar in the piece's color

- **WHEN** a cell holding a horizontal line is painted
- **THEN** a horizontal bar in the placed-piece color crosses the cell surface
