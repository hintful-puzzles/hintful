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

### Requirement: Params: A Sticks params string may leave out its blocks, its symmetry and its difficulty

Sticks' params (a size, a percentage of blocks, their symmetry and a tier),
their bounds, encoding and label words SHALL be those its description
declares (`described-fill-game`), and its menu its description's boards.
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

### Requirement: Params: Sticks refuses a block share outside 5 to 100, and, for a deal only, a quarter-turn symmetry off a square

Sticks SHALL refuse a block percentage outside 5 to 100 wherever it is
written, and, on a full parameter check only, 4-way rotational symmetry on a
grid that is not square. No game ID upstream writes carries a percentage.

#### Scenario: A short check admits a quarter turn off a square

- **WHEN** `5x6b20s4` is checked without the full flag, and then with it
- **THEN** the first is accepted and the second refused, as the grid must be
  square

#### Scenario: Too few blocks

- **WHEN** `7x7b4s0de` is checked
- **THEN** it is refused: the percentage must be at least 5

### Requirement: Params: Sticks deals Unreasonable only on a board of five squares or more

The description SHALL bound Unreasonable to an area of at least 5, so a 2×2
is refused at Unreasonable when a board is to be dealt and a 2×3 is not; a
2×2 board with one fill is one the ladder finishes.

#### Scenario: A 2×2 board is not dealt at Unreasonable

- **WHEN** a 2×2 board is asked for at Unreasonable
- **THEN** it is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×2 board is still dealt at Easy, and a 2×3 board is dealt at
  Unreasonable

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

A board SHALL be dealt by the fill engine from the description
(`described-fill-game`): blocks first at the share and symmetry asked for,
then on each other square a line across or down, at even odds; one number
on a random square of each line, and one on each block. The numbers SHALL be hidden in one random
order, each kept hidden only while the ladder still finishes the board.

#### Scenario: A clue the solver needs is put back

- **WHEN** an Easy board is stripped, and taking a clue out leaves a board the
  solver does not complete
- **THEN** that clue is put back, and the strip goes on to the next

### Requirement: Generation: An Unreasonable Sticks board has one answer that the solver does not reach

At Unreasonable every draw SHALL strip from every number, each kept hidden
only while the search still proves one fill, and the board SHALL be kept
only where the ladder does not finish it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 2×3 to 7×7
- **THEN** each opens, entered with no difficulty letter, as Unreasonable
- **AND** Solve finishes each

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 2×3 board, a 3×3 board and a 7×7 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Generation: A Sticks board is Easy where the solver and the hint both finish it

A board SHALL count as Easy where the solver and the hint finish it, and as
Unreasonable where it has exactly one fill that they do not reach.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one fill the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4b20s2du`

### Requirement: Solver: Sticks' solver works by contradiction on single cells and never backtracks

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

### Requirement: Solver: Sticks' ladder reads a number's room as the cells its line could still take

A number's room SHALL be the run through it, along its line's way, of the cells that are no block, hold no line the other way, and with a line that way would carry no number but its own; the length clue's meaning SHALL read room the same way, so the live error marks read it on the board as it stands.

#### Scenario: A line beside another number's line is no room

- **WHEN** a 3 has a horizontal line, and the blank square beside it has, beyond it, a horizontal line carrying a 1
- **THEN** that blank square is not counted as the 3's room

### Requirement: Controls: Sticks is played by drag, click and keyboard cursor

Sticks SHALL be played by dragging to draw a line, clicking to place a line, or
using a keyboard cursor with keys to place or clear a line.

#### Scenario: A left click on an empty cell places a vertical line

- **WHEN** an empty cell is left-clicked three times
- **THEN** it holds a vertical line, then a horizontal line, then nothing

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

### Requirement: Controls: A Sticks drag draws along the row or column it moves in

A drag SHALL draw, from the square it began on along the row or column it
moves in, a line that way in each square it reaches; a drag started on a
line that way SHALL clear them instead.

#### Scenario: Dragging draws a line, and clears it

- **WHEN** the pointer is dragged across two empty squares of a row, and then
  the same drag is made again
- **THEN** the first draws a horizontal line in both, and the second clears
  them

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

### Requirement: Hint: Sticks' rules are taken in order

The rules a supposed line breaks SHALL be taken in this order: a block with more lines than its number, a line over two numbers, a line longer than its number, a block left too few open sides, a line with too little room.

#### Scenario: A line that would join two numbers

- **WHEN** a line in a square would join a 2's line to a 1's, which is also too long for each
- **THEN** the step speaks of the two numbers joined

### Requirement: Hint: Sticks draws a hint's evidence with the fill engine's marks

A step SHALL ring the square it decides and draw its evidence with the fill
engine's hint marks (`described-fill-game`): the number or block the step is
about outlined apart, in the color of the words that name it, and the
squares its reason rests on outlined, as many as the words count.

#### Scenario: The 0 block

- **WHEN** a step makes the square beside a 0 block vertical
- **THEN** the 0 block is ringed apart, and the square is ringed as the one
  the step decides

### Requirement: Hint: The Sticks hint carries on from its last step, then column by column

The hint SHALL take, of the firings the ladder could make, the one that
carries on from the squares its last step read and decided, and otherwise
the first in the ladder's order: the squares column by column from the left,
each column from the top.

#### Scenario: A dealt board's first steps

- **WHEN** a hint is asked for on the 5×5 board `3bB1b5c2aB3c2a2_2aB2b1` with
  no line placed
- **THEN** the first step makes the top-left square, the 3, horizontal, since
  a vertical line there would leave it too little room
- **AND** the next two make the second and third squares of the top row
  horizontal, both by that 3, and the step after them reasons from the 1
  block

### Requirement: Status bar: The Sticks status bar counts the block numbers left

The status bar SHALL read `Clues left: {n}`, counting the shown block
numbers not yet met with every side decided, and SHALL be empty once none is
left. A line's number is never counted.

#### Scenario: A board as dealt, and solved

- **WHEN** the 7×7 board `c5b2a2aB1a6a2_4dBB_3B2aB1aBB0e2cB2d2_3c4`, with
  five numbered blocks, is opened, and then solved
- **THEN** the status bar reads "Clues left: 5", and then is empty

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

### Requirement: Look: Sticks draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each number the board breaks (`Game.rules`): a number on a line
longer than it, on a line carrying another number, or on a line whose room
is shorter than it; and, as a badge, a number on a block with more lines run
into it than it counts, or fewer sides left that a line could still run in
from.

#### Scenario: A line walled in short of its number

- **WHEN** a 3 is given a line across, with a block two squares to one side
  and a numbered square beside it on the other
- **THEN** the 3 is drawn red while the square between it and the block is
  still open
