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
percentage, symmetry and difficulty, Easy as `de` or Unreasonable as `du`, and
SHALL round-trip through decode. The short encoding SHALL be the bare
`width x height`. A bare `width x height` ID SHALL decode without a symmetry
marker, and an ID with no difficulty letter SHALL decode as Easy.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded in full and decoded
- **THEN** the same width, height, block percentage, symmetry and difficulty
  are recovered

#### Scenario: A bare size decodes

- **WHEN** `10x10` is decoded
- **THEN** the parameters have width 10 and height 10

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 7×7 board is encoded
- **THEN** the full encoding is `7x7b20s2du` and the shared one `7x7`
- **AND** `7x7b20s2`, written before the game had tiers, decodes as Easy

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
unique completion; it SHALL then remove clues in a randomized order. At Easy
it SHALL keep each removal only while the solver still completes the board.
Generation from a given seed SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

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

`findMistakes` SHALL take the board's one fill from the search that counts
its answers, at either difficulty, and flag every cell whose player-drawn line
contradicts it; a merely missing line SHALL NOT be flagged. Where the search
did not prove exactly one fill it SHALL flag nothing.

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

### Requirement: Every Easy Sticks board has one solution, reached without guessing

Every board generated at Easy SHALL have exactly one solution, and the shipped
deduction SHALL reach it with no guessing anywhere.

#### Scenario: A generated board has exactly one solution

- **WHEN** a board generated at Easy is enumerated by a search that propagates
  the shipped deduction and branches on the cells it leaves undecided
- **THEN** exactly one solution is found

### Requirement: Sticks counts a board's answers by a bounded search

The game SHALL count a board's fills up to two by trial and error over the
solver: where the solver stops, it SHALL take the first blank square and
assume its line runs across, and then up and down. It SHALL report one
answer, several, none, or that it stopped at its budget, which SHALL be
counted in positions and never in time. Solve SHALL take the answer from it
at either difficulty.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 4×4 board the solver finishes, on one with
  one fill that it does not reach, on one with no block and no number, and on
  one whose corner square holds a 4 with a 1 beside it and a 1 below it
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given four positions on a board that needs five
- **THEN** it reports that it stopped, and with five it reports one answer

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 4×4, the same with numbers taken away and
  the same with one number changed are each counted by laying every white
  square each way and reading the finished board against its numbers
- **THEN** the search reports one answer exactly where one fill fits, several
  where more do and none where none does

### Requirement: An Unreasonable Sticks board has one answer that the solver does not reach

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

### Requirement: Sticks refuses Unreasonable where no board needs it

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

### Requirement: Unreasonable Sticks is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 100 squares or longer than 30 on a side, with a reason
naming the difficulty. The same size SHALL still be asked for at Easy.

#### Scenario: A size past the bound is refused at Unreasonable only

- **WHEN** an 11×11 board and a 2×40 board are checked for dealing at each
  difficulty
- **THEN** each is refused at Unreasonable and not at Easy
- **AND** a 10×10, a 4×25 and a 2×30 board are admitted at Unreasonable

### Requirement: Sticks' menu offers each size at both difficulties

Sticks' presets SHALL offer each of 5×5, 7×7 and 10×10 as Easy and as
Unreasonable, and the default SHALL be the Easy 7×7.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Sticks' preset menu is read
- **THEN** its three sizes each appear as Easy and then as Unreasonable

### Requirement: A pasted Sticks board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one fill that they
do not reach, whatever lower difficulty its ID states. A board with several
fills SHALL be refused as having more than one solution, and a board with
none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one fill the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4b20s2du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 4×4 board with no block and no number, and one whose corner
  square holds a 4 with a 1 beside it and a 1 below it, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Sticks' hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the squares its deduction forces from the player's lines and no others,
and where none is forced it SHALL refuse with the collection's sentence that
deduction has run out. It SHALL go on from the lines the player then places.

#### Scenario: The hint stops, and goes on from a line tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a line placed wrongly there is reported by the mistake check
- **AND** with a line placed as the solution has it wherever the hint stops,
  the hint finishes the board
