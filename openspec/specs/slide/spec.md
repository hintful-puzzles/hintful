# slide Specification

## Purpose
Slide, the sliding-block puzzle of moving blocks until the key block reaches the
exit, with a shortest-path solver, a board that reads by color and not by bevel
alone, and full play from the keyboard.

## Requirements

### Requirement: Slide game implements the Game interface

The engine SHALL provide `src/games/slide/` implementing the `Game` interface
for Slide (Klotski), registered so the engine serves the puzzle. Parameters
SHALL be a width, a height, and a solution-length limit (`maxmoves`, where a
negative value means no limit). A game ID SHALL encode the width, height and
limit and round-trip through decode.

#### Scenario: Every preset produces a soluble board

- **WHEN** a new game is generated for any preset or legal size
- **THEN** a board is produced whose main block can be slid to the target within
  the recorded minimum number of moves

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and solution-length limit are recovered

### Requirement: Slide bounds its width, its height and its limit

Slide SHALL declare on its `paramConfig` items a width of at least 5 and at most
251 and a height of at least 4, so the engine refuses a size outside them.
`validateParams` SHALL reject a solution-length limit of zero, which asks for a
board that starts finished and which the generator provably cannot satisfy.

#### Scenario: A limit of zero is refused

- **WHEN** parameters with a solution-length limit of zero are validated
- **THEN** they are rejected with a message the custom-parameters dialog can show
- **AND** a limit of one and a negative limit are both accepted

#### Scenario: A width below the bound is refused

- **WHEN** a board four squares wide is validated
- **THEN** it is refused with a message naming the width

### Requirement: A Slide board too large to generate is rejected

`validateParams` SHALL reject a board whose cell count exceeds a documented
bound, because generation runs an exhaustive breadth-first search whose memory
grows explosively with board area and, past the bound, exhausts the heap rather
than merely running slowly. The bound SHALL be at least as large as the largest
shipped preset, and the measurements that set it SHALL be recorded with it.

#### Scenario: A board too large to generate is rejected with a reason

- **WHEN** parameters whose cell count exceeds the documented bound are validated
- **THEN** they are rejected with a message the custom-parameters dialog can show,
  rather than being accepted and then exhausting memory during generation

### Requirement: Slide declares no findMistakes hook

Slide SHALL declare no `findMistakes` hook, because every reachable board is a
legal state and the puzzle has no notion of a wrong-but-legal position.

#### Scenario: A move away from the exit is not a mistake

- **WHEN** a player slides a block so that the main block is further from the
  target than before
- **THEN** nothing on the board is reported as a mistake

### Requirement: Slide descriptions use the upstream run-length block encoding

A Slide description SHALL encode the board in canonical left-to-right,
top-to-bottom order: each square is an anchor, the main anchor, a
distance-back-link to the previous square of the same block, an empty square, or
a wall, and a forcefield square SHALL carry a prefix marker. A run of identical
squares other than back-links SHALL be read whether written out or abbreviated
with a count. The description SHALL end with the target coordinates, with the
minimum move count optional after them.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

#### Scenario: A description without the minimum move count loads

- **WHEN** a description that ends at its target coordinates is validated
- **THEN** it is accepted

### Requirement: A malformed Slide description is rejected

Validation SHALL reject a description that carries more or fewer squares than
the board holds, that names other than exactly one main piece, that contains an
out-of-range or dangling distance back-reference, that uses an unknown
character, or that omits the target coordinates. Too many squares SHALL be
refused as too long. Too few SHALL be refused as too short where the text ends
early, and otherwise at the character standing where a square should be.

#### Scenario: A description with the wrong number of squares is rejected

- **WHEN** a description carrying more or fewer squares than the board has cells
  is validated
- **THEN** it is rejected, and the message for too many is not the message for
  too few

#### Scenario: A description with no main piece is rejected

- **WHEN** a description whose squares hold no main anchor, or two, is validated
- **THEN** it is rejected with a message saying which

### Requirement: A Slide block is moved by grab, drag and release

Slide SHALL be played by grabbing a block, dragging it, and releasing it. On a
grab, the game SHALL compute the set of cells the block can reach; during the
drag, it SHALL snap the block to the nearest reachable cell to the pointer; on
release, it SHALL move the block there, or do nothing if the block did not move.

