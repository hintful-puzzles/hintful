# twiddle Specification

## Purpose
Twiddle, the puzzle of rotating square sections of the grid until the tiles
stand in order from the top left and, in orientable mode, the right way up: its
params, its pure rotation and solve moves, and the tiles, cursor, rotation
animation and completion flash.

## Requirements

### Requirement: Twiddle game implements the Game interface

The engine SHALL provide a registered `twiddle` game implementing
`Game<TwiddleParams, TwiddleState, TwiddleMove, TwiddleUi, TwiddleDrawState>`:
a `w×h` grid of numbered tiles, solved when the tile numbers read in
non-decreasing row-major order and, when `orientable`, every tile is upright.
The game SHALL provide `statusbarText`, `solve` and `textFormat`.

#### Scenario: A generated board is scrambled and starts unsolved

- **WHEN** a new game is created from any valid params
- **THEN** the grid is a scramble of the solved arrangement that is not itself
  the solved arrangement, and reports a not-completed status
- **AND** generation terminates for every preset

### Requirement: Twiddle params are written WxHnN with trailing flags

Twiddle's params SHALL be `w`, `h`, `n` (the rotating block's size),
`rowsonly`, `orientable` and `movetarget`. They SHALL be encoded as `WxHnN`
followed by `r` when `rowsonly`, `o` when `orientable`, and `mK` when a shuffle
target `K` is set. Decoding SHALL be lenient: a bare `W` yields a square `W×W`
board, and a missing `nN` yields `n = 2`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 4, h: 4, n: 3, rowsonly: false, orientable: false, movetarget: 0 }` are encoded
- **THEN** the result is `4x4n3`
- **AND** decoding `4x4n3`, `4n3` (square shorthand), and `4x4n3o` all round-trip
  to the corresponding params, with `o` setting `orientable`

### Requirement: Twiddle's presets hold one orientable board

The presets SHALL be the 3×3 board with one number per row, the plain 3×3
board, the orientable 3×3 board, the 4×4 board with blocks of 2 and with blocks
of 3, the 5×5 board with blocks of 3, and the 6×6 board with blocks of 4. Every
3×3 preset SHALL rotate blocks of 2. Exactly one preset SHALL be orientable.

#### Scenario: The orientable preset is the 3×3

- **WHEN** the presets are listed
- **THEN** exactly one has `orientable` set, and it is a 3×3 board with blocks
  of 2

### Requirement: Twiddle refuses a board smaller than its block

`validateParams` SHALL reject `w < n`, `h < n` and an unreasonably large `w·h`,
each with a human-readable reason. The game SHALL declare a lower bound of 2 on
`n` and of 0 on `movetarget` in its `paramConfig`, so that the engine refuses
`n < 2` and a negative `movetarget` with a human-readable reason.

#### Scenario: Invalid params are rejected

- **WHEN** the engine's params check receives `{ n: 1 }`, or `{ w: 2, n: 3 }`,
  or a negative `movetarget`
- **THEN** it returns a non-null human-readable reason

### Requirement: Twiddle has no mistake check and no hint

The game SHALL NOT provide a `findMistakes` hook, because every reachable
position is legal. It SHALL NOT provide a `hint` hook.

#### Scenario: Neither hook is present

- **WHEN** the registered `twiddle` game is inspected
- **THEN** it has no `findMistakes` and no `hint`

### Requirement: Twiddle rotation and solve moves transform state purely

A `TwiddleMove` SHALL be either a rotation carrying the top-left corner of the
`n×n` region and a direction, `{ type: "rotate", x, y, dir: 1 | -1 }`, or a
solve, `{ type: "solve" }`. `executeMove` SHALL be pure, returning a new state.
A rotation SHALL turn the `n×n` block 90° in `dir`, SHALL advance the
orientation of each tile in it when `orientable`, and SHALL increment the move
count.

#### Scenario: A rotation turns the block and is reversible

- **WHEN** a `dir +1` rotation executes on a block, then a `dir −1` rotation
  executes on the same block
- **THEN** the grid returns to its original arrangement, the source states are
  unmutated, and the move count increased by one per rotation

#### Scenario: Orientation matters in orientable mode

- **WHEN** the game is `orientable` and a rotation executes
- **THEN** each moved tile's orientation advances by the rotation direction
  (mod 4), and the board is reported complete only when the numbers are ordered
  **and** every tile is upright

### Requirement: A click rotates the block centered on it

`interpretMove` SHALL convert a left or right click to a rotation by offsetting
the click by `(n−1)/2` tiles, so that it selects the region centered on the
click, and mapping the result to grid coordinates. It SHALL reject a click
whose region falls outside `0 ≤ x ≤ w−n`, `0 ≤ y ≤ h−n`. A left-click SHALL
rotate `dir +1` and a right-click `dir −1`.

#### Scenario: Click geometry constrains legal rotations

- **WHEN** a click selects a region that would extend past the grid edge
  (its top-left corner outside `0 ≤ x ≤ w−n`, `0 ≤ y ≤ h−n`)
- **THEN** no move is produced

### Requirement: The Twiddle cursor moves over the rotation origins

Cursor keys SHALL move a cursor over the `(w−n+1)×(h−n+1)` space of rotation
origins, clamped at the edges without wrapping, and SHALL return a UI update.
`CURSOR_SELECT` SHALL rotate the cursor's block `dir +1` and `CURSOR_SELECT2`
`dir −1`. A select pressed while the cursor is hidden SHALL only reveal it.

#### Scenario: A first select reveals the cursor

- **WHEN** `CURSOR_SELECT` is pressed while the cursor is hidden
- **THEN** the cursor becomes visible and no rotation is produced

### Requirement: Letter and numpad keys rotate fixed blocks

The letters `a`, `b`, `c` and `d` SHALL each rotate one corner block `dir +1`,
and the shifted `A`, `B`, `C` and `D` SHALL rotate the same block `dir −1`. The
numpad digits SHALL also produce rotations: a corner digit rotates its corner
block, and an edge digit or the center digit rotates the block midway along
that edge or at the center only when the parity of `w−n` and `h−n` puts a block
exactly there.

#### Scenario: A capital turns the corner back

- **WHEN** `a` is pressed and then `A`
- **THEN** the top-left block rotates `dir +1` and then `dir −1`

#### Scenario: An edge digit needs a block midway

- **WHEN** `w−n` is even and numpad `8` is pressed
- **THEN** the block at `((w−n)/2, 0)` rotates `dir +1`

### Requirement: Solve replaces the grid with the solved arrangement

A solve move SHALL replace the grid with the solved arrangement, SHALL clear
every orientation, and SHALL count as one move.

#### Scenario: Solve snaps to the solved board

- **WHEN** the solve move executes
- **THEN** the new state is the solved arrangement with cleared orientations and
  the move count one higher, and the completion flash is suppressed on the
  following redraw

### Requirement: Twiddle state keeps no record of completion or of the solver

The state SHALL keep no record of completion or of the solver: the board is
solved exactly while it is in the solved arrangement. The engine SHALL be what
records that Solve was used and what suppresses the completion flash for the
Solve command.

#### Scenario: A solved board turned again is unsolved

- **WHEN** a rotation executes on a board in the solved arrangement and leaves
  it out of order
- **THEN** the state reports a not-completed status

### Requirement: Twiddle draws a recessed border and beveled numbered tiles

The Twiddle `redraw` SHALL draw a recessed beveled border once, and then each
tile as a beveled square with its number centered and, when `orientable`, an
orientation triangle.

#### Scenario: First draw emits the border and numbered tiles

- **WHEN** `redraw` runs against a recording `GameDrawing` double for a fresh
  board
- **THEN** the recorded operations include the recessed border and one beveled
  tile with its number for each cell

### Requirement: A Twiddle tile is repainted only when it changed

`redraw` SHALL maintain a per-tile cache, so that a tile is repainted only when
its number or orientation changed, it lies within an animating block, the
cursor moved onto or off it, or the flash background changed.

#### Scenario: An unchanged board repaints nothing

- **WHEN** `redraw` runs a second time on the same state, with the cursor
  unmoved and no animation or flash
- **THEN** no tile is drawn

### Requirement: A rotation animates the block turning about its center

A rotation SHALL animate the `n×n` block turning 90° about its center, over an
animation duration proportional to `sqrt(n−1)`. The four bevel edges of each
turning tile SHALL be recolored through the rotation. Tiles outside the block
SHALL draw normally.

#### Scenario: A rotation animates the block

- **WHEN** a rotation move has just executed and `redraw` runs mid-animation
- **THEN** the tiles inside the rotated block are drawn at coordinates rotated
  about the block center (and settle on their final cells at animation end),
  while tiles outside the block are drawn unrotated

### Requirement: Only a genuine completion flashes the background

A completion reached by the player's own rotation SHALL flash the background.
A completion reached by a solve SHALL NOT.

#### Scenario: Completion flashes only on a genuine win

- **WHEN** the board reaches the solved arrangement by a player rotation
- **THEN** the redraw flashes the background for the flash duration
- **AND** when the board is solved via the solve move, no flash occurs

### Requirement: The Twiddle cursor outlines its block

When the cursor is visible, its `n×n` region SHALL be outlined with
cursor-colored bevel edges.

#### Scenario: The cursor's block is outlined

- **WHEN** the cursor is visible on a block and the board is drawn at rest
- **THEN** the bevel edges along that block's four sides are outlined in the
  cursor color, and no other tile's are

### Requirement: The Twiddle status bar shows a move count that never resets

The status bar SHALL show the move count, which never freezes and never resets,
with the `(target K)` suffix when a move target is set. The count SHALL follow
the engine's completion words: `COMPLETED!` when solved, and `Auto-solved.` or
`Auto-solver used.` once Solve was used.

#### Scenario: The count keeps running after a win

- **WHEN** a rotation executes on a board that is already solved
- **THEN** the move count shown is one higher than before

### Requirement: A Twiddle tile stands off the well it turns in

`redraw` SHALL draw a tile's face as the collection's lifted surface inside its
bevel, and what a turning block uncovers as the collection's cell surface, so a
tile is told from the well by more than its bevel in both schemes. The tile
keeps its bevel: it is an object the player moves. Color 0 stays the board.

#### Scenario: A tile is not the board's gray

- **WHEN** a board is drawn at rest in either scheme
- **THEN** every tile's face is the lifted surface

#### Scenario: A turning block shows the well

- **WHEN** a block is drawn part of the way through its turn
- **THEN** the corners it uncovers are the cell surface
