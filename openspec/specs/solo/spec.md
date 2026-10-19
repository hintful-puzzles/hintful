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

The game SHALL support four composable variants: **standard** (rectangular
`c × r` sub-blocks), **jigsaw** (`r === 1`, irregular sub-blocks), **X**
(`xtype`: the two main diagonals must also contain every digit), and **killer**
(`killer`: a second cage partition with digit-sum clues). There SHALL be two
difficulty axes: the standard solver difficulty and the killer-cage difficulty.

#### Scenario: Variants are served from one registered game

- **WHEN** a standard, jigsaw, X, or killer Solo puzzle is requested
- **THEN** the same registered `solo` game produces a playable board for it
- **AND** a jigsaw board (`r === 1`) has irregular sub-blocks while a standard
  board has rectangular `c × r` sub-blocks
- **AND** an X board additionally constrains the two main diagonals, and a killer
  board additionally carries digit-sum cages

### Requirement: Rules: Solo is solved when every region holds every digit

`status` SHALL report a board solved when every row, every column and every
sub-block holds every digit, each main diagonal does too on an X board, and on
a killer board no cage repeats a digit and every cage makes its sum.

#### Scenario: The last placement solves the board

- **WHEN** a placement fills the grid with no rule broken
- **THEN** `status` reports the board solved

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

`encodeParams` SHALL write a base of `"{c}x{r}"` when `r > 1` or `"{c}j"` when
`r === 1` (jigsaw), then `"x"` if `xtype` and `"k"` if `killer`. In *full* mode
it SHALL append the symmetry (`m8`, `m4`, `md4`, `m2`, `md2`, `r4` or `a`, with
the default `r2` omitted) and the difficulty (`db`, `di`, `da`, `de` or `du`,
with `dt`, the default `DIFF_BLOCK`, omitted).

#### Scenario: Params round-trip across variants

- **WHEN** standard, jigsaw, X, and killer params are encoded with `full = true`
  and decoded
- **THEN** each decodes back to the original params
- **AND** the non-full encoding omits the symmetry and difficulty suffixes

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