#### Scenario: Dragging a block to a reachable space moves it

- **WHEN** a block is grabbed and released over a cell it can reach
- **THEN** the block moves to that cell and, unless it is the same block moved
  again, the move count increases by one

#### Scenario: Releasing a block where it started does nothing

- **WHEN** a block is grabbed and released without having moved
- **THEN** the board and the move count are unchanged

### Requirement: Only the main block passes a forcefield cell

Only the main block SHALL be permitted to pass a forcefield cell.

#### Scenario: An ordinary block cannot be dragged into the gate

- **WHEN** an ordinary block beside an empty forcefield cell is grabbed and
  dragged toward it
- **THEN** the forcefield cell is not among the cells the block can reach, and
  the block does not enter it

### Requirement: A multi-step slide of one block counts as one move

Moving the same block again SHALL NOT increment the displayed move count, and
returning a block to where it started SHALL decrement it, so that a multi-step
slide of one block counts as a single move. The count SHALL behave identically
for a keyboard move and a drag.

#### Scenario: Sliding a block back takes its move off again

- **WHEN** a block is moved, moved again to a third cell, and then moved back to
  the cell it first started from
- **THEN** the count rises by one at the first move, stays there at the second,
  and falls back by one at the third

### Requirement: Solve plays a shortest route from the current position

Solve SHALL play a shortest route from the current position to the exit, not
from the board as dealt, so the board is finished, as Solve finishes every
game's board.

#### Scenario: Solve after the player has moved

- **WHEN** Solve is requested after the player has moved several blocks
- **THEN** the route played is legal from the board as it stands, and it ends
  with the main block on the target

### Requirement: Bringing the main block to the target completes the board

Slide SHALL report the game solved when the main block is on the target
position, and SHALL flash on completion.

#### Scenario: Bringing the main block to the target wins

- **WHEN** the main block is slid onto the target position
- **THEN** the game is reported solved and flashes

### Requirement: Slide draws a held block where it would land, with no slide animation

Rendering SHALL draw each block with beveled highlights. A held block SHALL be
drawn lit up at its snapped destination, the cell it would land on if released,
and at no position between cells. There SHALL be no interpolated sliding
animation: a block released goes straight to its cell.

#### Scenario: A dragged block is drawn at its snapped cell

- **WHEN** a block is dragged and the pointer is between two cells
- **THEN** the block is drawn lit up at the nearest cell it can reach, and the
  squares it has left are drawn empty

### Requirement: Slide's solver finds a shortest path by breadth-first search

Slide SHALL provide a solver that finds the minimum number of moves to bring the
main block to the target, or reports that no solution exists. It SHALL be a
breadth-first search over canonical board layouts, deduplicating already-seen
layouts by exact board equality and expanding them in first-in-first-out order,
so that the first path found to the target is a shortest one.

#### Scenario: The solver returns the shortest solution

- **WHEN** a soluble board is solved
- **THEN** the reported move count equals the length of a shortest sequence that
  brings the main block to the target, and the returned moves realize it

### Requirement: Slide's solver respects a move limit

The solver SHALL respect a move limit by abandoning the search once every
remaining candidate exceeds it, and SHALL then report that no solution exists
within the limit.

#### Scenario: A board whose shortest solution is longer than the limit

- **WHEN** a board is solved under a limit smaller than its minimum move count
- **THEN** the solver reports no solution

### Requirement: Slide's solver does not depend on an ordered collection

The solver SHALL NOT depend on the semantics of an ordered collection. Its
result SHALL depend only on the breadth-first order and on exact layout
deduplication.

#### Scenario: The visited layouts are a set, not a sorted collection

- **WHEN** the solver asks whether a layout has been seen
- **THEN** the answer depends only on whether an identical board was seen, and
  no ordering among the seen boards is read

### Requirement: Slide's generator keeps every board soluble

The generator SHALL use the solver to keep every board soluble: it SHALL remove
singleton blocks until the board becomes soluble, then attempt to merge adjacent
blocks in a randomized order, keeping a merge only while the board stays
soluble. Generation from a given seed SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description and minimum move
  count

### Requirement: The generator tests solubility after its final singleton removal

The generator SHALL test solubility after its final singleton removal as well as
before each one, because a board can become soluble only once its last singleton
goes. The added check SHALL draw no randomness.

