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

### Requirement: Solo's four variants compose

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

### Requirement: Solo is solved when every region holds every digit

`status` SHALL report a board solved when every row, every column and every
sub-block holds every digit, each main diagonal does too on an X board, and on
a killer board no cage repeats a digit and every cage makes its sum.

#### Scenario: The last placement solves the board

- **WHEN** a placement fills the grid with no rule broken
- **THEN** `status` reports the board solved

### Requirement: Solo encodes and decodes its parameters

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

### Requirement: Solo decodes its parameters leniently

`decodeParams` SHALL be lenient, ignoring unknown characters. It SHALL accept
the legacy `"{c}x{r}j"` form, in which a `j` after a seen `r` collapses the
rectangle to a jigsaw of edge `c·r`, and SHALL round-trip the preset list.

#### Scenario: The legacy jigsaw form is read

- **WHEN** `3x3j` is decoded
- **THEN** the params are a jigsaw of edge 9: `c === 9` and `r === 1`

### Requirement: Solo refuses parameters outside its bounds

`validateParams` SHALL refuse a grid of more than 31 digits, a killer grid
whose dimensions are not below 10, and an X grid of fewer than 4 digits. The
limit on a single field is that field's bound in the Custom dialog, and the
difficulty is a choice among the declared tiers; the engine refuses a value
outside either.

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` receives a killer grid of 10 digits or more, or an X
  grid of 3
- **THEN** it returns a non-null error string

### Requirement: Solo descriptions encode givens, block structure, and killer cages

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

### Requirement: Solo solves with its bespoke graded solver

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

### Requirement: The techniques Solo's solver implements

The solver SHALL implement, in difficulty order, the standard techniques
(positional and numeric elimination, block/row/column intersection, set
elimination, extreme forcing chains, and bounded recursion) and the killer
techniques (single-cell sums, min/max elimination, sum-combination enumeration,
and cage/line intersection).

#### Scenario: A board that needs a guess is graded at recursion

- **WHEN** `solveSolo` is run, with recursion allowed, on a uniquely solvable
  board that no deduction technique finishes
- **THEN** it returns the recursion difficulty and the unique solution

### Requirement: Solo's solver is a certified deduction ladder whose rungs run alone

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

### Requirement: Each rung is graded on its own scale

Each rung SHALL carry its tier on its own scale, sudoku or killer; the ladder
SHALL hold only the rungs both caps admit, and a rung that fires SHALL raise
its own scale's grade.

#### Scenario: A rung over its cap is left out

- **WHEN** a killer board is solved with the killer cap below the region rule's
  tier
- **THEN** the ladder holds no killer region rung, and the killer grade reported
  does not exceed the cap

### Requirement: A census certifies that every rung fires

A firing census SHALL walk pinned boards covering every variant at every pair
of deduction caps and at search, and assert that every rung fires on the
corpus.

#### Scenario: A mis-tiered or reordered rung fails

- **WHEN** a rung is declared at another tier, or moved past the rung after it
- **THEN** the frozen differential or the firing census fails

### Requirement: A killer region left nothing is a contradiction

A killer region whose filled cells and whole cages leave nothing for its open
cells SHALL be a contradiction.

#### Scenario: A region left nothing is not a solve

- **WHEN** a killer board with stray digits is searched and a region's filled
  cells and whole cages already make its total with cells still open
- **THEN** the solver reports the board impossible, not solved with an
  unfinished grid

### Requirement: Every killer sum Solo cites is worked out from the board in one step

The killer region rule (`DIFF_KINTERSECT`) SHALL derive the sums it leaves
afresh on every pass from the cages on the board, and SHALL NOT keep a derived
part of a cage as a working cage of its own. Every sum a killer deduction rests
on SHALL therefore be one of the three a killer sum's origin names, each worked
out from the board as it stands.

#### Scenario: A killer single's cage is filled wherever the hint says so

- **WHEN** the hint places the last open cell of a killer cage because its other cells already make the rest of the clue
- **THEN** every other cell of that cage is filled on the board the step is shown on
- **AND** the sum the sentence gives is the sum of their digits

### Requirement: A killer sum has one of three origins

A killer sum SHALL be one of three: a cage's open cells make its clue less its
placed digits; the open cells a row, column or block leaves, once its placed
digits and the cages inside it are taken out, make the rest of its total; or,
where those cells all lie in one cage, that cage's other open cells make its
clue less that and its placed digits. A recorded killer reason SHALL say which,
and its `reads` SHALL name every filled cell the sum rests on.

#### Scenario: A recorded killer sum follows from the board and its reads

- **WHEN** a recording's killer reason is checked against the board at the point it was recorded
- **THEN** its cells are open, its sum is theirs in the solution, and the sum follows from its origin using only filled cells its `reads` name

### Requirement: A killer sum is narrated by what it came from

The hint SHALL narrate each killer sum by what it came from, so that no
sentence calls something a killer cage that the board does not show as one, and
no sentence says a cage's other cells are filled while any is open.

#### Scenario: A sum the region rule leaves is narrated from its region

- **WHEN** a killer deduction rests on what a row, column or block leaves its open cells, or on the rest of the cage those cells lie in
- **THEN** the sentence names the region and the sum it leaves, the step hatches the region, and it outlines the cells the sum is left to

### Requirement: Solo selects a cell by pointer or keyboard

A left-click SHALL highlight a cell for a real entry and a right-click an empty
cell for a pencil mark, as the note-taking cell does in every game. The cursor
keys SHALL move the highlight, and the select key SHALL toggle pencil mode
while it shows.

#### Scenario: The select key switches the mode

- **WHEN** the highlight shows and the select key is pressed
- **THEN** pencil mode toggles and the highlight stays where it is

### Requirement: Solo interprets digit, pencil, and mark-all input

A digit key `1..cr` SHALL enter that digit in the highlighted non-given cell
or, in pencil mode, toggle that pencil mark in the highlighted empty cell;
backspace or space SHALL clear the cell.

#### Scenario: Placing and penciling digits

- **WHEN** a non-given cell is highlighted and a digit key is pressed
- **THEN** `interpretMove` yields a `set` move that places (or, in pencil mode,
  toggles the pencil mark of) that digit

### Requirement: Auto-pencil strikes a placed digit from its no-repeat regions

With auto-pencil enabled, a real placement SHALL additionally strike that digit
from the pencil marks of every other cell sharing one of its no-repeat regions:
its row, column and sub-block, each main diagonal it lies on under X, and its
cage under Killer.

#### Scenario: A placement clears a cage-mate's note

- **WHEN** auto-pencil is on and a digit is placed in a cell of a killer board
- **THEN** that digit leaves the pencil marks of the other cells of its cage, as
  well as of its row, column and sub-block

### Requirement: Solo draws its cages, digits, pencil marks and live errors

`redraw` SHALL draw the block boundaries from the block partition, so that
rectangular and jigsaw-irregular blocks look alike; the killer cage outlines
and cage-sum labels (at each cage's top-left-most cell) when `killer`; given
digits distinct from player digits; an auto-sized grid of pencil marks per
empty cell; live rule-violation errors; and a completion flash.

#### Scenario: Variant decorations are drawn

- **WHEN** a jigsaw or killer board is rendered to a recording drawing
- **THEN** a jigsaw board draws block boundaries along the irregular partition
- **AND** a killer board draws the cage-sum label at each cage and the cage
  outlines

### Requirement: Solo draws its digits on a quiet surface, with a given's cell lifted

`redraw` SHALL draw every cell the player fills on the collection's cell
surface, and every cell holding a given digit on the collection's lifted
surface of a given, so that a given is told by the cell under it as well as by
its ink. The selection's wash and its pencil-mode corner SHALL be drawn over
whichever surface the cell has.

#### Scenario: A given is told by the cell under it

- **WHEN** a board with given digits is drawn
- **THEN** each given's cell is the lifted surface
- **AND** every other cell is the cell surface

### Requirement: Only a block's boundary and the frame are heavy

The line between two cells of one block SHALL be the collection's surface grid
line. A block's boundary and the frame round the grid, which is the boundary of
the blocks along it, SHALL stay in ink. Content other than these SHALL keep its
own color too: a killer cage's outline and sum keep theirs.

#### Scenario: Only a block's boundary is heavy

- **WHEN** a board is drawn
- **THEN** the line between two cells of one block is the surface grid line
- **AND** the line between two blocks, and the frame, are ink

### Requirement: An X board's diagonals are a stroke, never a shade

On an X board the two main diagonals SHALL be drawn as a stroke in the surface
grid line's color from corner to corner of each cell on them, under the cell's
digit and pencil marks, and SHALL NOT be told by a shade of the cell's surface.

#### Scenario: A diagonal cell keeps its surface

- **WHEN** an X board is drawn
- **THEN** each cell on a main diagonal carries a corner-to-corner stroke under
  its content, on the same surface as a cell off the diagonals

### Requirement: Solo flags mistakes against its unique solution

The game SHALL implement `findMistakes`: re-solve from the given cells (and,
for killer, the cage sums), never from the player's notes, to the unique
solution, and return every player cell that contradicts it: a filled cell whose
digit is wrong (`"cell"`), and an empty cell whose non-empty pencil notes have
crossed out its solution digit (`"note"`). When the board is not uniquely
solvable from the givens the result SHALL be empty.

#### Scenario: A wrong digit and a wrong note are flagged

- **WHEN** the player fills a cell with a digit other than its solution value, or
  pencils out the solution digit in an empty cell
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose notes merely carry extra (non-solution) candidates is not
  flagged

### Requirement: Solo exposes pencil-mark preferences

The game SHALL expose, via the `prefs` hook, a sticky-pencil-mode preference
(default on; right-click toggles a persistent pencil mode), an auto-pencil
preference (**default off**), and a keep-mouse-highlight-after-pencil
preference (default on). With auto-pencil off, note cleanup is manual: the
player removes obvious candidates via the mark-all control or a hint.

#### Scenario: Pencil preferences are exposed with their defaults

- **WHEN** the game's preferences are read
- **THEN** they include a sticky-pencil-mode boolean defaulting to on
- **AND** an auto-pencil boolean defaulting to off
- **AND** a keep-highlight boolean defaulting to on

### Requirement: The auto-pencil label names the relation, not the regions

The auto-pencil label SHALL name the **relation** rather than list the regions:
"When you place a number, remove it from the pencil marks it rules out". Which
regions a Solo board has depends on its mode and `prefs` cannot see the params,
so any list is true of some Solo boards and false of others.

#### Scenario: The auto-pencil label holds on every mode

- **WHEN** the preferences dialog is opened on a plain, an X and a Killer board
- **THEN** the auto-pencil label reads the same and is true of all three, naming no region the board has not got and omitting none it has

### Requirement: Solo provides an explained deduction hint

The game SHALL implement `hint(state, aux?, ui?)`, returning a plan of
`HintStep`s that teaches the player the next deduction in pencil-notes terms.
The plan SHALL be built by walking a working copy of the board the way a person
solves it, working in a sound candidate cube **seeded from the placed entries
(givens and player digits) only, never from the player's pencil notes**, since
a note can be wrong.

#### Scenario: A region elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a placed
  digit, or a deductive technique, rules a digit out of a cell
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates

### Requirement: Solo's hint starts on the implicit reading

Solo SHALL start its hint on the implicit reading of a cell with no notes, and
under it the plan SHALL emit no fill-all step.

#### Scenario: Nothing is filled in under Solo's own reading

- **WHEN** the player asks for a hint on a board with no pencil notes, without
  having changed how hints pencil in
- **THEN** no step of the plan is the fill-all move

### Requirement: The eliminations Solo's hint teaches

A deductive elimination SHALL be one technique *firing*: a positional or
numeric single, a block/line intersection, a naked or hidden subset, a forcing
chain or, on a killer board, a single-square cage, a cage min/max bound, a cage
sum-combination, or a deduced extra-cage.

#### Scenario: A killer-cage deduction is taught on a killer board

- **WHEN** the player asks for a hint on a killer board where a cage's sum clue
  rules a digit out of one of its cells
- **THEN** the hint returns a `pencilStrike` step naming the cage by the total
  it must make and concluding in the necessity voice

### Requirement: Solo's narration leads with what was spotted

Each step SHALL carry a narration that leads with the spotted indication (the
firing region, named by its kind; a killer cage named by its sum clue), then
gives the reasoning, then concludes in the necessity voice: "must cross out the
N" for an elimination, and "can only be N" or "must be N" for a placement.

#### Scenario: A strike's sentence names its region and ends in necessity

- **WHEN** the player asks for a hint on a fully-penciled board where a placed
  digit, or a deductive technique, rules a digit out of a cell
- **THEN** the narration names the firing region (row / column / sub-block /
  diagonal, or a killer cage by its sum clue) and concludes in the necessity voice

### Requirement: Solo's hint marks pair each color with a shape

When a single step names two or more board-element types at once, each type
SHALL carry a stable per-game color always paired with a non-color cue: a ring
round the cell the step acts on, an outline round the cells the reason rests
on, stripes over the region the sentence names, and a line through a ruled-out
candidate.

#### Scenario: A strike shows its region, its cell and its candidates

- **WHEN** a strike step that names a region is shown
- **THEN** the region's cells are striped, the cell acted on is ringed, and the
  struck candidates are crossed through among its pencil marks

### Requirement: Solo's hint never narrates a guess

The deduction SHALL be capped below recursion (`DIFF_RECURSIVE`), since a guess
is not a teachable note strike, so on a board only solvable by guessing the
hint SHALL report that it cannot deduce the next move.

#### Scenario: The hint declines when only a guess remains

- **WHEN** a hint is requested on a board whose next move requires the recursion
  (Unreasonable) tier
- **THEN** the hint reports that it cannot deduce the next move rather than
  narrating a guess

### Requirement: Every hint step is monotone progress

Every step SHALL be monotone progress: a note added, a note removed by a
strike, or a cell filled by a placement, never undone by the hint. A
freshly-recomputed hint from any solvable, mistake-free mid-game position SHALL
therefore make progress and lead to a solved board, and on recompute the plan
SHALL skip any operation already reflected on the board.

#### Scenario: The hint resumes from a self-played mid-game position

- **WHEN** a hint is requested from a solvable, mistake-free board (standard, X,
  jigsaw or killer) the player reached by their own notes and placements
- **THEN** the freshly-recomputed hint makes progress and, applied step by step
  with recompute, leads to a solved board

### Requirement: Recording leaves the solve path unchanged

The solver's recording mode SHALL be gated so that with recording off the
generator and solve path is **unchanged**.

#### Scenario: Generating and solving record nothing

- **WHEN** a board is generated, solved or checked for mistakes
- **THEN** the solver runs with no recorder attached, and records nothing

### Requirement: Solo provides on-screen key labels

Solo SHALL implement `requestKeys(params)` returning the digit keypad for its grid:
one button per symbol `1..cr` (where `cr = c·r`), labeled by the symbol character
(`"1".."9"`, then `"a"`, `"b"`, … for `cr > 9`), followed by a clear key (button
code `8`, the backspace, labeled `"Clear"`).

#### Scenario: A 9-symbol board shows digits 1–9 plus clear

- **WHEN** the key labels are requested for a `3×3` Solo board
- **THEN** the result is the buttons `1,2,…,9` followed by a clear key

### Requirement: Solo generates boards uniquely solvable at exactly the requested difficulty

`newDesc` SHALL generate a full solution grid satisfying all active
constraints: Latin rows and columns, sub-blocks, X-diagonals when `xtype` and
killer cages when `killer`, with jigsaw blocks produced by the engine's
`divvy`. It SHALL keep a board only when the graded solver finds it
**uniquely** solvable at **exactly** the requested difficulty, regenerating
otherwise.

#### Scenario: Generated board is uniquely solvable at its difficulty

- **WHEN** a board is generated for given params
- **THEN** the graded solver solves it uniquely at the requested difficulty
- **AND** (for difficulties above the lowest) the solver fails to solve it one
  difficulty level lower

### Requirement: Givens are removed in symmetry orbits

On a board without killer cages `newDesc` SHALL remove givens in symmetry
orbits, per the `symm` mode, by re-running the graded solver, keeping a removal
only while the board stays solvable within the requested difficulty. A killer
board SHALL carry no givens, and SHALL be kept only when it lands on both the
requested difficulty and the requested killer difficulty.

#### Scenario: The givens keep the symmetry asked for

- **WHEN** a board is generated with 4-way rotation
- **THEN** its pattern of givens is unchanged by a quarter turn

### Requirement: Solo marks every board element its hint sentence points at

A Solo hint step SHALL mark, as evidence or as its target, every cell its
narration refers to deictically. A sentence saying "these cells", "their
region" or "these lines" SHALL have those cells on the frame; where the firing
is not over a `SoloRegion` the step SHALL carry the cells themselves.

#### Scenario: The deduced extra-cage shows the region it counted

- **WHEN** a killer board's hint forces a placement because one row, column or
  block has a single cell left outside the cages wholly inside it
- **THEN** the step stripes that region's cells as evidence, with the open cell
  as the placement target
- **AND** the narration names the region by kind and states the arithmetic,
  the region's total, less the cages and filled cells inside it, rather than
  repeating the placed digit as a separate total

### Requirement: The two rungs whose premise is not a region carry their cells

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

### Requirement: A single-digit pattern step names the fewer lines

Every single-digit pattern firing can be read two ways, as some columns
confined to as many rows or as the remaining rows confined to the remaining
columns; the step SHALL name whichever is fewer lines.

#### Scenario: The step names the fewer lines

- **WHEN** a single-digit pattern firing confines more columns than it leaves
  rows outside the pattern
- **THEN** the step stripes those rows and names them, not the columns
