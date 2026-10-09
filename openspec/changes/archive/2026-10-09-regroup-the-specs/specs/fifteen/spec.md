## MODIFIED Requirements

### Requirement: Fifteen is solved when its tiles read in order with the gap last

The board SHALL be a `w×h` grid of numbered tiles with one empty gap, solved
when the tiles read `1..n-1` in row-major order with the gap last.

#### Scenario: The board is solved exactly when its tiles are in order

- **WHEN** a `4x4` board's tiles read `1` to `15` in row-major order with the
  gap in the last cell
- **THEN** the game reports it solved
- **AND** a board one slide away from that arrangement is reported as not
  completed

### Requirement: A click slides only along the gap's row or column

`interpretMove` SHALL produce a slide from a click only when the target cell
shares exactly one coordinate with the current gap: a click sharing zero or
both coordinates, or out of bounds, SHALL produce nothing. Cursor keys SHALL
slide the adjacent tile into the gap immediately: the pressed arrow moves a
tile in that direction.

#### Scenario: Click geometry constrains legal slides

- **WHEN** a click targets a cell diagonal to the gap (sharing neither
  coordinate), or the gap's own cell (sharing both)
- **THEN** no move is produced

#### Scenario: An arrow moves a tile, not the gap

- **WHEN** the gap is in the bottom-right corner and the Down arrow is pressed
- **THEN** the tile above the gap slides down into it

### Requirement: A Fifteen hint step says whether its slide places a tile home

Each step's narration SHALL name the goal tile it works toward its home: one
tile, held until it is home, so a restoration reads as part of one goal. A
slide of the goal SHALL say it slides into place, closer, or back a step, as
it lands home, nearer or further. A slide of another tile SHALL say that tile
slides into place only where it lands in its solved cell and no later slide of
the plan moves it, and otherwise that it slides out of the way.

#### Scenario: Narration distinguishes a home move from a setup move

- **WHEN** a step lands a tile in its solved cell, and no later step of the
  plan slides that tile
- **THEN** its narration states that the tile is being placed home
- **WHEN** a step only maneuvers (it does not land a tile in its solved cell)
- **THEN** its narration states it is a setup move and names the goal tile
  being worked toward its home

#### Scenario: The goal slides away from its home

- **WHEN** a step slides the goal tile one cell further from its solved cell
- **THEN** it says the goal slides back a step, leaving the hole between it and
  its home, and a step that slides it nearer says it slides closer

#### Scenario: A tile carried through its own home

- **WHEN** the gap's way round carries a tile into its solved cell and a later
  step of the plan slides it out again
- **THEN** the step says that tile slides out of the way

#### Scenario: The goal stays through a restoration

- **WHEN** placing the last tile of a line displaces a tile already home and
  slides it back
- **THEN** every step of that rotation names the same goal tile, and the slide
  back says the displaced tile slides into place

#### Scenario: A placed goal that the next rotation displaces

- **WHEN** a goal tile is home and the rotation placing the next tile of its
  line slides it away and back
- **THEN** the step that first homed it said it slides into place, and the
  slide back says so again

### Requirement: A Fifteen tile stands off the well it slides in

`redraw` SHALL draw a tile's face as the collection's lifted surface inside its
bevel, and the gap, with whatever a sliding tile uncovers, as the collection's
cell surface, so a tile is told from the well by more than its bevel in both
schemes. The tile SHALL keep its bevel: it is an object the player moves.

#### Scenario: A tile is not the board's gray

- **WHEN** a board is drawn at rest in either scheme
- **THEN** every tile's face is the lifted surface
- **AND** the gap is the cell surface, darker than the board around the grid
