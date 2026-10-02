## ADDED Requirements

### Requirement: Slide's board reads by color, not by bevel alone

The floor, the walls, the ordinary blocks and the main block SHALL be
distinguishable from one another by fill, not solely by their bevels, in both the
light and the dark presentation. Upstream derives all four from the single host
background, which its own author records as "wishy-washy"; this project's display
code is free to correct that.

Each SHALL be a function of the host background rather than an authored color,
so that one inversion rule maps all four and their **ordering** survives the
scheme flip by construction. Only the two the help page names to the player —
the blue key block and the green exit — SHALL carry a hue; the others stay
neutral so they cannot compete with them.

The target marker SHALL remain the most prominent thing on the board, since it
names the goal. "Pale" is scheme-relative and is not the testable part: a tint
that is lighter than the board under a light scheme is *darker* than it under a
dark one, which is the relationship being preserved rather than a defect.

The exit marking SHALL be legible at the smallest shipped tile size, and SHALL
mark the gate's **boundary** rather than filling its squares, because the gate
usually lies on top of the exit area and two fills cannot both be seen.

Every color SHALL come from the shared palette, and SHALL be checked in both
schemes — a fill that reads as contrast against a light background must not read
as a bright patch against a dark one.

#### Scenario: The pieces are told apart without relying on bevels

- **WHEN** the board is rendered in either color scheme
- **THEN** floor, wall, ordinary block and main block each read as a distinct
  fill, and the target marker remains the most prominent

#### Scenario: The ladder inverts as a whole

- **WHEN** the board is rendered under the opposite color scheme
- **THEN** the four fills keep their order relative to one another, reversed
  along with the board itself, rather than any one of them changing its place

#### Scenario: The exit gate is marked without hiding the exit

- **WHEN** a gate square also lies inside the exit area
- **THEN** the exit's tint is still drawn across that square, and the gate is
  marked only along the edges where it meets something that is not the gate

### Requirement: Slide plays from the keyboard alone

Slide SHALL be playable by keyboard as well as by pointer, both driving the same
move machinery.

A cell cursor SHALL move over the board with the cursor keys, clamped to the
grid, hidden until the first cursor key and hidden again by any pointer press.
Selecting on a cell belonging to a block SHALL grab that block, computing the
**same** reachable set the pointer grab computes. While a block is grabbed, the
cursor keys SHALL move it **one cell per press** within that reachable set and
SHALL refuse a step that would leave it; selecting again SHALL commit the move,
and canceling SHALL restore the block to where it started.

One cell per press, rather than sliding as far as the reachable set allows, is
required rather than preferred: a slide-to-the-end cursor cannot stop *inside* a
corridor, so it could not reach every cell the drag can reach, and a keyboard
that cannot express a legal move is the defect this requirement exists to remove.

A keyboard journey of several cells SHALL produce **one** move, identical to the
move the equivalent drag produces — the keyboard is a second way to drive the
existing move construction, not a second movement model. There SHALL be one grab
implementation, reached from both the pointer press and the keyboard select.

The move count SHALL behave identically for a keyboard move and a drag: moving
the same block again SHALL NOT increment it, and returning a block to where it
started SHALL decrement it, so that a multi-step keyboard journey counts as a
single move exactly as the equivalent drag does.

A pointer press SHALL take the board over: it hides the cursor, and where it
grabs no block it SHALL also put down anything the keyboard was holding, so a
grab cannot survive under a pointer and be flung at it by the next drag.

A grab SHALL be dropped whenever the board changes underneath it, however it was
made, because its reachable set was computed against the board being replaced.
The cursor SHALL survive that, being a position on a grid whose size has not
changed; losing it would read as a dropped keypress.

Rendering SHALL show the keyboard cursor and the grabbed block, in both color
schemes and at the smallest shipped tile size. The grabbed block SHALL be drawn
exactly as the pointer drag draws it — there is one grab, and rendering it two
ways would assert a distinction the game does not make. The cursor SHALL be the
mark that distinguishes keyboard play, SHALL ride the grabbed block on the
square it was picked up by, and SHALL sit beside the board's content rather than
over it.

