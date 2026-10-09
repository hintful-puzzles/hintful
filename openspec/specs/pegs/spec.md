# pegs Specification

## Purpose
Pegs (peg solitaire), the puzzle of jumping pegs over one another, removing each
peg jumped, until one remains. This spec holds the rules and what a Random
board promises, the drag and the keyboard jump, what the hint and Solve do and
say, and how the board is drawn.

## Requirements

### Requirement: Pegs is won when one peg remains

A jump SHALL move a peg two cells along a row or column, over a peg beside it
into the empty hole beyond, and SHALL remove the peg jumped. The game SHALL be
complete when exactly one peg remains. The board SHALL be one of three types:
Cross, Octagon or Random. A Random board SHALL be built by playing jumps
backwards from a single peg, so it can always be finished, and SHALL touch all
four edges of its grid.

#### Scenario: Cross board generation and play

- **WHEN** a new Cross game is created at 7×7
- **THEN** the board has a cross-shaped layout with a central hole and pegs elsewhere inside the cross
- **AND** a valid jump move (drag peg over adjacent peg into hole) removes the jumped peg and places the jumping peg at the target
- **AND** when exactly one peg remains, `status` returns completed

#### Scenario: Random board generation

- **WHEN** a new Random game is created
- **THEN** the generator builds the board by reverse-moves from a single peg
- **AND** the resulting board touches all four edges of the grid
- **AND** the board is guaranteed soluble (every move is reversible)

### Requirement: A peg jumps by a drag, or from the keyboard

Pressing on a peg SHALL pick it up, the peg SHALL follow the pointer, and
releasing it SHALL make the jump where it is released on a legal landing and
otherwise SHALL end the drag with no move. From the keyboard, select on a peg
under the cursor SHALL arm a jump; an arrow SHALL then jump that way where a
peg and then a hole lie in its direction, moving the cursor to the landing;
select again SHALL disarm it.

#### Scenario: Drag input

- **WHEN** the player presses LEFT_BUTTON on a peg
- **THEN** the drag starts and the peg is visually lifted from its source cell
- **WHEN** the player drags (LEFT_DRAG)
- **THEN** the peg follows the mouse position
- **WHEN** the player releases (LEFT_RELEASE) on a valid jump target
- **THEN** the jump move is executed
- **WHEN** the player releases on an invalid target
- **THEN** the drag is canceled with no move

#### Scenario: Keyboard cursor with jump-select

- **WHEN** the cursor is on a peg and the player presses CURSOR_SELECT
- **THEN** the cursor enters jumping mode
- **WHEN** an arrow key is pressed while in jumping mode
- **THEN** if the direction has a peg then a hole, the jump is executed and the cursor moves to the target
- **WHEN** CURSOR_SELECT is pressed again while jumping
- **THEN** jumping mode is canceled

### Requirement: Pegs discards a drag or an armed jump when the board changes under it
Pegs SHALL clear its dragged peg and its armed keyboard jump whenever the midend
replaces the game state, so that a pointer drag or a selected jump cannot act on
a board that no longer holds the peg it was aimed at.

#### Scenario: an undo disarms a selected jump

- **GIVEN** a keyboard jump armed on a peg with the cursor over it
- **WHEN** the player undoes the move that placed that peg, and then presses an
  arrow key
- **THEN** the press starts no jump and moves the cursor as usual
- **AND** no error reaches the player

### Requirement: Pegs' hint offers the first jump of a line that leaves one peg

Pegs SHALL provide a `hint` that searches for a line of jumps leaving one peg
and offers its first jump, ringing the peg that jumps and the hole it lands in.
It SHALL judge the other jumps from the same position within a work allowance
per request, and a step SHALL say about those jumps only what the hint checked.

#### Scenario: Following the hint from the dealt board

- **WHEN** the player follows every step from a dealt board of any preset
- **THEN** the board ends with one peg

### Requirement: Pegs' hint shows a jump that would cut a peg off

Where a jump other than the one offered would leave a peg that no peg can ever
arrive beside, at once or after any jump that follows it, the step SHALL stripe
that jump and outline that peg.

#### Scenario: A jump that would cut a peg off

- **WHEN** some jump other than the one offered would leave a peg that no peg can ever arrive beside
- **THEN** the step stripes that jump, outlines that peg, and says the striped jump would cut it off

### Requirement: Pegs' hint clears a shape as one journey

Where no other jump would cut a peg off, and the line opens with three or six
jumps that empty a line of three or a two-by-three block and leave every other
peg where it began, the hint SHALL offer those jumps as one journey with the
shape striped.

#### Scenario: A line of three cleared

