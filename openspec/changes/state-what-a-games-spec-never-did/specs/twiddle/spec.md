## ADDED Requirements

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
`mK` in any order after that. It SHALL skip a character it does not know, and
SHALL read `n0` as a block of 2.

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

## MODIFIED Requirements

### Requirement: The Twiddle status bar shows a move count that never resets

The status bar SHALL show the move count, which never freezes and never resets,
with the `(target K)` suffix when a move target is set. It SHALL read
`Moves: N`, or `Moves: N (target K)`.

#### Scenario: The count keeps running after a win

- **WHEN** a rotation executes on a board that is already solved
- **THEN** the move count shown is one higher than before
