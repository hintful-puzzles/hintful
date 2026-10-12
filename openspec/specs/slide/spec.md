# slide Specification

## Purpose
Slide, the sliding-block puzzle of moving blocks until the key block reaches the
exit: its params and description format, how a block is grabbed and moved by
pointer and by keyboard, what its solver and generator promise, and how its
board is colored.

## Requirements

### Requirement: Rules: Only the main block passes a forcefield cell

Only the main block SHALL be permitted to pass a forcefield cell.

#### Scenario: An ordinary block cannot be dragged into the gate

- **WHEN** an ordinary block beside an empty forcefield cell is grabbed and
  dragged toward it
- **THEN** the forcefield cell is not among the cells the block can reach, and
  the block does not enter it

### Requirement: Rules: A multi-step slide of one block counts as one move

Moving the same block again SHALL NOT increment the displayed move count, and
returning a block to where it started SHALL decrement it, so that a multi-step
slide of one block counts as a single move. The count SHALL behave identically
for a keyboard move and a drag.

#### Scenario: Sliding a block back takes its move off again

- **WHEN** a block is moved, moved again to a third cell, and then moved back to
  the cell it first started from
- **THEN** the count rises by one at the first move, stays there at the second,
  and falls back by one at the third

### Requirement: Rules: Bringing the main block to the target completes the board

Slide SHALL report the game solved when the main block is on the target
position.

#### Scenario: Bringing the main block to the target wins

- **WHEN** the main block is slid onto the target position
- **THEN** the game is reported solved

### Requirement: Params: Slide's params are a width, a height and a solution-length limit

Slide's parameters SHALL be a width, a height, and a solution-length limit
(`maxmoves`, where a negative value means no limit). A game ID SHALL encode the
width, height and limit and round-trip through decode.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and solution-length limit are recovered

### Requirement: Params: A solution-length limit of zero is refused

`validateParams` SHALL reject a solution-length limit of zero, which asks for a
board that starts finished and which the generator provably cannot satisfy.

#### Scenario: A limit of zero is refused

- **WHEN** parameters with a solution-length limit of zero are validated
- **THEN** they are rejected with a message the custom-parameters dialog can show
- **AND** a limit of one and a negative limit are both accepted

### Requirement: Params: A Slide board too large to generate is rejected

`validateParams` SHALL reject a board whose cell count exceeds a documented
bound, because generation runs an exhaustive breadth-first search whose memory
grows explosively with board area and, past the bound, exhausts the heap rather
than merely running slowly. The measurements that set the bound SHALL be
recorded with it.

#### Scenario: A board too large to generate is rejected with a reason

- **WHEN** parameters whose cell count exceeds the documented bound are validated
- **THEN** they are rejected with a message the custom-parameters dialog can show,
  rather than being accepted and then exhausting memory during generation

### Requirement: Params: Slide's params write the limit as m and a number, or u

`encodeParams` SHALL write `{w}x{h}` and then `m{n}` for a solution-length
limit of `n`, or `u` for no limit, the same in the short form and the full.
`decodeParams` SHALL read a bare number as a square board, and a string with
neither `m` nor `u` as the default limit of 40.

#### Scenario: The two preset forms

- **WHEN** `6x7m25` and `6x7u` are decoded
- **THEN** the first is a 6 by 7 board with a limit of 25, and the second the
  same board with no limit

#### Scenario: A string that names no limit

- **WHEN** `7x6` is decoded
- **THEN** the board is 7 by 6 with a limit of 40
- **AND** `6u` is a 6 by 6 board with no limit

### Requirement: Params: Slide's size limits hold for a board that arrives with its description

A width below 5 or above 251 and a height below 4 SHALL be refused as the
bounds of the Custom dialog's fields. `validateParams` SHALL refuse a board of
more than 48 squares whatever `full` says. Each limit therefore holds whether
the board is to be dealt or arrives with its description.

#### Scenario: A 7 by 7 board is refused with its description in hand

