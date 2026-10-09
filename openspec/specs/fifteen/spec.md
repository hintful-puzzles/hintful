# fifteen Specification

## Purpose
Fifteen, the sliding-tile puzzle of putting numbered tiles in order from the top
left, with the hole in the bottom-right corner: what counts as solved, the
params encoding, what the generator promises, what a click and an arrow do, the
move count, how the tiles look and slide, and a hint that plays out a full
greedy solution, saying of each slide whether it puts a tile home or sets one
up.

## Requirements

### Requirement: Fifteen is solved when its tiles read in order with the gap last

The board SHALL be a `w×h` grid of numbered tiles with one empty gap, solved
when the tiles read `1..n-1` in row-major order with the gap last. The game
SHALL provide `statusbarText`, `solve` and `textFormat`. It SHALL NOT provide a
`findMistakes` hook, since every reachable position is legal.

#### Scenario: The board is solved exactly when its tiles are in order

- **WHEN** a `4x4` board's tiles read `1` to `15` in row-major order with the
  gap in the last cell
- **THEN** the game reports it solved
- **AND** a board one slide away from that arrangement is reported as not
  completed

### Requirement: Fifteen's params are a width and a height

Params SHALL be `w` and `h`, encoded `WxH` with lenient decode: a bare `W`
yields a square `W×W` board. Params with `w < 2` or `h < 2` SHALL be refused.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 4, h: 4 }` are encoded
- **THEN** the result is `4x4`
- **AND** decoding `4x4` and `4` both yield `{ w: 4, h: 4 }`, while a
  non-square `5x4` decodes to `{ w: 5, h: 4 }`

#### Scenario: A board one cell wide is refused

- **WHEN** params `{ w: 1, h: 4 }` are checked
- **THEN** they are refused

### Requirement: A generated Fifteen board is solvable and starts unsolved

`newDesc` SHALL deal a permutation of the tiles whose parity matches the gap's
chessboard parity, so the board is reachable from the solved arrangement. It
SHALL NOT deal the solved arrangement.

#### Scenario: A generated board is solvable and starts unsolved

- **WHEN** a new game is created from any valid params
- **THEN** the tile array is a permutation whose parity matches the gap's
  chessboard parity
- **AND** the initial state is not in the solved arrangement and reports a
  not-completed status

### Requirement: A Fifteen slide shifts the whole line between its target and the gap

A `FifteenMove` SHALL be either a slide carrying the destination gap cell
(`{ type: "move", x, y }`) or a solve (`{ type: "solve" }`). A slide SHALL
shift every tile on the line between the old and new gap one cell toward the
old gap, incrementing the move count once per shifted tile. A solve SHALL
replace the grid with the solved permutation and count as one move.

#### Scenario: A slide shifts a line of tiles into the gap

- **WHEN** a slide move targets a cell sharing one coordinate with the gap,
  three tiles away along that line
- **THEN** all three tiles shift one cell toward the old gap, the gap lands on
  the targeted cell, and the move count increases by three

#### Scenario: Solve snaps to the solved board

- **WHEN** the solve move executes
- **THEN** the new state is the solved permutation with the move count one
  higher

### Requirement: A click slides only along the gap's row or column

`interpretMove` SHALL produce a slide from a click only when the target cell
shares exactly one coordinate with the current gap: a click sharing zero or
both coordinates, or out of bounds, SHALL produce nothing. Cursor keys SHALL
slide the adjacent tile into the gap immediately, with the default arrow
semantics: the pressed arrow moves a tile in that direction.

#### Scenario: Click geometry constrains legal slides

- **WHEN** a click targets a cell diagonal to the gap (sharing neither
  coordinate), or the gap's own cell (sharing both)
- **THEN** no move is produced

#### Scenario: An arrow moves a tile, not the gap

- **WHEN** the gap is in the bottom-right corner and the Down arrow is pressed
- **THEN** the tile above the gap slides down into it

### Requirement: Fifteen offers a greedy full-solution hint plan

`hint()` SHALL return the whole greedy solution as a multi-step plan, so the
hint stays displayed while it is followed. Each step SHALL be the next
single-cell gap slide the greedy solver chooses, highlighting the tile it
slides. The solver SHALL fill the shorter of the top row and the left column
tile by tile, moving the next tile toward its home, with a fixed
shortest-move table for the end-of-line corner. Following the plan from any
solvable board SHALL reach the solved state.

#### Scenario: Hint plan solves a solvable board

- **WHEN** `hint()` is requested on an unsolved board and every step's move is
  applied in order
- **THEN** the steps are legal single-cell gap slides and the board reaches the
  solved arrangement within `5·n³` moves

#### Scenario: Hint highlights the tile it moves

- **WHEN** `hint()` is requested on an unsolved board
- **THEN** the first step's move is a slide whose target is one cell from the
  gap, and its highlight names the tile that will slide into the gap

### Requirement: A Fifteen hint step says whether its slide places a tile home

Each step's narration SHALL explain why the move matters, not merely which
tile slides. A step whose slid tile lands in its solved cell SHALL narrate it
as placing that tile home. Any other step SHALL narrate a setup move, naming
the target tile it is working toward its home.

#### Scenario: Narration distinguishes a home move from a setup move

- **WHEN** a step lands a tile in its solved cell
- **THEN** its narration states that the tile is being placed home
- **WHEN** a step only maneuvers (it does not land a tile in its solved cell)
- **THEN** its narration states it is a setup move and names the target tile
  being worked toward its home

### Requirement: Fifteen's hintKeepTrack completes on the hinted slide alone

`hintKeepTrack` SHALL return `"completed"` for a player move that produces
exactly the board the current step expects, advancing the plan. It SHALL
return `"off"` for any other move, dropping the plan so the next request
recomputes it.

#### Scenario: Following the plan keeps it displayed; deviating drops it

- **WHEN** the player makes exactly the move the current step describes
- **THEN** `hintKeepTrack` reports the step completed and the plan advances
- **AND** a different move reports `"off"`, dropping the plan

### Requirement: Fifteen draws beveled numbered tiles in a recessed border

`redraw` SHALL draw a recessed beveled border, and each tile as a beveled
square with its centered number.

#### Scenario: First draw emits the border and numbered tiles

- **WHEN** `redraw` runs against a recording `GameDrawing` double for a fresh
  board
- **THEN** the recorded operations include the recessed border and one beveled
  tile with its number for each non-gap cell

### Requirement: A Fifteen slide animates its tiles between cells

A slide SHALL animate: each moving tile is drawn interpolated one cell from
its old position toward the gap, over the animation duration.

#### Scenario: A slide animates between cells

- **WHEN** a slide move has just executed and `redraw` runs mid-animation
- **THEN** the moving tiles are drawn at coordinates interpolated between their
  old and new cells, settling exactly on their destination cells at animation
  end

### Requirement: A genuine Fifteen completion flashes for two frames

A genuine completion SHALL flash the tiles' faces for two frames.

#### Scenario: The last slide flashes

- **WHEN** the player's slide puts the last tile in order
- **THEN** the tiles' faces flash for two frames

### Requirement: Fifteen's status bar shows the move count

The status bar SHALL show the move count after the engine's completion words.
The move count SHALL never freeze or reset.

#### Scenario: The count follows the completion words

- **WHEN** the player solves a board with their twelfth tile moved
- **THEN** the status bar reads `COMPLETED! Moves: 12`
- **AND** a further slide off the solved arrangement reads `Moves: 13`

### Requirement: A Fifteen tile stands off the well it slides in

`redraw` SHALL draw a tile's face as the collection's lifted surface inside its
bevel, and the gap, with whatever a sliding tile uncovers, as the collection's
cell surface, so a tile is told from the well by more than its bevel in both
schemes. The tile SHALL keep its bevel: it is an object the player moves.
Color 0 SHALL stay the board.

#### Scenario: A tile is not the board's gray

- **WHEN** a board is drawn at rest in either scheme
- **THEN** every tile's face is the lifted surface
- **AND** the gap is the cell surface, darker than the board around the grid