#### Scenario: A board at the smallest legal size is generated

- **WHEN** a board is generated at the smallest legal size, where the main block
  is freed only by removing every singleton
- **THEN** a soluble board is produced, and generation does not fail

### Requirement: Slide presets draw tall, and a Slide board is never turned

Slide SHALL offer its default and presets at 6×7 (limits 40 and 25, and no
limit) and 6×8 (no limit), which draw taller than wide. Slide SHALL NOT declare
`transposeParams`: the key block starts in the top-left corner and leaves by a
gate in the right-hand wall, so a board turned on its side is a different
puzzle.

#### Scenario: A Slide board is dealt as chosen

- **WHEN** a Slide board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen

### Requirement: Slide's board reads by color, not by bevel alone

The floor, the walls, the ordinary blocks and the main block SHALL be
distinguishable from one another by fill, not solely by their bevels, in both
the light and the dark presentation.

#### Scenario: The pieces are told apart without relying on bevels

- **WHEN** the board is rendered in either color scheme
- **THEN** floor, wall, ordinary block and main block each read as a distinct
  fill, and the target marker remains the most prominent

### Requirement: Slide's fills are functions of the host background

Each of the floor, wall, ordinary-block and main-block fills SHALL be a function
of the host background rather than an authored color, so that one inversion rule
maps all four and their ordering survives the scheme flip by construction.

#### Scenario: The ladder inverts as a whole

- **WHEN** the board is rendered under the opposite color scheme
- **THEN** the four fills keep their order relative to one another, reversed
  along with the board itself, rather than any one of them changing its place

### Requirement: Only the key block and the exit carry a hue

Only the two things the help page names to the player, the blue key block and
the green exit, SHALL carry a hue. The other fills SHALL stay neutral so they
cannot compete with them.

#### Scenario: The floor, wall and ordinary block are neutral

- **WHEN** the board is rendered in either color scheme
- **THEN** the key block reads blue and the exit area green, and the floor, the
  wall and an ordinary block carry no hue of their own

### Requirement: The target marker is the most prominent thing on the board

The target marker SHALL remain the most prominent thing on the board, since it
names the goal. Its paleness SHALL be judged relative to the scheme and is not
the testable part: a tint lighter than the board under a light scheme is darker
than it under a dark one, and that relationship is the one preserved, not a
defect.

#### Scenario: The target under the dark scheme

- **WHEN** the board is rendered under the dark scheme
- **THEN** the target marker is still the most prominent thing on the board,
  though its tint is darker than the board where under the light scheme it is
  lighter

### Requirement: The exit gate is marked along its boundary

The exit marking SHALL be legible at the smallest shipped tile size, and SHALL
mark the gate's boundary rather than filling its squares, because the gate
usually lies on top of the exit area and two fills cannot both be seen.

#### Scenario: The exit gate is marked without hiding the exit

- **WHEN** a gate square also lies inside the exit area
- **THEN** the exit's tint is still drawn across that square, and the gate is
  marked only along the edges where it meets something that is not the gate

### Requirement: Slide's colors come from the shared palette and are checked in both schemes

Every color SHALL come from the shared palette, and SHALL be checked in both
schemes: a fill that reads as contrast against a light background SHALL NOT read
as a bright patch against a dark one.

#### Scenario: A fill is judged against the dark board too

- **WHEN** a fill is chosen because it contrasts with the light board
- **THEN** it is also looked at on the dark board, and it is not kept if it
  reads there as a bright patch

### Requirement: Slide plays from the keyboard alone

Slide SHALL be playable by keyboard as well as by pointer, both driving the same
move machinery. A keyboard that cannot express a legal move is the defect this
requirement removes: every move the pointer can make SHALL be reachable from the
keyboard.

#### Scenario: A board can be completed without a pointer

- **WHEN** a player uses only the keyboard from a fresh board
- **THEN** every move the pointer can make is reachable, and the board can be
  driven to completion

### Requirement: A cell cursor moves over the Slide board

A cell cursor SHALL move over the board with the cursor keys, clamped to the
grid. It SHALL be hidden until the first cursor key or select key, and hidden
again by any pointer press.

#### Scenario: A cursor key at the edge of the grid

- **WHEN** the cursor is on the leftmost column and the left cursor key is
  pressed
