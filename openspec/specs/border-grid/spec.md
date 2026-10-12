# border-grid Specification

## Purpose

The edge-marking mechanic Palisade and Separate share: that a game takes its
input, its look and its hint notation from the engine's border-grid modules
and owns no copy, what each button, drag and key does to an edge, which edges
the board reddens, when a hinted edit completes its step, and that the shared
renderer knows neither game. The clue layer that stays each game's own is
stated in `palisade` and `separate`.

## Requirements

### Requirement: A border-grid game takes the mechanic from the engine and owns no copy

A game that marks a grid's edges SHALL take the mechanic from the shared
engine modules and own no copy: the edge bits and
direction tables, the nearest-edge hit test,
the three-state toggle, the paired edit of an edge's two cells, the half-cell
cursor, and its look: the geometry, the edge rects, the tile skeleton and the
live error model (a region over or under size, a wall separating nothing). A
change to what counts as a wrong wall SHALL take effect in every such game at
once.

#### Scenario: A fix to the shared mechanic reaches both games

- **WHEN** a defect is found in the edge hit test, the three-state toggle or
  the test for a wall that separates nothing
- **THEN** it is fixed once in the shared module
- **AND** both Palisade and Separate receive the fix, rather than one game
  silently retaining the defect

#### Scenario: Both games' edits come from the shared module

- **WHEN** a click and a cursor key address the same interior edge in Separate
- **THEN** both produce the paired edits the shared module computes for that
  edge

#### Scenario: The error model is the shared module's

- **WHEN** the player's no-wall marks join more than `k` cells in Separate
- **THEN** the edges between that region and its neighbors are drawn in the
  error color by the shared module's test, not by one of Separate's own

### Requirement: A cell holds its four edges in one byte, and an edge is on both its cells

A border-grid state SHALL hold a byte a cell: the low four bits its walls up,
right, down and left (`BORDER`), the high four the no-wall marks in that order
(`DISABLED`), and an edge with neither bit undecided. An interior edge SHALL
be on both cells it separates. `initBorders` SHALL start a board with the
rim's walls alone. A `BorderEdit` SHALL name a cell and the bits to flip in
its byte; each game's `edges` move carries them and a save replays them, so
no bit moves.

#### Scenario: A wall drawn on an undecided edge

- **WHEN** the edge to the right of a cell goes from undecided to a wall
- **THEN** the edits are the flag 2 on that cell and the flag 8 on the cell
  to its right, and applying the same two again leaves the edge undecided

#### Scenario: A wall drawn over a no-wall mark

- **WHEN** the edge to the right of a cell goes from a no-wall mark to a wall
- **THEN** the edits are the flag 34 on that cell and 136 on the cell to its
  right: the wall bit set and the mark bit cleared, on each

#### Scenario: A corner cell of a new board

- **WHEN** a board is started
- **THEN** its top-left cell holds 9, the walls up and left, and a cell off
  the rim holds 0

### Requirement: Each button cycles an edge between its own state and undecided

An edge SHALL hold one of three states: wall, no-wall mark or undecided. The
primary verb of `borderGridVerbs` SHALL make an undecided edge a wall and a
wall undecided, and the secondary verb SHALL make an undecided edge a no-wall
mark and a no-wall mark undecided. An edge holding the other button's state
SHALL go straight to the pressed button's, without passing through undecided.
The edits SHALL change both cells the edge separates, and the game wraps them
in its own move.

#### Scenario: A left click on a no-wall mark makes a wall

- **WHEN** the player left-clicks an interior edge of Palisade that carries a
  no-wall mark
- **THEN** the edge is a wall and the mark is cleared, on both cells
- **AND** a second left click returns it to undecided, not to the mark

#### Scenario: A right click turns a wall into a no-wall mark

- **WHEN** the player right-clicks an interior edge of Separate that is a wall
- **THEN** the move clears the wall bit and sets the no-wall bit on that edge
  of both cells

### Requirement: A press addresses the nearest interior edge

A press inside a cell SHALL address the one of that cell's four edges nearest
the pointer, and every point inside a cell SHALL resolve to exactly one edge:
a point equally near two SHALL take the upper or lower edge before a side one,
and the lower or right edge before its opposite. A press outside the grid, or
one whose nearest edge is on the grid's rim, SHALL address no edge, so it
makes no move.