The cursor's color SHALL be chosen against the span of materials it can land
on, not against one of them: the board's own contrast ladder runs from the key
block to the exit area, and that ladder **inverts** between color schemes, so a
color prominent in one scheme is not thereby prominent in the other.

#### Scenario: A keyboard journey and the equivalent drag produce the same move

- **WHEN** a player selects a block with the keyboard, walks it several cells
  within its reachable set, and commits
- **THEN** the resulting board state and move count are identical to those
  produced by dragging the same block to the same cell

#### Scenario: A keyboard move out of the reachable set is refused

- **WHEN** a block is selected and a cursor key would move it to a cell outside
  its reachable set
- **THEN** nothing moves, no move is recorded, and the selection is retained

#### Scenario: Canceling a selection restores the block

- **WHEN** a block has been walked several cells and the player cancels instead
  of committing
- **THEN** the block returns to where it started and no move is recorded
- **AND** the cursor returns with it, to the square the block was picked up by

#### Scenario: A pointer press puts down what the keyboard was holding

- **WHEN** a block is grabbed from the keyboard and the player then presses a
  pointer on a cell holding no block
- **THEN** the grab is dropped and the cursor is hidden, so the next pointer drag
  moves nothing

#### Scenario: A grab dropped by an undo leaves the cursor in place

- **WHEN** the board changes under a keyboard grab
- **THEN** the grab is dropped, because its reachable set is stale
- **AND** the cursor stays where the player left it

#### Scenario: A board can be completed without a pointer

- **WHEN** a player uses only the keyboard from a fresh board
- **THEN** every move the pointer can make is reachable, and the board can be
  driven to completion

## MODIFIED Requirements

### Requirement: Slide input, movement and completion

Slide SHALL be played by grabbing a block, dragging it, and releasing it. On a
grab, the game SHALL compute the set of cells the block can reach; during the
drag, it SHALL snap the block to the nearest reachable cell to the pointer; on
release, it SHALL move the block there, or do nothing if the block did not move.
Only the main block SHALL be permitted to pass a forcefield cell.

Moving the same block again SHALL NOT increment the displayed move count, and
returning a block to where it started SHALL decrement it, so that a multi-step
slide of one block counts as a single move.

Solve SHALL play a shortest route **from the current position** to the exit, so
the board is finished, as Solve finishes every game's board.

A drag left in progress across a state change (an undo made while the pointer is
still down) SHALL be canceled, so no frame is ever asked to preview a block
against a board it no longer fits.

Rendering SHALL draw each block with beveled highlights, SHALL show the dragged
block following the pointer with a landing shadow at its snapped destination,
and SHALL flash on completion. There SHALL be no interpolated sliding animation.

#### Scenario: Dragging a block to a reachable space moves it

- **WHEN** a block is grabbed and released over a cell it can reach
- **THEN** the block moves to that cell and, unless it is the same block moved
  again, the move count increases by one

#### Scenario: Bringing the main block to the target wins

- **WHEN** the main block is slid onto the target position
- **THEN** the game is reported solved and flashes

#### Scenario: Releasing a block where it started does nothing

- **WHEN** a block is grabbed and released without having moved
- **THEN** the board and the move count are unchanged

## REMOVED Requirements

### Requirement: Slide's board reads by color, not only by bevel

**Reason**: its next-piece indication marked the block a Solve route wanted
moved, and Solve no longer installs a route (`ts-engine` § "Solve leaves a
solved board").
**Migration**: "Slide's board reads by color, not by bevel alone" carries every
other sentence and scenario unchanged.

### Requirement: Slide is playable by keyboard

**Reason**: it kept the select key for stepping an installed Solve route, and
Solve no longer installs one.
**Migration**: "Slide plays from the keyboard alone" carries every other
sentence and scenario unchanged; the select key always grabs.