- **WHEN** no other jump would cut a peg off, and the line opens with three jumps that empty a row of three pegs and leave every other peg where it began
- **THEN** the hint offers the three jumps as one journey, each step striping the row

### Requirement: Pegs' hint claims about the other jumps only what the search settled

Where the step shows neither a jump that cuts a peg off nor a shape to clear,
and some other jump was proved unable to finish, the step SHALL draw an arrow
on each other jump a finish was found after, and SHALL say only these can
finish only when no other jump was left unsettled. A step SHALL say every jump
can still finish only where a finish was found after each one.

#### Scenario: The only jump that can finish

- **WHEN** every jump but one from the position leaves a board no line of jumps finishes from
- **THEN** the step for the remaining jump says it is the only one from here that can still finish with one peg

#### Scenario: A jump the search could not settle

- **WHEN** some other jump was proved to lose and another was neither found to finish nor proved to lose within the allowance
- **THEN** the step draws arrows only on jumps a finish was found after, and does not say that only those can finish

### Requirement: Pegs' hint calls a peg stranded only where no peg is beside it

Where nothing about the other jumps is settled, a step SHALL call a peg
stranded only where no peg is beside it: either now, with the offered jump
landing beside it, or after another jump that the step stripes, with a peg
still beside it after the offered jump. The step SHALL NOT say that such a
jump loses.

#### Scenario: A stranded peg

- **WHEN** nothing about the other jumps is settled, a peg has no peg beside it, and the offered jump lands beside it
- **THEN** the step outlines that peg, calls it stranded, and asks the player to go back for it

### Requirement: Pegs' hint refuses a position it cannot finish from

Where the board holds pegs no jump can ever involve again and more than one peg
is left, the hint SHALL refuse, outlining those pegs, with a sentence that says
they are cut off and asks the player to undo. Otherwise it SHALL refuse with
`NO_SOLUTION_FROM_HERE` when the search proved no line finishes, and with
`SEARCH_OUT_OF_REACH` when the search could not settle the position.

#### Scenario: A peg cut off

- **WHEN** a peg has no peg beside it and no peg can ever arrive beside it, and another peg remains
- **THEN** the hint refuses, outlines the peg, says it is cut off, and asks the player to undo

### Requirement: Pegs' Solve finishes from the player's position, or else from the dealt board

Pegs SHALL provide `solve`, whose move leaves one peg on the square the search's line of jumps ends on. It SHALL search from the player's position first and, when that position is lost or past the search's reach, from the dealt board. It SHALL refuse with `NO_SOLUTION` only when the search proved the dealt board has no finish, and with `PUZZLE_NOT_REASONABLE` otherwise.

#### Scenario: A lost position

- **WHEN** the player's position cannot finish and the dealt board can
- **THEN** Solve leaves the one peg where a line of jumps from the dealt board ends

### Requirement: Pegs draws its pegs as pieces on a quiet board

The board SHALL be drawn as pieces on a quiet surface, with no bevel: it is
not a thing the player moves. Every playable cell SHALL be the plain cell
surface, with the surface's grid line between two cells and round the board's
outline, whatever its shape. A peg SHALL be the collection's disc piece, inset
on its cell, in a color no mark drawn on the board uses. An empty hole SHALL
be a ring on that surface, never a fill of its own, so no state is a step of
gray.

#### Scenario: A peg and a hole on one surface

- **WHEN** a board holding pegs and one empty hole is drawn
- **THEN** every playable cell is the same cell surface
- **AND** each peg is a disc in the peg's color and the hole is an unfilled ring

### Requirement: Pegs' marks sit beside the peg and never recolor it

The keyboard cursor SHALL be drawn at the corners of its cell, beside the peg
or the hole, and SHALL NOT recolor either. A peg picked up from the keyboard
SHALL keep its own color inside a ring in the held color. A hint's rings,
outline, stripes and arrows SHALL be drawn beside the peg.

#### Scenario: The cursor is beside the peg

- **WHEN** the keyboard cursor is on a peg
- **THEN** the peg is drawn in the peg's color
- **AND** the cursor's mark is at the corners of the cell

#### Scenario: A held peg wears a ring

- **WHEN** a peg is picked up from the keyboard
- **THEN** it is drawn in its own color inside a ring in the held color
- **AND** the cursor's corner mark is not drawn on that cell

### Requirement: The completion flash lifts every cell

The completion flash SHALL lift every cell to the lifted surface on its lit
beats.

#### Scenario: A lit beat

- **WHEN** the board is drawn on a lit beat of the completion flash
- **THEN** every playable cell is the lifted surface, pegs and holes drawn on it as usual