#### Scenario: A press beside the rim makes no move

- **WHEN** the player presses inside a corner cell, nearer one of its outer
  edges than either of its inner ones
- **THEN** no edge is addressed, the board is unchanged and undo offers no
  step for the press

### Requirement: The keyboard cursor moves by half a cell

The border grid's cursor SHALL stand on half-cell coordinates: `(2x+1, 2y+1)`
is the center of cell `(x, y)`, a position with one even coordinate is the
edge between two cells, and one with both even is a corner. An arrow key SHALL
show the cursor and move it half a cell, held within `[1, 2w-1]` by
`[1, 2h-1]`, so it never rests on the rim. The select keys SHALL apply the
buttons' verbs to the edge the shown cursor rests on, and SHALL apply nothing
on a center or a corner.

#### Scenario: Select on a center does nothing, and one step on reaches an edge

- **WHEN** the shown cursor rests on the center of a cell that is not in the
  last column, and Enter is pressed
- **THEN** no move is made
- **AND WHEN** the right arrow and then Enter are pressed
- **THEN** the undecided edge on that cell's right becomes a wall

#### Scenario: An arrow at the limit stays inside the rim

- **WHEN** the cursor rests on the center of a cell of the top row and the up
  arrow is pressed
- **THEN** the cursor stays on that center and does not move onto the rim

### Requirement: A drag along a line of edges repeats the press

`borderGridVerbs` SHALL declare a sweep for both buttons. A drag on from a
press that changed an edge SHALL apply the pressed button's verb to each
further interior edge the pointer passes that is in the state the pressed edge
was in before its press, and SHALL pass over an edge in another state. It
SHALL take an edge only where the pointer passes within three tenths of a tile
of the edge's middle, so a drag along a line of edges or round a corner leaves
the edges that meet it there.

#### Scenario: A drag draws walls and leaves the one already there

- **WHEN** the player left-presses an undecided edge and drags along a line of
  edges of which two are undecided and one, between them, is already a wall
- **THEN** the pressed edge and the two undecided ones are walls, and the wall
  between them is still a wall

#### Scenario: A drag begun on a wall erases walls

- **WHEN** the player left-presses a wall and drags on along a wall, an
  undecided edge and a no-wall mark
- **THEN** both walls are undecided, and the undecided edge and the no-wall
  mark are as they were

#### Scenario: A drag along a line leaves the edges that meet it

- **WHEN** the player right-presses the undecided edge above a cell and drags
  sideways along the line that edge lies on, past the corners of the cells
  beside it
- **THEN** the undecided edges on that line take the no-wall mark, and no edge
  that meets the line at a corner is changed

#### Scenario: A drag across a row of cells takes the edges it crosses

- **WHEN** the player left-presses the undecided edge between two cells of a
  row and drags on through the middles of the cells of that row
- **THEN** each undecided edge the pointer crosses between two of those cells
  becomes a wall, and the edges above and below the cells are unchanged

### Requirement: The board reddens an edge beside a group joined past the region size

The shared error model SHALL be computed from the borders as they stand and
the game's region size `k`. It SHALL redden an interior edge, whatever state
the edge holds, between two cells that the player's no-wall marks do not join,
where either is one of more than `k` cells that no-wall marks join. An
undecided edge joins nothing, so over-size SHALL be measured on what the
no-wall marks commit to and never on a region the walls have yet to close.

#### Scenario: An undecided edge round an over-large group is reddened

- **WHEN** the player's no-wall marks join more than `k` cells of Palisade
- **THEN** every interior edge between that group and a cell outside it is
  drawn in the error color, the undecided ones included
- **AND** the no-wall marks inside the group keep their own color

#### Scenario: A board with no no-wall mark has no over-size error

- **WHEN** a new board holds only its rim walls, so the whole grid is one
  region the walls bound
- **THEN** no edge is reddened

### Requirement: The board reddens a wall beside an undersized region and a wall that divides nothing