- **THEN** the cursor stays on the leftmost column

### Requirement: The keyboard select grabs with the pointer's grab

Selecting on a cell belonging to a block SHALL grab that block, computing the
same reachable set the pointer grab computes. There SHALL be one grab
implementation, reached from both the pointer press and the keyboard select.
While a block is grabbed, selecting again SHALL commit the move, and canceling
SHALL restore the block to where it started.

#### Scenario: Canceling a selection restores the block

- **WHEN** a block has been walked several cells and the player cancels instead
  of committing
- **THEN** the block returns to where it started and no move is recorded
- **AND** the cursor returns with it, to the square the block was picked up by

### Requirement: A held block moves one cell per press

While a block is grabbed, the cursor keys SHALL move it one cell per press
within its reachable set and SHALL refuse a step that would leave the set. A
press SHALL NOT slide the block as far as the set allows: a slide-to-the-end
cursor cannot stop inside a corridor, so it could not reach every cell the drag
can reach.

#### Scenario: A keyboard move out of the reachable set is refused

- **WHEN** a block is selected and a cursor key would move it to a cell outside
  its reachable set
- **THEN** nothing moves, no move is recorded, and the selection is retained

### Requirement: A keyboard journey produces the one move its drag produces

A keyboard journey of several cells SHALL produce one move, identical to the
move the equivalent drag produces. The keyboard SHALL be a second way to drive
the existing move construction, and SHALL NOT be a second movement model. A
multi-step keyboard journey SHALL count as a single move exactly as the
equivalent drag does.

#### Scenario: A keyboard journey and the equivalent drag produce the same move

- **WHEN** a player selects a block with the keyboard, walks it several cells
  within its reachable set, and commits
- **THEN** the resulting board state and move count are identical to those
  produced by dragging the same block to the same cell

### Requirement: A pointer press takes the board over

A pointer press SHALL take the board over: it SHALL hide the cursor, and where
it grabs no block it SHALL also put down anything the keyboard was holding, so a
grab cannot survive under a pointer and be flung at it by the next drag.

#### Scenario: A pointer press puts down what the keyboard was holding

- **WHEN** a block is grabbed from the keyboard and the player then presses a
  pointer on a cell holding no block
- **THEN** the grab is dropped and the cursor is hidden, so the next pointer drag
  moves nothing

### Requirement: A grab is dropped when the board changes under it

A grab SHALL be dropped whenever the board changes underneath it, however it was
made, because its reachable set was computed against the board being replaced,
so no frame is ever asked to preview a block against a board it no longer fits.
The cursor SHALL survive that, being a position on a grid whose size has not
changed; losing it would read as a dropped keypress.

#### Scenario: A grab dropped by an undo leaves the cursor in place

- **WHEN** the board changes under a keyboard grab
- **THEN** the grab is dropped, because its reachable set is stale
- **AND** the cursor stays where the player left it

#### Scenario: An undo made while the pointer is still down

- **WHEN** a block is being dragged and an undo is made before the pointer is
  released
- **THEN** the drag is canceled, and the undone board is drawn with no block held

### Requirement: Slide shows the keyboard cursor and the grabbed block

Rendering SHALL show the keyboard cursor and the grabbed block, in both color
schemes and at the smallest shipped tile size. The grabbed block SHALL be drawn
exactly as the pointer drag draws it, since there is one grab. The cursor SHALL
be the mark that distinguishes keyboard play, SHALL ride the grabbed block on
the square it was picked up by, and SHALL sit beside the board's content rather
than over it.

#### Scenario: A block walked from the keyboard

- **WHEN** a block is grabbed with the keyboard by one of its squares and walked
  a cell
- **THEN** the block is drawn as a dragged block is, and the cursor is drawn on
  the same square of the block it was picked up by

### Requirement: The cursor's color is chosen against every material it can land on

The cursor's color SHALL be chosen against the span of materials it can land on,
not against one of them: the board's own contrast ladder runs from the key block
to the exit area, and that ladder inverts between color schemes, so a color
prominent in one scheme is not thereby prominent in the other.

#### Scenario: The cursor on the key block and on the exit

- **WHEN** the cursor sits on the key block, and then on the exit area, in
  either color scheme
- **THEN** it reads against both
