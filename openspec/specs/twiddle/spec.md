# twiddle Specification

## Purpose
Twiddle, the puzzle of rotating square sections of the grid until the tiles
stand in order from the top left and, in orientable mode, the right way up:
what counts as solved, its params encoding, what a rotation and a Solve do, its
click, cursor and fixed-block keys, and the look of its tiles, its turning
block, its well and its completion flash.

## Requirements

### Requirement: Twiddle is solved when its tiles read in order

Twiddle SHALL be a `w×h` grid of numbered tiles, solved when the tile numbers
read in non-decreasing row-major order and, when `orientable`, every tile is
upright. A generated board SHALL be a scramble of the solved arrangement by
rotations, and SHALL NOT itself be solved. The game SHALL provide
`statusbarText`, `solve` and `textFormat`.

#### Scenario: A generated board is scrambled and starts unsolved

- **WHEN** a new game is created from any valid params
- **THEN** the grid is a scramble of the solved arrangement that is not itself
  the solved arrangement, and reports a not-completed status
- **AND** generation terminates for every preset

### Requirement: Twiddle params are written WxHnN with trailing flags

Twiddle's params SHALL be `w`, `h`, `n` (the rotating block's size),
`rowsonly`, `orientable` and `movetarget`. They SHALL be encoded as `WxHnN`
followed by `r` when `rowsonly`, `o` when `orientable`, and `mK` when a shuffle
target `K` is set. A bare `W` SHALL decode as a square `W×W` board, and a
missing `nN` as `n = 2`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 4, h: 4, n: 3, rowsonly: false, orientable: false, movetarget: 0 }` are encoded
- **THEN** the result is `4x4n3`
- **AND** decoding `4x4n3`, `4n3` (square shorthand), and `4x4n3o` all round-trip
  to the corresponding params, with `o` setting `orientable`

### Requirement: Twiddle refuses a board smaller than its block

`validateParams` SHALL reject `w < n`, `h < n` and an unreasonably large `w·h`,
each with a human-readable reason.

#### Scenario: A board narrower than its block is rejected

- **WHEN** the engine's params check receives `{ w: 2, n: 3 }`
- **THEN** it returns a non-null human-readable reason

### Requirement: A rotation turns the block and its tiles

A rotation SHALL turn the `n×n` block whose top-left corner it names 90° in
its direction, SHALL advance the orientation of each tile in the block when
`orientable`, and SHALL increment the move count.

#### Scenario: A rotation turns the block and is reversible

- **WHEN** a `dir +1` rotation executes on a block, then a `dir −1` rotation
  executes on the same block
- **THEN** the grid returns to its original arrangement, and the move count
  increased by one per rotation

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
rotate anticlockwise (`dir +1`) and a right-click clockwise (`dir −1`).

#### Scenario: Click geometry constrains legal rotations

- **WHEN** a click selects a region that would extend past the grid edge
  (its top-left corner outside `0 ≤ x ≤ w−n`, `0 ≤ y ≤ h−n`)
- **THEN** no move is produced

### Requirement: The Twiddle cursor moves over the rotation origins

Cursor keys SHALL move a cursor over the `(w−n+1)×(h−n+1)` space of rotation
origins, clamped at the edges without wrapping. When the cursor is visible, its
`n×n` block SHALL be outlined with cursor-colored bevel edges.

#### Scenario: The cursor's block is outlined

- **WHEN** the cursor is visible on a block and the board is drawn at rest
- **THEN** the bevel edges along that block's four sides are outlined in the
  cursor color, and no other tile's are

### Requirement: Letter and numpad keys rotate fixed blocks

The letters `a`, `b`, `c` and `d` SHALL each rotate one corner block anticlockwise (`dir +1`),
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
  the move count one higher

### Requirement: Twiddle draws a recessed border and beveled numbered tiles

The Twiddle `redraw` SHALL draw a recessed beveled border, and each tile as a
beveled square with its number centered and, when `orientable`, an orientation
triangle.

#### Scenario: First draw emits the border and numbered tiles

- **WHEN** `redraw` runs against a recording `GameDrawing` double for a fresh
  board
- **THEN** the recorded operations include the recessed border and one beveled
  tile with its number for each cell

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

### Requirement: The Twiddle status bar shows a move count that never resets

The status bar SHALL show the move count, which never freezes and never resets,
with the `(target K)` suffix when a move target is set. It SHALL read
`Moves: N`, or `Moves: N (target K)`.

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

### Requirement: Twiddle descriptions list the tiles in reading order

The desc SHALL give each tile's number in reading order. Without `orientable`
the numbers SHALL be separated by commas. With it each number SHALL be followed
by the way the tile's top points, `u` for up, `l` for left, `d` for down and
`r` for right, with no commas. The numbers SHALL be those of the solved board:
`1` to `w·h` once each, or with `rowsonly` `1` to `h`, each `w` times, every
tile of a row carrying the row's number.

#### Scenario: One number to a row

- **WHEN** `3,1,3,1,1,2,2,3,2` is read for the params `3x3n2r`
- **THEN** the rows read 3 1 3, then 1 1 2, then 2 3 2: three tiles of each
  row's number, shuffled

#### Scenario: A board whose tiles show their turns

- **WHEN** `1d2d3u4u` is read for the params `2x2n2o`
- **THEN** the tiles stand in order, 1 and 2 upside down and 3 and 4 upright,
  so the board is not solved

### Requirement: A malformed Twiddle description is refused

Reading a description SHALL refuse a number outside the solved board's range, a
number given more often than the solved board holds it, too few or too many
tiles, and a character out of place: a letter where orientation does not
matter, and where it does a comma or a letter other than `u`, `l`, `d` and `r`.

#### Scenario: A number the board does not hold

- **WHEN** `3,1,3,1,1,2,2,3,2` is read for `3x3n2r` with its last number
  changed to 4, and again with it changed to 3
- **THEN** the first is refused as out of range, and the second as repeating a
  number, since it holds four 3s

#### Scenario: The same numbers without one number to a row

- **WHEN** `3,1,3,1,1,2,2,3,2` is read for the params `3x3n2`
- **THEN** it is refused as repeating a number, since that board holds each of
  1 to 9 once

### Requirement: Twiddle refuses a board no turns can put in order

`hasNoSolution` SHALL say yes of a board that breaks what every turn keeps.
Under a block of odd side that is how many tiles of each number stand on each
checkerboard color. Under one of even side, with `orientable`, it is that
color taken with the tile's quarter turns, and the turns' sum modulo four. Where no number repeats
and the side is not two more than a multiple of four, it is the arrangement's
parity. A board that passes may still be out of reach.

#### Scenario: Two tiles swapped under a block the size of the board

- **WHEN** the game ID `3x3n3:2,1,3,4,5,6,7,8,9` is opened
- **THEN** it is refused as having no solution: 1 and 2 have each left their
  color

#### Scenario: A swap a 2×2 block can undo

- **WHEN** `3,2,1,4,5,6,7,8,9` is read for the params `3x3n2`
- **THEN** `hasNoSolution` says no, since a quarter turn of four tiles is an
  odd permutation and no tile's color is kept

#### Scenario: Turns that do not add up

- **WHEN** `1d2u3u4u` and `1d2d3u4u` are read for the params `2x2n2o`
- **THEN** the first has no solution, its turns adding up to two, and the
  second, whose turns add up to four, is not refused

### Requirement: Twiddle's short params are its full ones

`encodeParams` SHALL write the same string with and without `full`, the shuffle
target included, because the status bar reports progress against it.
`decodeParams` SHALL read `nN` only directly after the size, and `r`, `o` and
`mK` in any order after that. It SHALL refuse a character it does not know,
and SHALL read `n0` as a block of 2.

#### Scenario: A shuffle target survives the short form

- **WHEN** `3x3n3m20` is decoded and encoded again with `full` false
- **THEN** the result is `3x3n3m20`: a 3×3 board turned as one block, shuffled
  by 20 turns

#### Scenario: Both flags

- **WHEN** `4x4n2ro` is decoded
- **THEN** the board is 4×4 with a 2×2 block, one number to a row, and tiles
  that show their turns

### Requirement: Twiddle's block is at least two squares wide

The block size SHALL declare a lower bound of 2 in `paramConfig`, and the
shuffle count a lower bound of 0, which the engine's params check refuses
below.

#### Scenario: A block of one square

- **WHEN** the params string `4x4n3` has its block size changed to 1 and goes
  through the engine's params check
- **THEN** it is refused with "Rotating block size must be at least 2."

### Requirement: Each Twiddle letter and keypad digit has its block

`a` and keypad `7` SHALL turn the top-left block, `b` and `9` the top-right,
`c` and `1` the bottom-left, and `d` and `3` the bottom-right. Keypad `8`, `2`,
`4` and `6` SHALL turn the block midway along the top, bottom, left and right
edge, and `5` the center block. A keypad digit SHALL turn anticlockwise only,
and a digit typed off the keypad SHALL do nothing. Each of these keys SHALL act
wherever the cursor is, shown or not.

#### Scenario: The corners of a board with four blocks

- **WHEN** keypad `9` and then `c` are pressed on a 4×4 board with a 3×3 block
- **THEN** the block whose top-left square is in the second column of the top
  row turns anticlockwise, and then the one whose top-left square is in the
  first column of the second row

#### Scenario: No block sits midway

- **WHEN** keypad `8` is pressed on that board
- **THEN** nothing turns, there being two blocks along the top edge and none
  between them

### Requirement: A Twiddle title names what departs from the basic game

A board's label SHALL be its size, followed by `rows only` when `rowsonly`, by
`orientable` when `orientable`, by `rotating NxN blocks` when the block is not
2×2, and by `K shuffles` when a shuffle target is set. A board with none of
these SHALL be labeled by its size alone.

#### Scenario: The Type menu's boards

- **WHEN** the params `3x3n2r`, `3x3n2` and `4x4n3` are labeled
- **THEN** they read "3x3 rows only", "3x3" and "4x4, rotating 3x3 blocks"

#### Scenario: A shuffle target

- **WHEN** the params `3x3n3m20` are labeled
- **THEN** the label reads "3x3, rotating 3x3 blocks, 20 shuffles"

### Requirement: The Twiddle completion flash lights each tile's face

The completion flash SHALL sweep the tiles diagonally, a tile's position being
its place in the grid. A lit tile's face SHALL be filled with a flash color
inside its bevel, and SHALL keep its number and its orientation mark.

#### Scenario: The flash leaves a tile

- **WHEN** the flash has passed a tile
- **THEN** that tile alone is repainted, with its own face