The shared error model SHALL redden a wall between two regions the walls
bound, where either holds fewer than `k` cells. It SHALL redden a wall that
divides nothing: one between two cells the no-wall marks join, or between two
cells of one wall-bounded region of at most `k` cells. The rim SHALL never be
reddened. An edge the game's Check & Save flags SHALL be drawn in the same
error color, and an edge a displayed hint rings SHALL take the hint's color
over it.

#### Scenario: An undersized region reddens its walls

- **WHEN** the player's walls enclose a region of fewer than `k` cells
- **THEN** the walls between that region and its neighbors are drawn in the
  error color, and the stretch of rim that bounds it is not

#### Scenario: A wall inside a region still too large is not an error

- **WHEN** the player draws one wall on a new board, which cuts nothing off
  the one region of more than `k` cells that the rim bounds
- **THEN** the wall is drawn as a wall, since the region is still being
  divided

#### Scenario: A wall left inside a finished region is reddened

- **WHEN** a wall-bounded region holds exactly `k` cells and a wall lies
  between two of them
- **THEN** that wall is drawn in the error color

### Requirement: The shared renderer does not know which game is drawing

The shared border-grid renderer SHALL take a game's palette indices and a
callback for the middle of a tile, and SHALL NOT branch on which game is
drawing.

#### Scenario: The middle of a tile is the game's callback

- **WHEN** the shared renderer draws a tile of Palisade or of Separate
- **THEN** the clue digit or the letter in the middle of the tile is drawn by
  that game's callback
- **AND** no branch of the renderer names either game

### Requirement: The games' move formats stay independent

The shared module SHALL report which edge a pointer or cursor action targets
and how its state should cycle, and each game SHALL construct its own `Move`
from that description. The module SHALL NOT define a shared move type, which
would couple two save formats that have no reason to be identical.

#### Scenario: Separate wraps the shared edits in its own move

- **WHEN** the shared module reports the paired edits for an edge
- **THEN** Separate returns them inside its own `edges` move

### Requirement: A game adopting the border-grid input adopts its look

A game that uses the shared border-grid input mechanic SHALL draw through the
shared border-grid renderer, and a guard SHALL fail the build for one that does
not, since nothing else would see a second hand-written renderer of the one
mechanic being written.

#### Scenario: A game adopting the input mechanic adopts its look

- **WHEN** a game uses the shared border-grid input mechanic
- **AND** its sources never reference the shared border-grid renderer
- **THEN** the build fails, naming that game

### Requirement: Border-grid games share the hint's notation layer

The border grid's hint highlight, the journey a firing becomes, the keep-track
verdict on a click, the per-tile hint flags, the drawing of a striped region
and outlined squares, and the later-leg sentence SHALL come from the engine,
shared by Separate and Palisade. Each game SHALL keep its deduction, its
sentences and its own `Move`, wrapping the shared edits itself.

#### Scenario: Separate's hint step is drawn by the shared layer

- **WHEN** Separate displays a hint step that stripes one region and outlines
  another
- **THEN** the ringed edges, the stripes and the outline are drawn by the
  shared border-grid renderer from the step's words
- **AND** the sentence and the `edges` move are Separate's own

### Requirement: A hinted edge's step is completed by the edit that sets it

`borderHintKeepTrack` SHALL return `"completed"` when the player's edits turn
on, on the step's hinted edge, the state the step forces (a wall, or a no-wall
mark), and `"off"` for every other move. The verdict SHALL be checked by
button and not by side: the other button's state set on the hinted edge SHALL
NOT complete the step, and the hinted edit SHALL complete it whichever of the
edge's two cells the press landed in. A game's `hintKeepTrack` SHALL hand its
edge edits to this helper.

#### Scenario: The wrong button on the right edge

- **WHEN** a displayed step of Palisade forces a wall on an undecided edge and
  the player right-clicks that edge
- **THEN** the verdict is `"off"`, and the step is not completed

#### Scenario: The hinted edit made from the far cell

- **WHEN** a step names its edge as the right side of one cell and the player
  left-clicks inside the cell to its right, addressing the same edge as that
  cell's left side
- **THEN** the verdict is `"completed"`

#### Scenario: A hinted wall over the player's no-wall mark

- **WHEN** a step forces a wall on an edge that carries a no-wall mark and the
  player left-clicks it
- **THEN** the verdict is `"completed"`, the one click having cleared the mark
  and set the wall
