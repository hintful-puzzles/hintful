# solo Specification

## Purpose
Solo, the Sudoku family: fill a `cr × cr` grid (`cr = c·r`) so that each digit
`1..cr` appears once in every row, column and block, in variants that add
jigsaw blocks, killer cages or X diagonals, alone or combined. This spec holds
what is Solo's own: its encodings, its graded solver and generator, its look,
its preferences and its hint's techniques and words. What Solo shares with
every note-taking game is in `engine-notes`, and what its hint shares with
every candidate-elimination hint is in `engine-candidate-hints`.

## Requirements

### Requirement: Rules: Solo's four variants compose

Solo SHALL be played from its description alone (`described-fill-game`):
its blocks a ruleset, **Standard** (rectangles cut by the board's two sizes)
or **Jigsaw** (blocks one square wide, dealt as connected parts of equal
size), and two modifiers of either, **X** (the two long diagonals are units
too) and **Killer** (a second partition of cages, each with its total, that
no number repeats in). There SHALL be two difficulty scales: the tiers, and
the killer scale its cage readings grade on.

#### Scenario: Variants are served from one registered game

- **WHEN** a Standard, Jigsaw, X or Killer Solo board is requested
- **THEN** the same registered `solo` game deals a playable board for it
- **AND** a Jigsaw board has irregular blocks while a Standard board has
  rectangular ones
- **AND** an X board also holds every number once on each long diagonal, and
  a Killer board carries its cages and their totals

### Requirement: Rules: Solo is solved when every region holds every digit

`status` SHALL report a board solved when every row, every column and every
block holds every number, each long diagonal does too on an X board, and on a
Killer board no cage repeats a number and every cage makes its total. The
check SHALL read the board's own space: the blocks its sizes cut or its deal
divided, and the diagonals only where X is on.

#### Scenario: The last placement solves the board

- **WHEN** a placement fills the grid with no rule broken
- **THEN** `status` reports the board solved

#### Scenario: A board without X has no diagonal rule

- **WHEN** two equal numbers stand on a long diagonal of a Standard board,
  in different rows, columns and blocks
- **THEN** no rule is broken

### Requirement: Rules: Solo checks entries and notes against the answer its givens and cage sums fix

Solo's `findMistakes` SHALL be the collection's check of entries and notes
(`ts-engine`, "A mistake check compares with the one answer, hidden or not"
and "A candidate note that excludes the answer is a mistake"), against the
answer its solver reaches from the given cells and, on a killer board, the
cage sums.

#### Scenario: A killer board, which has no givens

- **WHEN** the player enters a digit in a cell of a dealt killer board that is
  not the one the cage sums leave that cell
- **THEN** `findMistakes` includes that cell, though no given says so

### Requirement: Params: Solo encodes and decodes its parameters

`encodeParams` SHALL write `"{c}x{r}"`, or `"{c}j"` for a Jigsaw, then `"x"`
for X and `"k"` for Killer. In *full* form it SHALL append the symmetry
(`a`, `r4`, `m2`, `md2`, `m4`, `md4` or `m8`, with the default 2-way
rotation unwritten) and the tier (`dt`, `db`, `di`, `da`, `de` or `du`). The
Easy tier's `dt` SHALL be written, where upstream leaves it out; upstream
reads both.

#### Scenario: Params round-trip across variants

- **WHEN** Standard, Jigsaw, X and Killer params are encoded with
  `full = true` and decoded
- **THEN** each decodes back to the original params, `3x3` to `3x3dt`
- **AND** the brief encoding omits the symmetry and the tier

### Requirement: Params: Solo reads the legacy jigsaw form and a single leading number

`decodeParams` SHALL accept the legacy `"{c}x{r}j"` form, in which a `j` after
a seen `r` collapses the rectangle to a jigsaw of edge `c·r`. A leading
number with no `x` after it SHALL be read as both `c` and `r`, and `r2` SHALL
be read as the default symmetry. A symmetry code the encoder does not write
SHALL be refused.

#### Scenario: A symmetry of an order the game does not have

- **WHEN** `3x3m3`, `3x3r7` or `3x3a5` is decoded
- **THEN** each is refused, and none is read as the default symmetry

#### Scenario: The legacy jigsaw form is read

- **WHEN** `3x3j` is decoded
- **THEN** the params are a jigsaw of edge 9: `c === 9` and `r === 1`

#### Scenario: A jigsaw's one number

- **WHEN** the preset `9jdb` is decoded
- **THEN** the `9` is read as both `c` and `r`, and the `j`, coming after no
  `x`, sets `r` to 1 and leaves `c` at 9

### Requirement: Params: Solo refuses parameters outside its bounds

When a board is to be dealt, Solo SHALL refuse a grid of more than 31
numbers, blocks fewer than 2 wide that are not a Jigsaw, a Killer grid of more
than 9 numbers or fewer than 3, and an X grid of fewer than 4, each in the
sentence its bound's place gives. It SHALL refuse every tier above Easy on a
grid of 4 numbers or fewer, in the collection's sentence for a size that has
no board of the tier.

#### Scenario: Invalid params are rejected

- **WHEN** `4x3k` or `6x6` is to be dealt
- **THEN** it is refused: "Killer (digit sums): width and height must both
  be at most 9." or "Width and height must both be at most 31."

#### Scenario: A tiny grid has only its easy tiers

- **WHEN** a 2x2 board, a 4 Jigsaw or a 2x2 Killer is asked for at Normal
- **THEN** it is refused: "No 4x4 puzzle is Normal."
- **AND** the same params at Easy are dealt

### Requirement: Params: Solo's killer difficulty is in no params string

Neither form of the params string and no field of the Custom dialog SHALL
carry the killer-cage difficulty: `encodeParams` writes none, and
`decodeParams` reads none and gives the highest.

#### Scenario: The Killer preset

- **WHEN** the preset `3x3ka` is decoded
- **THEN** its killer difficulty is the highest, its `a` is the symmetry,
  none, and nothing in the string names the killer difficulty
- **AND** its short form is `3x3k`

### Requirement: Params: Solo's game modes are Standard and Jigsaw

Solo SHALL offer the shape of its blocks as a ruleset, Standard or Jigsaw,
read from the params (`r === 1` is a jigsaw), so that a game ID is written as
before. Choosing Standard on a jigsaw board SHALL give it the squarest
rectangular blocks of its order, and a prime order stays a jigsaw. X and
Killer SHALL stay modifiers of either.

#### Scenario: A jigsaw board's label

- **WHEN** a 9×9 jigsaw board with the diagonals is labeled
- **THEN** the label starts "Jigsaw: 9x9 X"

### Requirement: Description: Solo descriptions encode givens, block structure, and killer cages

The desc SHALL begin with the **givens grid** (run-length blank/digit
encoding). For a **jigsaw** board (`r === 1`) it SHALL append `","` and the
**block-structure** encoding (run-length internal-edge encoding, transposed
read order). For a **killer** board it SHALL append `","` and the **cage
block-structure**, then `","` and the **cage-sum grid** encoding.

#### Scenario: Description round-trips through generate and decode

- **WHEN** a board (of any variant) is generated and its desc decoded by
  `newState`
- **THEN** the givens, block partition, and (for killer) the cage partition and
  sums match what was encoded
- **AND** non-given cells start empty with no pencil marks

### Requirement: Description: Solo's givens are numbers, with a letter for each run of empty cells

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

### Requirement: Description: Solo's blocks and cages are written as runs between borders

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

### Requirement: Description: Solo refuses blocks and cages of the wrong number or size

A Jigsaw's blocks SHALL number the grid's size, each of that many cells. A
Killer's cages SHALL each hold 2 cells or more. Any other division SHALL be
refused as a game ID not laid out the way this puzzle's are.

#### Scenario: A cage of one cell

- **WHEN** the Killer board whose cages section opens `___a__a` is loaded
  with the first `a`, which joins the fourth and fifth cells of the top row,
  written `__`
- **THEN** it is refused as not laid out the way this puzzle's game IDs are

### Requirement: Description: Solo refuses a description with a section too many or too few

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

### Requirement: Description: A killer cage's sum is written at one of its cells

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

### Requirement: Description: Solo refuses a killer cage with no sum or with two

A Killer description whose sums section gives some cage no sum, or more than
one, SHALL be refused as not laid out the way this puzzle's game IDs are. A
sum SHALL be read anywhere in its cage, as upstream reads it, and written at
the cage's first cell in reading order.

#### Scenario: Two sums in one cage

- **WHEN** a `3x3ka` description's sums section opens `15_14_8_8_8_5`, the
  fifth cell being the second cell of the fourth's cage
- **THEN** it is refused

#### Scenario: A cage with no sum

- **WHEN** a `3x3ka` description's sums section opens `a14` where the first
  cell begins a cage
- **THEN** it is refused

### Requirement: Generation: Solo builds a full grid under every active constraint

A board's answer SHALL be searched under its blocks and, on a Killer board,
its cages, which the deal divides first: a Jigsaw's blocks into connected
parts as large as a row, and the cages into dominoes and then parts of up to
three cells. Every cage's total SHALL be its answer's sum.

#### Scenario: A board with the diagonals and cages both

- **WHEN** a board is dealt with X and Killer both on
- **THEN** its answer holds every number once on each long diagonal and
  repeats none in a cage, as well as in each row, column and block

### Requirement: Generation: Givens are removed in symmetry orbits

A board without Killer SHALL start from every square's number given and hide
each with the rest of its orbit under the symmetry asked for, keeping a hide
only while the board's tier still finishes it. A Killer board SHALL show no
given, and SHALL need its killer scale's top as well as the tier asked for.

#### Scenario: The givens keep the symmetry asked for

- **WHEN** a board is dealt with 4-way rotation
- **THEN** its pattern of givens is unchanged by a quarter turn

### Requirement: Solver: Each rung is graded on its own scale

Each technique SHALL carry its tier on its own scale, the tiers or the killer
scale, as the description's `scales` place it; a ladder SHALL hold only the
techniques both caps admit, and a technique that fires SHALL raise its own
scale's grade. Killer's techniques SHALL be in the ladder of a board with
Killer on alone.

#### Scenario: A rung over its cap is left out

- **WHEN** a Killer board is solved with the killer cap below the region
  rule's tier
- **THEN** the ladder holds no region rule and no reading of the partial
  cages it works out, and the killer grade reported does not exceed the cap

#### Scenario: A board without Killer has no cage reading

- **WHEN** a hint is asked on a Standard board
- **THEN** no step reads a cage, and the walk runs on the techniques its
  ladder holds

### Requirement: Solver: A killer region left nothing is a contradiction

A killer region whose filled cells and whole cages leave nothing for its open
cells SHALL be a contradiction.

#### Scenario: A region left nothing is not a solve

- **WHEN** a killer board with stray digits is searched and a region's filled
  cells and whole cages already make its total with cells still open
- **THEN** the solver reports the board impossible, not solved with an
  unfinished grid

### Requirement: Solver: Solo weighs a wing at Extreme

Solo's solver SHALL apply the wing at Extreme, as its `wing` rung after the
single-digit set: two cells see each other when they share a row, column,
block or, on an X board, diagonal, and a Killer cage is not counted. It SHALL
strike one cell a firing.

#### Scenario: A wing reads a block

- **WHEN** a cell's candidates are 2, 4 and 8, a cell of its block is down to
  2 and 8, a cell of its column is down to 2 and 4, and a fourth cell sees all
  three
- **THEN** capped at Extreme the solver strikes 2 from the fourth cell

### Requirement: Controls: Solo interprets digit, pencil, and mark-all input

A digit key `1..cr` SHALL enter that digit in the highlighted non-given cell
or, in pencil mode, toggle that pencil mark in the highlighted empty cell;
backspace or space SHALL clear the cell. Mark-all's cleanup SHALL strike a
placed digit over the same no-repeat regions auto-pencil strikes it from.

#### Scenario: Placing and penciling digits

- **WHEN** a non-given cell is highlighted and a digit key is pressed
- **THEN** `interpretMove` yields a `set` move that places (or, in pencil mode,
  toggles the pencil mark of) that digit

### Requirement: Controls: Solo types the numbers past 9 as letters

On a grid of more than 9 numbers the keys `a`, `b` and so on, in either
case, SHALL enter 10, 11 and so on, up to the grid's size. On a grid of 22
numbers or more `M` SHALL enter 22 in a highlighted cell and SHALL never be
Mark-all, which is then the control's alone.

#### Scenario: Twelve on a 12 by 12 grid

- **WHEN** an empty cell of a `3x4` board is highlighted and `c` or `C` is
  pressed
- **THEN** 12 is entered in it

### Requirement: Preferences: Auto-pencil strikes a placed digit from its no-repeat regions

With auto-pencil enabled, a real placement SHALL additionally strike that digit
from the pencil marks of every other cell sharing one of its no-repeat regions:
its row, column and sub-block, each main diagonal it lies on under X, and its
cage under Killer.

#### Scenario: A placement clears a cage-mate's note

- **WHEN** auto-pencil is on and a digit is placed in a cell of a killer board
- **THEN** that digit leaves the pencil marks of the other cells of its cage, as
  well as of its row, column and sub-block

### Requirement: Preferences: The auto-pencil label names the relation, not the regions

The auto-pencil label SHALL name the **relation** rather than list the regions:
"When you place a number, remove it from the pencil marks it rules out". Which
regions a Solo board has depends on its mode and `prefs` cannot see the params,
so any list is true of some Solo boards and false of others.

#### Scenario: The auto-pencil label holds on every mode

- **WHEN** the preferences dialog is opened on a plain, an X and a Killer board
- **THEN** the auto-pencil label reads the same and is true of all three, naming no region the board has not got and omitting none it has

### Requirement: Hint: Solo's hint is the candidate walk's, started on the implicit reading

Solo's hint SHALL be the candidate walk of its description
(`engine-candidate-hints`): each technique a step can teach a rung, its words
its `says`, at the board's tiers on both scales, on the implicit reading of a
cell with no notes. A wording that names a unit SHALL name it by the board's
unit holding the cells: row, column, block or diagonal.

#### Scenario: Nothing is filled in under Solo's own reading

- **WHEN** the player asks for a hint on a board with no pencil notes,
  without having changed how hints pencil in
- **THEN** no step of the plan is the fill-all move

#### Scenario: A killer technique past the board's killer tier

- **WHEN** a hint is asked on a board whose killer cap is below the region
  rule
- **THEN** no step of the plan places or strikes by what a row, column or
  block leaves

#### Scenario: A cell every other number is ruled out of

- **WHEN** the next step places the only number a cell's row, column and
  block leave it on a Standard board
- **THEN** it says "Every other number is already in this cell's row, column
  or block, so it can only be" that number

### Requirement: Hint: Solo's hint uses no technique above the board's tier

On a board below Unreasonable the hint's deduction SHALL be capped at the tier
in the board's params, so that a step is always one the board's tier promises
the player.

#### Scenario: An Easy board is hinted with Easy's techniques

- **WHEN** a hint is asked on a board dealt at Easy, at any position without
  a mistake
- **THEN** no step of the plan is an intersection, a set or a chain

### Requirement: Look: Solo draws its cages, digits, pencil marks and live errors

The board SHALL be drawn from its description: the blocks walled and tinted
with the region fills, alike for a Standard and a Jigsaw board; on a Killer
board each cage dashed in ink inside its blocks, with its total at its first
cell; given numbers on the lifted surface; pencil marks; and live errors. A
board without Killer SHALL draw no cage.

#### Scenario: Variant decorations are drawn

- **WHEN** a Standard, Jigsaw or Killer board is drawn
- **THEN** a Jigsaw board's walls follow its irregular blocks
- **AND** a Killer board draws each cage dashed and its total at its first
  cell

### Requirement: Look: Solo draws its digits on a quiet surface, with a given's cell lifted

`redraw` SHALL draw every cell the player fills on the collection's cell
surface, and every cell holding a given digit on the collection's lifted
surface of a given, so that a given is told by the cell under it as well as by
its ink.

#### Scenario: A given is told by the cell under it

- **WHEN** a board with given digits is drawn
- **THEN** each given's cell is the lifted surface
- **AND** every other cell is the cell surface

### Requirement: Look: Only a block's boundary and the frame are heavy

The line between two cells of one block SHALL be the collection's surface grid
line. A block's boundary and the frame round the grid, which is the boundary of
the blocks along it, SHALL stay in ink. Content other than these SHALL keep its
own color too: a killer cage's outline and sum keep theirs.

#### Scenario: Only a block's boundary is heavy

- **WHEN** a board is drawn
- **THEN** the line between two cells of one block is the surface grid line
- **AND** the line between two blocks, and the frame, are ink

### Requirement: Look: An X board's diagonals are a stroke, never a shade

On an X board the two main diagonals SHALL be drawn as a stroke in the surface
grid line's color from corner to corner of each cell on them, under the cell's
digit and pencil marks, and SHALL NOT be told by a shade of the cell's surface.

#### Scenario: A diagonal cell keeps its surface

- **WHEN** an X board is drawn
- **THEN** each cell on a main diagonal carries a corner-to-corner stroke under
  its content, on the same surface as a cell off the diagonals

### Requirement: Look: Solo draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each number that repeats in its row, column, block, diagonal (on
an X board) or cage (on a Killer board), and the outline and total of each
cage whose numbers can no longer make its total (`Game.rules`), counting each
open cell of the cage as any number it could still hold.

#### Scenario: A cage overshot before it is full

- **WHEN** the player puts a number in a cage so large that the cage's open
  cells, holding 1 each, would take it past its total
- **THEN** the cage's outline and total are drawn red while its other cells
  are still open

#### Scenario: A number repeated in a cage

- **WHEN** the same number is placed in two cells of one cage
- **THEN** both are drawn red
