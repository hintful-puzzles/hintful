## ADDED Requirements

### Requirement: Solo's givens are numbers, with a letter for each run of empty cells

The givens section SHALL write the cells in reading order: a given as its
decimal number, from 1 to the grid's size, and a run of empty cells as a
letter, `a` for 1 to `z` for 26, a longer run as `z`s and then a letter for
the rest. `_` SHALL separate two givens with no empty cell between them.
`newState` SHALL refuse a number out of that range, a `_` anywhere else, and
a run letter straight after another that is not `z`.

#### Scenario: A dealt 6 by 6 board

- **WHEN** `2_5d1c4d3_2b6_2d2c3d1_5` is loaded on a `2x3` board
- **THEN** the top row is 2, 5 and four empty cells, and the second row is 1,
  three empty cells, 4 and an empty cell

#### Scenario: A separator left out

- **WHEN** the same description is loaded with its opening `2_5` written `25`
- **THEN** it is refused as holding a number out of range for its board

### Requirement: Solo's blocks and cages are written as runs between borders

A block or cage section SHALL list the sides cells share: first those between
cells side by side, row by row, then those between a cell and the one below,
column by column. `a` to `y` SHALL stand for 1 to 25 sides with no border and
then a border, `_` for a border straight after the last, and `z` for 25 sides
with no border after them. The section's last border SHALL stand one past the
grid's last side, where no side is.

#### Scenario: A jigsaw's top row

- **WHEN** the board `9jda:6c5a2d7_2b1e3f5d3_7a8g7a4_3d1f5e1b3_7d9a6c2,cacababaea______bdab_abdb_cdbba__a_d_bcaadbdba__a__dcbca`
  is loaded
- **THEN** its blocks section opens `cac`: the first four cells of the top row
  are in one block, the next two in a second, and the last three in a third
- **AND** the third `c`'s last side is the first of the second row, whose
  first two cells are in one block

### Requirement: Solo refuses blocks and cages of the wrong number or size

A jigsaw's blocks SHALL number the grid's size, each of that many cells. A
killer's cages SHALL number at least the grid's size and at most its cells,
each of 2 cells up to the grid's size. `newState` SHALL refuse any other
division with the game's own sentence, "This game ID divides its board into
the wrong number or sizes of blocks or cages."

#### Scenario: A cage of one cell

- **WHEN** the killer board whose cages section opens `___a__a` is loaded
  with the first `a`, which joins the fourth and fifth cells of the top row,
  written `__`
- **THEN** each of the two cells is a cage of its own, and the description is
  refused with that sentence

### Requirement: Solo refuses a description with a section too many or too few

A description SHALL hold the givens alone on a board that is neither jigsaw
nor killer, and `newState` SHALL refuse one that goes on past them. It SHALL
refuse a jigsaw's description with no blocks section, and a killer's with no
cages section or no sums section.

#### Scenario: A plain board with a comma after its givens

- **WHEN** `2_5d1c4d3_2b6_2d2c3d1_5` is loaded on a `2x3` board with a `,`
  added at its end
- **THEN** it is refused as too long for its board

#### Scenario: A killer board with no cages

- **WHEN** `zzzc`, the givens section of a 9 by 9 killer board, is loaded on
  a `3x3ka` board with nothing after it
- **THEN** it is refused as too short for its board

### Requirement: A killer cage's sum is written at one of its cells

The sums section SHALL be read as the givens are, over the same cells: a
number at a cell is the sum of the cage that cell lies in, and an empty cell
carries none. A sum SHALL be from 1 to the most the grid's digits make with
no repeat, 45 on a 9 by 9 grid, and `newState` SHALL refuse one outside that.
`newDesc` SHALL write one sum a cage, at its first cell in reading order.

#### Scenario: The sums of a dealt killer board

- **WHEN** a `3x3ka` board is loaded whose givens section is `zzzc` and whose
  sums section opens `15_14_8_8a5`
- **THEN** it has no givens, the first four cells of the top row carry the
  sums 15, 14, 8 and 8, and the fifth carries none, being the second cell of
  the fourth's cage

### Requirement: Solo's killer difficulty is in no params string

Neither form of the params string and no field of the Custom dialog SHALL
carry the killer-cage difficulty: `encodeParams` writes none, and
`decodeParams` reads none and gives the highest.

#### Scenario: The Killer preset

- **WHEN** the preset `3x3ka` is decoded
- **THEN** its killer difficulty is the highest, its `a` is the symmetry,
  none, and nothing in the string names the killer difficulty
- **AND** its short form is `3x3k`

### Requirement: Solo types the numbers past 9 as letters

On a grid of more than 9 numbers the keys `a`, `b` and so on, in either
case, SHALL enter 10, 11 and so on, up to the grid's size. On a grid of 22
numbers or more `M` SHALL enter 22 in a highlighted cell, and SHALL be
Mark-all only while no cell is highlighted.

#### Scenario: Twelve on a 12 by 12 grid

- **WHEN** an empty cell of a `3x4` board is highlighted and `c` or `C` is
  pressed
- **THEN** 12 is entered in it
- **AND** `M` fills in the pencil marks, 22 being past the grid's size

### Requirement: Solo's hint uses no technique above the board's tier

The hint's deduction SHALL be capped at the tier in the board's params, and
at Extreme on an Unreasonable board, so that a step is always one the board's
tier promises the player.

#### Scenario: An Easy board is hinted with Easy's techniques

- **WHEN** a hint is asked on a board dealt at Easy, at any position without
  a mistake
- **THEN** no step of the plan is an intersection, a set or a chain

## MODIFIED Requirements

### Requirement: Solo decodes its parameters leniently

`decodeParams` SHALL be lenient, ignoring unknown characters. It SHALL accept
the legacy `"{c}x{r}j"` form, in which a `j` after a seen `r` collapses the
rectangle to a jigsaw of edge `c·r`, and SHALL round-trip the preset list. A
leading number with no `x` after it SHALL be read as both `c` and `r`. A `d`
followed by no tier letter SHALL leave the difficulty at Easy, and `r2` SHALL
be read as the default symmetry.

#### Scenario: The legacy jigsaw form is read

- **WHEN** `3x3j` is decoded
- **THEN** the params are a jigsaw of edge 9: `c === 9` and `r === 1`

#### Scenario: A jigsaw's one number

- **WHEN** the preset `9jdb` is decoded
- **THEN** the `9` is read as both `c` and `r`, and the `j`, coming after no
  `x`, sets `r` to 1 and leaves `c` at 9