`validateParams` SHALL refuse a grid of more than 31 digits, a killer grid
whose dimensions are not below 10, and an X grid of fewer than 4 digits. In
full form it SHALL also refuse, in the words of `noSuchTier`, a tier that no
board of a tiny grid has. A single field's limit is its bound in the Custom
dialog and the difficulty a choice among the declared tiers, and the engine
refuses a value outside either (`engine-params`, "Params validity is the
engine's check").

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` receives a killer grid of 10 digits or more, or an X
  grid of 3
- **THEN** it returns a non-null error string

#### Scenario: A tiny grid has only its easy tiers

- **WHEN** a 2x2 board, or a Jigsaw of 2 or 3, is asked for above Easy, or a
  Jigsaw of 4 without cages above Tricky, or a Killer Jigsaw of 2 at any tier
- **THEN** `validateParams` refuses the tier and names the size, and the same
  params without their difficulty are accepted

### Requirement: Params: Solo's killer difficulty is in no params string

Neither form of the params string and no field of the Custom dialog SHALL
carry the killer-cage difficulty: `encodeParams` writes none, and
`decodeParams` reads none and gives the highest.

#### Scenario: The Killer preset

- **WHEN** the preset `3x3ka` is decoded
- **THEN** its killer difficulty is the highest, its `a` is the symmetry,
  none, and nothing in the string names the killer difficulty
- **AND** its short form is `3x3k`

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

`newState` SHALL refuse a killer description whose sums section gives some
cage no sum, or more than one, with a sentence that says each cage takes
exactly one. No generator writes one: upstream's and this one write one sum a
cage.

#### Scenario: Two sums in one cage

- **WHEN** a `3x3ka` description's sums section opens `15_14_8_8_8_5`, the
  fifth cell being the second cell of the fourth's cage
- **THEN** it is refused as not giving each cage exactly one sum

#### Scenario: A cage with no sum

- **WHEN** a `3x3ka` description's sums section opens `a14` where the first
  cell begins a cage
- **THEN** it is refused with the same sentence

### Requirement: Generation: Solo builds a full grid under every active constraint

`newDesc` SHALL generate a full solution grid satisfying all active
constraints: Latin rows and columns, sub-blocks, X-diagonals when `xtype` and
killer cages when `killer`, with jigsaw blocks produced by the engine's
`divvy`.

#### Scenario: A board with the diagonals and cages both

- **WHEN** a board is generated with X and Killer both on
- **THEN** the grid it was built from holds every digit once on each main
  diagonal and repeats none in a cage, as well as in each row, column and
  sub-block

### Requirement: Generation: Givens are removed in symmetry orbits

On a board without killer cages `newDesc` SHALL remove givens in symmetry
orbits, per the `symm` mode, by re-running the graded solver, keeping a removal
only while the board stays solvable within the requested difficulty. A killer
board SHALL carry no givens, and SHALL be kept only when it lands on both the
requested difficulty and the requested killer difficulty.

#### Scenario: The givens keep the symmetry asked for

- **WHEN** a board is generated with 4-way rotation
- **THEN** its pattern of givens is unchanged by a quarter turn

### Requirement: Solver: Solo solves with its bespoke graded solver

Solo's solver SHALL be its own, not the shared Latin solver, built from a
constraint-group list (rows, columns, sub-blocks and, when `xtype`, the two
diagonals) so that X-type and jigsaw fall out of the shared technique loops.
`solveSolo(...)` SHALL return the difficulty reached, or an impossible or
ambiguous sentinel.

#### Scenario: Solver grades a known board

- **WHEN** `solveSolo` is run on a generated board at its difficulty
- **THEN** it returns that difficulty and fills the grid with the unique solution

#### Scenario: Solver detects an inconsistent board

- **WHEN** `solveSolo` is run on a board with no solution
- **THEN** it returns the impossible sentinel

### Requirement: Solver: The techniques Solo's solver implements

The solver SHALL implement, in difficulty order, the standard techniques
(positional and numeric elimination, block/row/column intersection, set
elimination, extreme forcing chains, and bounded recursion) and the killer
techniques (single-cell sums, min/max elimination, sum-combination enumeration,
and cage/line intersection).

#### Scenario: A board that needs a guess is graded at recursion

- **WHEN** `solveSolo` is run, with recursion allowed, on a uniquely solvable
  board that no deduction technique finishes
- **THEN** it returns the recursion difficulty and the unique solution

### Requirement: Solver: Solo's solver is a certified deduction ladder whose rungs run alone

Solo's solver SHALL run its techniques as a `runDeductionFixpoint` ladder of
named rungs in this order: the block single, the four killer rungs, the line,
diagonal and naked singles, the line and diagonal intersections, the region and
diagonal sets, the single-digit set and the forcing chain. A rung SHALL read
nothing a rung before it left behind in the same pass, so that the premise
audit's replay runs a firing's own rung alone. No hand-written technique loop
SHALL be kept beside it.

#### Scenario: A premise cut short is found

- **WHEN** a line-block intersection's step stops naming the region it
  confines the digit to
- **THEN** the premise audit reports the firing, since its rung alone no longer
  concludes it

### Requirement: Solver: Each rung is graded on its own scale

Each rung SHALL carry its tier on its own scale, sudoku or killer; the ladder
SHALL hold only the rungs both caps admit, and a rung that fires SHALL raise
its own scale's grade.

#### Scenario: A rung over its cap is left out

- **WHEN** a killer board is solved with the killer cap below the region rule's
  tier
- **THEN** the ladder holds no killer region rung, and the killer grade reported
  does not exceed the cap

### Requirement: Solver: A census certifies that every rung fires

The boards of Solo's firing census SHALL be pinned ones covering every
variant, walked at every pair of deduction caps and at search, and every rung
SHALL fire on them.

#### Scenario: A mis-tiered or reordered rung fails

- **WHEN** a rung is declared at another tier, or moved past the rung after it
- **THEN** the frozen differential or the firing census fails

### Requirement: Solver: A killer region left nothing is a contradiction

A killer region whose filled cells and whole cages leave nothing for its open
cells SHALL be a contradiction.

#### Scenario: A region left nothing is not a solve

- **WHEN** a killer board with stray digits is searched and a region's filled
  cells and whole cages already make its total with cells still open
- **THEN** the solver reports the board impossible, not solved with an
  unfinished grid

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

### Requirement: Hint: Every killer sum Solo cites is worked out from the board in one step

The killer region rule SHALL derive the sums it leaves
afresh on every pass from the cages on the board, and SHALL NOT keep a derived
part of a cage as a working cage of its own. Every sum a killer deduction rests
on SHALL therefore be one of the three a killer sum's origin names, each worked
out from the board as it stands.

#### Scenario: A killer single's cage is filled wherever the hint says so

- **WHEN** the hint places the last open cell of a killer cage because its other cells already make the rest of the clue
- **THEN** every other cell of that cage is filled on the board the step is shown on
- **AND** the sum the sentence gives is the sum of their digits

### Requirement: Hint: A killer sum has one of three origins

A killer sum SHALL be one of three: a cage's open cells make its clue less its
placed digits; the open cells a row, column or block leaves, once its placed
digits and the cages inside it are taken out, make the rest of its total; or,
where those cells all lie in one cage, that cage's other open cells make its
clue less that and its placed digits. A recorded killer reason SHALL say which,
and its `reads` SHALL name every filled cell the sum rests on.

#### Scenario: A recorded killer sum follows from the board and its reads

- **WHEN** a recording's killer reason is checked against the board at the point it was recorded
- **THEN** its cells are open, its sum is theirs in the solution, and the sum follows from its origin using only filled cells its `reads` name

### Requirement: Hint: A killer sum is narrated by what it came from

The hint SHALL narrate each killer sum by what it came from, so that no
sentence calls something a killer cage that the board does not show as one, and
no sentence says a cage's other cells are filled while any is open.

#### Scenario: A sum the region rule leaves is narrated from its region

- **WHEN** a killer deduction rests on what a row, column or block leaves its open cells, or on the rest of the cage those cells lie in
- **THEN** the sentence names the region and the sum it leaves, the step hatches the region, and it outlines the cells the sum is left to

### Requirement: Hint: Solo's hint is the candidate walk's, started on the implicit reading

Solo's hint SHALL be a plan of the shared candidate walk
(`engine-candidate-hints`, "A shared candidate-elimination hint plan"), its
marks those of its legend (`hintMarks`). Solo SHALL start it on the implicit
reading of a cell with no notes (`engine-candidate-hints`, "A candidate hint
plan reads an unmarked cell the way the player chose").

#### Scenario: Nothing is filled in under Solo's own reading

- **WHEN** the player asks for a hint on a board with no pencil notes, without
  having changed how hints pencil in
- **THEN** no step of the plan is the fill-all move

### Requirement: Hint: The eliminations Solo's hint teaches

A deductive elimination SHALL be one technique *firing*: a positional or
numeric single, a block/line intersection, a naked or hidden subset, a forcing
chain or, on a killer board, a single-square cage, a cage min/max bound, a cage
sum-combination, or a deduced extra-cage.

#### Scenario: A killer-cage deduction is taught on a killer board

- **WHEN** the player asks for a hint on a killer board where a cage's sum clue
  rules a digit out of one of its cells
- **THEN** the hint returns a `pencilStrike` step naming the cage by the total
  it must make and concluding in the necessity voice

### Requirement: Hint: A Solo step's indication is its firing region, or what the player looks at

The indication of a step that fires on a region SHALL be that region, named
by its kind (a killer cage with its clue or the sum the clue leaves), and its
conclusion SHALL be that what an elimination strikes "must go", and "must be"
or "can only be" the number a placement enters. The indication of a step with
no firing region SHALL be what the player looks at: the cell for a single, the
number just placed for the cull after it, and the notes for a step that sets
them up.

#### Scenario: A strike's sentence names its region and ends in necessity

- **WHEN** the player asks for a hint on a fully-penciled board where a
  deductive technique rules a digit out of a cell
- **THEN** the narration names the firing region (row / column / block /
  diagonal, or "this killer cage") and concludes in the necessity voice

#### Scenario: What an elimination's conclusion names

- **WHEN** a step strikes one number, or several, or numbers its reasoning has
  just listed
- **THEN** it concludes "the 5 must go", or "1 and 2 must go", or "they must
  go" ("it" for one)

#### Scenario: The cull after a placement names where the number cannot repeat

- **WHEN** a step strikes the number just placed from the cells that share a
  region with it
- **THEN** its narration begins "The 5 just placed can't repeat in its" and
  names every kind of region the cell lies in, not one firing region

#### Scenario: A cage is named by what its open cells must make

- **WHEN** a killer step strikes a number, reasoning from a cage some of whose
  cells are filled
- **THEN** it gives the sum the clue leaves and not the clue: "This killer
  cage's open cells make 9"

#### Scenario: A cage of one open cell and nothing filled

- **WHEN** the next step fills the only cell of a cage
- **THEN** it concludes "it must be its total," and the number

#### Scenario: A single read off one cell's notes names the cell

- **WHEN** the next step places the only number an empty cell's notes leave
- **THEN** its narration begins "Every other number has been ruled out in" that
  cell, names no region, and concludes "it can only be" that number

### Requirement: Hint: Solo marks every board element its hint sentence points at

A Solo hint step SHALL mark, as evidence or as its target, every cell its
narration refers to deictically. A sentence saying "these cells", "their
region" or "these lines" SHALL have those cells on the frame; where the firing
is not over a region the step SHALL carry the cells themselves.

#### Scenario: The deduced extra-cage shows the region it counted

- **WHEN** a killer board's hint forces a placement because one row, column or
  block has a single cell left outside the cages wholly inside it
- **THEN** the step stripes that region's cells as evidence, with the open cell
  as the placement target
- **AND** the narration names the region by kind and states the arithmetic,
  the region's total, less the cages and filled cells inside it, rather than
  repeating the placed digit as a separate total

### Requirement: Hint: The two rungs whose premise is not a region carry their cells

The rule that a step carries the cells themselves SHALL cover the two rungs
whose premise is not a region: the deduced extra-cage, which reasons over a
row, column or block less the cages wholly inside it, and the row-versus-column
elimination on a single digit, whose premise is a pattern of candidate
positions across several lines.

#### Scenario: The locked pattern shows its own cells

- **WHEN** the hint strikes a candidate because a single digit is confined,
  across several lines, to a pattern of cells that uses them up
- **THEN** the step stripes every cell of the lines that confine the digit
- **AND** it outlines the cells of those lines the digit can still take
- **AND** the narration points at both marks, and says how many lines there
  are each way

### Requirement: Hint: Solo's hint uses no technique above the board's tier

On a board below Unreasonable the hint's deduction SHALL be capped at the tier
in the board's params, so that a step is always one the board's tier promises
the player.

#### Scenario: An Easy board is hinted with Easy's techniques

- **WHEN** a hint is asked on a board dealt at Easy, at any position without
  a mistake
- **THEN** no step of the plan is an intersection, a set or a chain

### Requirement: Look: Solo draws its cages, digits, pencil marks and live errors

`redraw` SHALL draw the block boundaries from the block partition, so that
rectangular and jigsaw-irregular blocks look alike; the killer cage outlines
and cage-sum labels (at each cage's top-left-most cell) when `killer`; given
digits distinct from player digits; an auto-sized grid of pencil marks per
empty cell; and live rule-violation errors.

#### Scenario: Variant decorations are drawn

- **WHEN** a jigsaw or killer board is rendered to a recording drawing
- **THEN** a jigsaw board draws block boundaries along the irregular partition
- **AND** a killer board draws the cage-sum label at each cage and the cage
  outlines

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
