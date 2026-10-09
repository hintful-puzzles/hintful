## MODIFIED Requirements

### Requirement: Bridges has a keyboard cursor that drags

Cursor keys SHALL move a keyboard cursor, and a digit SHALL jump a shown
cursor to the nearest other island bearing that clue. `CURSOR_SELECT` SHALL grab a keyboard drag at
the cursor's island, for an arrow to carry out; a second `CURSOR_SELECT`, or
`CURSOR_SELECT2` with the cursor shown, SHALL drop it and toggle that island's
completed mark, the keyboard's way to mark one. Ctrl with an arrow SHALL drag a
bridge in one key, and Shift with an arrow the secondary drag.

#### Scenario: Select and an arrow draw a bridge

- **WHEN** the cursor is shown on an island with an in-line neighbor to its
  right, the span between them empty and free to take a bridge, and the
  player presses `CURSOR_SELECT` and then the right arrow
- **THEN** one bridge joins the two islands

#### Scenario: Select twice marks the island

- **WHEN** the cursor is shown on an island and `CURSOR_SELECT` is pressed
  twice with no arrow between
- **THEN** the second press makes the move that toggles the island's completed
  mark

### Requirement: Bridges draws provably wrong state red

`redraw` SHALL draw in red, as the board is played, an island that can no
longer reach its count, when `allowloops` is false the bridges that complete a
forbidden loop, and a group of islands that all have their full count and join
only one another while other islands are left out.

#### Scenario: A loop is red only where loops are forbidden

- **WHEN** the player's bridges close a loop
- **THEN** the loop's bridges are drawn red on a board with
  `allowloops = false`, and closing a loop is not what turns anything red on a
  board that allows loops

### Requirement: Bridges Easy runs the single-island deductions

Easy SHALL run stage 1: force the bridges an island must place because its
remaining count equals its available adjacent space, force one bridge to every
neighbor of an island whose count is more than the others could carry at the
bridge limit, and forbid bridges into a satisfied island.

#### Scenario: An island with exactly enough room is filled at Easy

- **WHEN** an island still needs two bridges and the spans around it have room
  for exactly two
- **THEN** the Easy solver draws both

### Requirement: Bridges renders islands, bridges, marks and the win flash

The renderer SHALL draw islands as circles bearing their count, single and
double bridges (horizontal and vertical), the in-progress drag as its two
islands and the bridges between them recolored, the no-line and completed-mark
indicators, the keyboard cursor as a wash on its island's face, and the win
flash.

#### Scenario: The cursor is on the island's face

- **WHEN** the keyboard cursor is shown on an island that has no error
- **THEN** that island's face is the cursor wash, and its rim and count stay in
  ink

#### Scenario: A drag over an empty span draws no line

- **WHEN** a drag from an island points at an in-line neighbor across a span
  that carries no bridge, and has not been released
- **THEN** the rims of the two islands are recolored and no line is drawn
  between them

## ADDED Requirements

### Requirement: A canceled press on an island draws no bridge

A press on an island that is canceled before the pointer has moved SHALL change
nothing. The frontend reports it as a drag far off the canvas's top left corner
and a release there, which a drag that reads only a direction would take as
pointing at the island up or to the left. The rule covers a press that had not
moved: a drag already under way is released where the frontend reports it.

#### Scenario: A press is canceled on an island with a neighbor to its left

- **WHEN** an island with an in-line neighbor to its left is pressed and the
  press is canceled with no pointer movement
- **THEN** no bridge is drawn and no history entry is added

#### Scenario: A drag that overshoots the canvas still draws

- **WHEN** a drag from an island toward its left neighbor runs on past the
  canvas's left edge and is released there
- **THEN** the bridge to that neighbor is drawn