- **WHEN** a game ID opens with `7x7m25`, which is `6x7m25` one column wider,
  and carries a description
- **THEN** it is refused with "Width times height must be at most 48; the
  solver runs out of memory beyond that."
- **AND** `6x7m25` with its width written `4` is refused with "Width must be
  at least 5."

### Requirement: Params: A Slide board's name gives the limit on its shortest solution

A board's name SHALL give its size and then `max {n} moves` for a
solution-length limit of `n`, or `no move limit`. The limit is on the
shortest solution the board was dealt with and SHALL NOT bound the player,
whose move count may pass it.

#### Scenario: A player takes more moves than the name gives

- **WHEN** a player on the board named "6x7, max 25 moves" makes a 26th
  counted move without bringing the key block out
- **THEN** the move is made and the status bar reads "Moves: 26 (min 25)"

### Requirement: Description: Slide descriptions use the upstream run-length block encoding

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

### Requirement: Description: A malformed Slide description is rejected

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

### Requirement: Description: Slide descriptions spell each square with a letter

A description SHALL write a square as `a` (a block's first square), `m` (the
main block's first), `e` (empty), `w` (wall), or `d` and the distance back to
the previous square of the same block. A run of one letter other than `d` MAY
be written as the letter and a count of at least 2, and `f` before such a
letter makes its squares forcefield. After the squares come `,tx,ty`, the
square the main block's first square must reach, and optionally `,` and the
minimum move count.

#### Scenario: A dealt 6 by 7 board

- **WHEN** `w7md1a2w2d5d1a2w2a4w2d6ad6efewd6d6aefew6,4,4,25` is loaded on a
  6 by 7 board
- **THEN** the top row and the first square of the second are wall, and the
  main block is the 2 by 2 whose corner is the second square of the second
  row: `m`, `d1`, and on the row below `d5` and `d1`
- **AND** the two `fe` squares, in the right-hand wall of the fifth and sixth
  rows, are the gate; the main block's corner must reach column 4 of row 4,
  counting from 0; and the shortest solution takes 25 moves

### Requirement: Description: Slide refuses a count below 2, a forcefield block square and a target off the board

`newState` SHALL refuse a description in which a letter is followed by a count
of 0 or 1, in which `f` comes before `d`, in which a target coordinate is not
a column or row of the board, or in which anything follows the minimum move
count.

#### Scenario: A count of one

- **WHEN** the description of the dealt 6 by 7 board is loaded with its
  first `efew` written `efew1`
- **THEN** it is refused as holding a number out of range for its board

#### Scenario: A target outside the board

- **WHEN** the same description is loaded with its `,4,4,25` written
  `,6,4,25`
- **THEN** it is refused as holding a number out of range for its board

### Requirement: Generation: Slide's generator keeps every board soluble

The generator SHALL use the solver to keep every board soluble: it SHALL remove
singleton blocks until the board becomes soluble, then attempt to merge
adjacent blocks in a randomized order, keeping a merge only while the board
stays soluble.

#### Scenario: Every generated board is soluble

- **WHEN** a new game is generated for any preset or legal size
- **THEN** a board is produced whose main block can be slid to the target within
  the recorded minimum number of moves

### Requirement: Solver: Solve plays a shortest route from the current position

Solve SHALL play a shortest route from the current position to the exit, not
from the board as dealt, so the board is finished, as Solve finishes every
game's board.

#### Scenario: Solve after the player has moved

- **WHEN** Solve is requested after the player has moved several blocks
- **THEN** the route played is legal from the board as it stands, and it ends
  with the main block on the target

### Requirement: Solver: Slide's solver finds a shortest solution, within a limit when given one

Slide SHALL provide a solver that finds the minimum number of moves to bring the
main block to the target, or reports that no solution exists. Given a move
limit, it SHALL abandon the search once every remaining candidate exceeds it,
and SHALL then report that no solution exists within the limit.

#### Scenario: The solver returns the shortest solution

- **WHEN** a soluble board is solved
- **THEN** the reported move count equals the length of a shortest sequence that
  brings the main block to the target, and the returned moves realize it

#### Scenario: A board whose shortest solution is longer than the limit

- **WHEN** a board is solved under a limit smaller than its minimum move count
- **THEN** the solver reports no solution

### Requirement: Controls: A Slide block is moved by grab, drag and release

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

### Requirement: Controls: Slide plays from the keyboard alone

Slide SHALL be playable by keyboard as well as by pointer, both driving the same
move machinery: every move the pointer can make SHALL be reachable from the
keyboard.

#### Scenario: A board can be completed without a pointer

- **WHEN** a player uses only the keyboard from a fresh board
- **THEN** every move the pointer can make is reachable, and the board can be
  driven to completion

### Requirement: Controls: The keyboard select grabs with the pointer's grab

Selecting SHALL show the cursor, and on a cell belonging to a block SHALL grab
that block, computing the
same reachable set the pointer grab computes. There SHALL be one grab
implementation, reached from both the pointer press and the keyboard select.
While a block is grabbed, selecting again SHALL commit the move, and canceling
SHALL restore the block to where it started.

#### Scenario: Canceling a selection restores the block

- **WHEN** a block has been walked several cells and the player cancels instead
  of committing
- **THEN** the block returns to where it started and no move is recorded
- **AND** the cursor returns with it, to the square the block was picked up by

### Requirement: Controls: A held block moves one cell per press

While a block is grabbed, the cursor keys SHALL move it one cell per press
within its reachable set and SHALL refuse a step that would leave the set. A
press SHALL NOT slide the block as far as the set allows: a slide-to-the-end
cursor cannot stop inside a corridor, so it could not reach every cell the drag
can reach.

#### Scenario: A keyboard move out of the reachable set is refused

- **WHEN** a block is selected and a cursor key would move it to a cell outside
  its reachable set
- **THEN** nothing moves, no move is recorded, and the selection is retained

### Requirement: Controls: A keyboard journey produces the one move its drag produces

A keyboard journey of several cells SHALL produce one move, identical to the
move the equivalent drag produces. The keyboard SHALL be a second way to drive
the existing move construction, and SHALL NOT be a second movement model.

#### Scenario: A keyboard journey and the equivalent drag produce the same move

- **WHEN** a player selects a block with the keyboard, walks it several cells
  within its reachable set, and commits
- **THEN** the resulting board state and move count are identical to those
  produced by dragging the same block to the same cell

### Requirement: Controls: A pointer press takes the board over

A pointer press SHALL take the board over: it SHALL hide the cursor, and where
it grabs no block it SHALL also put down anything the keyboard was holding, so a
grab cannot survive under a pointer and be flung at it by the next drag.

#### Scenario: A pointer press puts down what the keyboard was holding

- **WHEN** a block is grabbed from the keyboard and the player then presses a
  pointer on a cell holding no block
- **THEN** the grab is dropped and the cursor is hidden, so the next pointer drag
  moves nothing

### Requirement: Controls: A grab is dropped when the board changes under it

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

### Requirement: Controls: Either pointer button moves a Slide block

The right button's press, drag and release SHALL do what the left button's
do, so that a touch held still before it drags, which arrives as the right
button, still moves its block.

#### Scenario: A press held before the drag

- **WHEN** a block is pressed with the right button, dragged to a cell it can
  reach and released
- **THEN** the block moves there, as one move, as a left drag moves it

### Requirement: Controls: Escape, Backspace and Delete each cancel in Slide

Escape, Backspace and Delete SHALL each be a cancel key. With a block
grabbed, each SHALL hand it back to where it started, as "The keyboard select
grabs with the pointer's grab" says of canceling. With no block grabbed, each
SHALL hide the keyboard cursor when it shows, and SHALL do nothing when it
does not.

#### Scenario: Backspace with a block held

- **WHEN** a block has been picked up from the keyboard and Backspace is
  pressed
- **THEN** the block is put down where it was picked up and no move is made
- **AND** a second Backspace hides the cursor, and a third does nothing

#### Scenario: Escape after a block is put down

- **WHEN** a block has been moved from the keyboard and put down, and Escape
  is pressed
- **THEN** the cursor is hidden and the block stays where it was put

### Requirement: Status bar: Slide's status bar counts moves beside the minimum

`statusbarText` SHALL read `Moves: {n}`, the displayed move count, followed
by ` (min {m})` where the description carries its minimum move count, and by
nothing where it carries none.

#### Scenario: A dealt board before its first move

- **WHEN** the board `w7md1a2w2d5d1a2w2a4w2d6ad6efewd6d6aefew6,4,4,25` has
  just been loaded
- **THEN** the status bar reads "Moves: 0 (min 25)"
- **AND** the same description without its final `,25` reads "Moves: 0"

### Requirement: Look: Slide draws a held block where it would land, with no slide animation

Rendering SHALL draw each block with beveled highlights. A held block SHALL be
drawn lit up at its snapped destination, the cell it would land on if released,
and at no position between cells. There SHALL be no interpolated sliding
animation: a block released goes straight to its cell.

#### Scenario: A dragged block is drawn at its snapped cell

- **WHEN** a block is dragged and the pointer is between two cells
- **THEN** the block is drawn lit up at the nearest cell it can reach, and the
  squares it has left are drawn empty

### Requirement: Look: Slide's board reads by color, not by bevel alone

The floor, the walls, the ordinary blocks and the main block SHALL be
distinguishable from one another by fill, not solely by their bevels, in both
the light and the dark presentation. Each of the four fills SHALL be a function
of the host background rather than an authored color, so that one inversion rule
maps all four and their ordering survives the scheme flip by construction.

#### Scenario: The pieces are told apart without relying on bevels

- **WHEN** the board is rendered in either color scheme
- **THEN** floor, wall, ordinary block and main block each read as a distinct
  fill, and the target marker remains the most prominent

#### Scenario: The ladder inverts as a whole

- **WHEN** the board is rendered under the opposite color scheme
- **THEN** the four fills keep their order relative to one another, reversed
  along with the board itself, rather than any one of them changing its place

### Requirement: Look: Only the key block and the exit carry a hue

Of the board's fills, only the two things the help page names to the player,
the blue key block and the green exit, SHALL carry a hue. The other fills
SHALL stay neutral so they cannot compete with them. The rule binds fills
alone: a mark laid over the board, the keyboard cursor's corner brackets among
them, keeps its own color.

#### Scenario: The floor, wall and ordinary block are neutral

- **WHEN** the board is rendered in either color scheme
- **THEN** the key block reads blue and the exit area green, and the floor, the
  wall and an ordinary block carry no hue of their own

#### Scenario: The keyboard cursor is red

- **WHEN** the keyboard cursor is shown on a block
- **THEN** its corner brackets are red, and the block under them keeps its
  neutral fill

### Requirement: Look: The target marker is the most prominent thing on the board

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

### Requirement: Look: The exit gate is marked along its boundary

The exit marking SHALL be legible at the smallest shipped tile size, and SHALL
mark the gate's boundary rather than filling its squares, because the gate
usually lies on top of the exit area and two fills cannot both be seen.

#### Scenario: The exit gate is marked without hiding the exit

- **WHEN** a gate square also lies inside the exit area
- **THEN** the exit's tint is still drawn across that square, and the gate is
  marked only along the edges where it meets something that is not the gate

### Requirement: Look: Slide shows the keyboard cursor and the grabbed block

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

### Requirement: Look: The cursor's color is chosen against every material it can land on

The cursor's color SHALL be chosen against the span of materials it can land on,
not against one of them: the board's own contrast ladder runs from the key block
to the exit area, and that ladder inverts between color schemes, so a color
prominent in one scheme is not thereby prominent in the other.

#### Scenario: The cursor on the key block and on the exit

- **WHEN** the cursor sits on the key block, and then on the exit area, in
  either color scheme
- **THEN** it reads against both
