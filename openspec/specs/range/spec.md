# range Specification

## Purpose
Range (Kurodoko), the puzzle of shading squares so that no two shaded
squares touch, the squares left clear stay connected, and each number counts
the clear squares it sees in four directions, itself included. This spec
holds the puzzle's rules, its params and description encodings, what its
generator promises, its controls, its live error highlighting and mistake
check, its explained deduction hint with the marks it draws, and how the
board looks.

## Requirements

### Requirement: Range is solved exactly while it has no error

The player paints some white squares black so that no two black squares are
orthogonally adjacent, all white squares stay connected, and every numbered
clue equals the number of white squares visible from it in a straight line,
itself counted once (`h + v - 1`). The board SHALL be reported solved exactly
while `findErrors` finds no error on it.

#### Scenario: A clue counts itself once

- **WHEN** a clue sees a horizontal white run of 3 and a vertical white run of
  2, each run including the clue's own square
- **THEN** the clue it must equal is 4

#### Scenario: Completing the board is detected

- **WHEN** a move paints the final black square of the unique solution
- **THEN** `findErrors` reports no error, `status` returns `"solved"`, and a
  flash plays

### Requirement: Range params are a width and a height

Params SHALL be `w`, `h` and the difficulty, encoded `{w}x{h}d{e|u}`: the
difficulty, Easy as `de` or Unreasonable as `du`, only in the full encoding.
A bare number SHALL decode as a square board of that size, and an ID with no
difficulty letter SHALL decode as Easy.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 13, h: 9 }` at Easy are encoded
- **THEN** the full encoding is `13x9de` and the shared one `13x9`
- **AND** decoding `13x9`, written before the game had tiers, yields the same
  params
- **AND** decoding the bare `12` yields a 12×12 board

### Requirement: Range params are refused outside their bounds

`validateParams` SHALL refuse a `w + h` above 128, which overflows the cell
encoding, and, when `full`, a grid with both dimensions at most 2 (1×1, 1×2,
2×1 and 2×2), which admits no good puzzle. It SHALL refuse no size for the
time its deal takes, at either difficulty: a player can stop a deal.

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with full generation on a 2×2 grid
- **THEN** it returns a non-null error string

#### Scenario: The largest boards are asked for at both difficulties

- **WHEN** a 64×64, a 2×126 and an 18×18 board are checked for dealing at
  Easy and at Unreasonable
- **THEN** none is refused
- **AND** a 64×65 board is refused for its width plus height

### Requirement: Range descriptions are run-length clue grids

The desc SHALL encode the board in scan order: the decimal digits of each
clue, a letter `a`-`z` for each run of 1-26 blank (non-clue) cells, and `_`
as an explicit separator exactly where two clues would otherwise merge.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and the clue grid is
  re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: A malformed Range description is refused

Parsing a desc SHALL refuse any character other than a digit, a run letter or
a separating `_`, any clue outside `1 .. w + h - 1`, and any desc whose
decoded cell count differs from `w * h`.

#### Scenario: A malformed description is rejected

- **WHEN** a desc with an invalid character, an out-of-range clue, or a
  decoded length mismatching the params is validated
- **THEN** the verdict is a non-null error string

### Requirement: Range's deduction applies three rules to a fixpoint

The deductive solver SHALL repeat three rules until none fires. A cell
adjacent to a black cell is white. From a clue's runs: when it already sees
its count the next cell in each direction is black, a cell whose inclusion
would exceed the clue is black, and cells it cannot reach its count without
are white. A square whose painting black would disconnect the white region (a
cut vertex of the white graph) is white.

#### Scenario: The adjacency rule whitens a neighbor

- **WHEN** the solver runs on a grid with a black cell beside an empty cell
- **THEN** that empty cell is set white

### Requirement: Range's rules run on every board the encoding allows

The deductive solver SHALL finish on a board of any size the encoding allows,
dealt or pasted, however long a path its white squares form.

#### Scenario: A strip of the greatest length

- **WHEN** the solver runs on a 127×1 grid with no clue and nothing decided
- **THEN** every cell but the two ends is set white

#### Scenario: The largest board with nothing shaded

- **WHEN** the solver runs on a 64×64 grid with no clue and nothing decided
- **THEN** it returns having set no cell

### Requirement: Range's Solve searches where deduction stalls

`solve` SHALL take the board's answer from the search that counts its
answers, at either difficulty. It SHALL return one move, carrying the solve
flag, that sets every non-clue cell, or an error when the clues admit no
completion or more than one.

#### Scenario: Solve completes a generated board

- **WHEN** the Solve command runs on a generated board
- **THEN** it returns a move whose cell-sets paint every undecided cell, after
  which `status` returns `"solved"` and `findErrors` reports no error

### Requirement: Range's move is a list of cell-sets

A `RangeMove` SHALL be a list of cell-sets, each painting a cell black, white
or empty, plus an optional solve flag. `executeMove` SHALL be pure and SHALL
throw on an out-of-bounds or clue-cell target.

#### Scenario: A move onto a clue throws

- **WHEN** `executeMove` is given a move that sets a cell holding a clue
- **THEN** it throws and the state it was given is unchanged

### Requirement: Range marks cells via three-state cycling moves

Left-button or select on a non-clue cell SHALL cycle empty → black → white →
empty, and right-button or select2 SHALL cycle empty → white → black → empty.
A clue cell SHALL be inert.

#### Scenario: Left and right cycle in opposite directions

- **WHEN** an empty non-clue cell receives a left-button action, then another,
  then another
- **THEN** it passes black → white → empty
- **AND** the same cell under three right-button actions passes white → black
  → empty

#### Scenario: Clue cells reject marking

- **WHEN** a marking action targets a cell holding a clue
- **THEN** `interpretMove` returns `null` and the cell is unchanged

### Requirement: Range's keyboard cursor marks white with shift

A keyboard cursor SHALL move within the grid, and shift with a cursor
direction SHALL mark the vacated and/or entered empty cells white.

#### Scenario: A shifted step crosses both empty cells

- **WHEN** the visible cursor sits on an empty cell and shift with a direction
  moves it onto another empty cell
- **THEN** one move marks both cells white

### Requirement: Range highlights errors live

`redraw` SHALL highlight, in the error color, every cell currently violating a
rule, recomputed each frame from `findErrors`: a black cell orthogonally
adjacent to another black cell, a clue whose visible white run cannot equal
its number, or a white cell cut off from the main white component.

#### Scenario: A black-adjacency violation reddens live

- **WHEN** two orthogonally adjacent cells are both painted black
- **THEN** `redraw` frames both in the error color without any explicit check
  action

### Requirement: Range checks mistakes against the solution

`findMistakes` SHALL take the board's one answer from the search that counts
its answers, at either difficulty, and return every player-marked non-clue
cell whose mark contradicts it: black where the solution is white, or marked
white where the solution is black. It SHALL return none when the marks are
consistent or undecided, and none where the search did not prove exactly one
answer.

#### Scenario: findMistakes flags a wrong black

- **WHEN** the player paints black a cell that is white in the unique solution
  and Check & Save runs
- **THEN** `findMistakes` returns that cell
- **AND** a board whose marks all agree with the solution returns no mistakes

### Requirement: Range provides an explained deduction hint

The `range` game SHALL implement `hint(state)` returning a plan-carrying,
narrated hint that explains why each move is forced. It SHALL deduce, from the
player's current marks, the ordered sequence of cells the three rules force
without search, and return one narrated `HintStep` per forced cell.

#### Scenario: Hint explains the next forced move

- **WHEN** `hint` is called on an unsolved, mistake-free generated board
- **THEN** it returns `{ ok: true }` with a non-empty list of steps
- **AND** the first step's move is a legal `executeMove` whose narration names
  the deduction (adjacency / clue / connectedness) that forces its cell
- **AND** applying every step's move in order solves the board

### Requirement: A Range hint is refused only when the rules force no cell

`hint` itself SHALL refuse only when the three rules force no cell from the
player's marks, and then with the engine's deduction-exhausted refusal.

#### Scenario: Deduction that forces nothing is refused

- **WHEN** `hint` is asked about an unsolved, mistake-free board on which none
  of the three rules forces a cell
- **THEN** it returns the engine's deduction-exhausted refusal and no steps

### Requirement: A Range hint step states the deduction that forces its cell

Each step's narration SHALL state its deduction: an adjacent black square (a
neighbor of a black must be white), a clue already satisfied (its run must
stop, so the next cell is black), a clue that would be overrun (the cell must
be black), a clue that can only reach its count one way (the cell must be
white), or a cut vertex of the white region (it must be white to keep the
white cells connected).

#### Scenario: A satisfied clue caps its run

- **WHEN** a step is forced because a clue already sees its count
- **THEN** its narration says the clue already sees its count of cells and
  that the cell just past them must be shaded

### Requirement: Range's hintKeepTrack follows the hinted cell and value

The game SHALL implement `hintKeepTrack` so the plan advances as the player
follows it. It SHALL report `"completed"` when the player's move sets the
hinted cell to the hinted value and `"off"` otherwise.

#### Scenario: Following the hint advances the plan

- **WHEN** the player makes the move the current hint step describes
- **THEN** `hintKeepTrack` returns `"completed"`
- **AND** a move that sets a different cell, or the hinted cell to a different
  value, returns `"off"`

### Requirement: A Range hint outlines its evidence as an area

`redraw` SHALL outline the displayed step's evidence as an area in the
evidence color, so the picture the narration names is visible and not merely
a single premise cell: the clue's line of sight (satisfied and overrun), what
the clue already sees along its other arms (reach), or the non-black cells a
cut would isolate (connect).

#### Scenario: Every hint step shows visible evidence

- **WHEN** `hint` returns a plan for a generated board
- **THEN** every step carries a non-empty outlined area, a striped run or an
  outlined black premise cell, never a bare conclusion
- **AND** neither the outline nor the run contains the step's own target cell

### Requirement: Range hint evidence is computed as each step fires

A step's evidence SHALL be computed against the board state as that step's
deduction fires, with the prior steps applied, so the run grows as the player
follows the plan. It SHALL never include the target cell itself.

#### Scenario: A later step sees the earlier steps' cells

- **WHEN** an earlier step of a plan whitens a cell that extends a clue's
  white run and a later step is forced because that clue is then satisfied
- **THEN** the later step's outlined line of sight includes the cell the
  earlier step whitened

### Requirement: Range hint color legend

When a Range hint is displayed, `redraw` SHALL distinguish the element types
the deduction names using a stable legend of marks, none of them a fill that
hides a cell's content. The legend SHALL be consistent across deductions.
Which cell takes which mark SHALL be read from the step's words, so the
sentence and the picture name the same cells.

#### Scenario: A cited black square rings distinct from the forced cell

- **WHEN** an `adjacency` hint is displayed (a shaded square forces an adjacent
  cell to be not shaded)
- **THEN** the cited shaded premise takes a doubled outline in
  `COL_HINT_SHADEDREF` and the forced cell is ringed `COL_HINT`, in different
  colors

### Requirement: The forced cell and its premises take different marks

The forced cell (the move) SHALL be ringed `COL_HINT` at its edge, the same
whether the step shades it or marks it not shaded, with no preview of the
forced mark, which the narration says. Premise cells that hold no shaded
piece (a clue's line of sight, the cells a cut would disconnect) SHALL be
outlined `COL_HINT_CELL`.

#### Scenario: Premises that are not shaded are outlined

- **WHEN** a `satisfied`, `overrun`, `reach`, or `connect` hint cites the cells
  a clue sees or the cells a cut would disconnect
- **THEN** those premise cells are outlined `COL_HINT_CELL`, distinct from
  both the target and any cited shaded square

### Requirement: A shaded premise, a run and a clue each take their own mark

A cited shaded square premise (the adjacent one in an `adjacency` deduction)
SHALL keep its shaded piece and take a doubled outline in
`COL_HINT_SHADEDREF`, not `COL_HINT`, so a shaded premise and the forced cell
are not drawn in the same color. The run a `reach` deduction names, from the
clue up to the target, SHALL be striped in `COL_HINT`. The clue a deduction
counts from SHALL have its number drawn in `COL_HINT`.

#### Scenario: A reach step stripes the run short of its target

- **WHEN** a `reach` hint is displayed
- **THEN** the cells from the clue up to, and not including, the forced cell
  are striped `COL_HINT`
- **AND** the clue's number is drawn in `COL_HINT`

### Requirement: Range draws a shaded cell as the collection's shaded piece

`redraw` SHALL draw the board as pieces on a quiet surface. A cell the player
has shaded (the state called black elsewhere) SHALL hold the collection's
shaded piece, in its color and shape, inset on its cell. A cell marked as not
shaded (white) SHALL hold the collection's ruled-out cross and take no fill of
its own, and an undecided cell SHALL be the plain cell surface, so no state is
told by a step of gray.

#### Scenario: Three states on one surface

- **WHEN** a board holds a shaded cell, a cell marked not shaded and an
  undecided cell
- **THEN** all three are drawn on the same cell surface
- **AND** the first holds the shaded piece, the second the ruled-out cross and
  the third nothing

### Requirement: A Range clue sits on the lifted surface of a given

A clue cell SHALL sit on the lifted surface of a given, with its number in
ink. The line between cells and the frame round the grid SHALL be the
surface's grid line.

#### Scenario: A clue is told by the cell under it

- **WHEN** a board with a clue is drawn
- **THEN** the clue's cell is the lifted surface and no other cell is

### Requirement: A Range cell in error keeps its content

A cell in error SHALL keep its content and take a frame in the error color at
its edge, with a clue's number or a cross drawn in the error color. A shaded
piece SHALL keep its own color.

#### Scenario: A shaded cell in error is still a shaded piece

- **WHEN** two orthogonally adjacent cells are both shaded
- **THEN** each holds a piece in the shaded color
- **AND** each cell is framed in the error color

### Requirement: The Range completion flash lifts every cell

The completion flash SHALL lift every cell to the given's surface on its lit
beats, a step that reads in both schemes, and SHALL leave the pieces
standing.

#### Scenario: A flashing board keeps its pieces

- **WHEN** a solved board is drawn on a lit beat of its flash
- **THEN** every cell is the given's surface
- **AND** every shaded cell still holds its piece

### Requirement: Range's cursor sits at the cell's corners

The keyboard cursor SHALL be drawn out at the cell's corners, beside the
piece.

#### Scenario: The cursor on a shaded cell leaves the piece whole

- **WHEN** the keyboard cursor is shown on a shaded cell
- **THEN** the cell holds its shaded piece
- **AND** the cursor is drawn out at the cell's corners

### Requirement: Every Easy Range board is uniquely solvable without search

Every board `newDesc` generates at Easy SHALL be uniquely solvable by the
deductive solver without search and SHALL have two-way rotationally symmetric
clues, none of them opposite a black square of the solution, and no symmetric
pair of them removable without the board then needing search. On a grid at
least two squares each way it SHALL contain at least one black square.

#### Scenario: Generated boards are valid and solvable

- **WHEN** `newDesc` runs for a seeded RNG across all four presets at Easy
- **THEN** every desc is accepted as a valid description
- **AND** the deductive solver, without search, solves every resulting board
  from its visible clues alone to a state with no errors

#### Scenario: A removal that needs search is put back

- **WHEN** removing a symmetric pair of clues leaves a board the deductive
  solver cannot finish without search
- **THEN** both clues are restored and the next pair is tried

### Requirement: Range counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
three rules: where they stop, it SHALL take the first undecided cell and
assume it shaded, and then clear. It SHALL report one answer, several, none,
or that it stopped at its budget, which SHALL be counted in positions and
never in time.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 4×4 board the rules finish, on one with one
  answer that they do not reach, on one with no number, and on one with a 7
  in one corner and a 1 in the opposite one
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given eight positions on a board that needs nine
- **THEN** it reports that it stopped, and with nine it reports one answer

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 2×3 to 5×5, the same with a number taken away
  and the same with one number changed are each counted by shading every set
  of squares with no two side by side and reading it against the numbers
- **THEN** the search reports one answer exactly where one shading fits,
  several where more do and none where none does

### Requirement: Range's search sees a position no answer fits before it is full

The search SHALL call a position impossible as soon as the live error check
flags a cell in it: a number that cannot see its count however the undecided
cells go, or already sees too many, two shaded cells side by side, or clear
cells cut off from the rest. It SHALL NOT wait for every cell to be decided.

#### Scenario: A board that takes three positions

- **WHEN** the search is given two positions on a 4×4 board that takes five
  when an impossible position is seen only once full
- **THEN** it reports that it stopped, and with three it reports one answer

### Requirement: An Unreasonable Range board has one answer that the rules do not reach

At Unreasonable the generator SHALL strip an Easy board further: each
symmetric pair of clues still showing SHALL go while the search still proves
one answer within a budget of its own, well under the search's. It SHALL keep
the board only when the three rules then stop short, and its clues SHALL stay
two-way rotationally symmetric.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 2×3 to 6×9
- **THEN** the three rules leave each unfinished and its clues are symmetric
- **AND** exactly one shading fits each board of up to 25 squares, by a count
  that has no search in it

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 2×3 board, a 3×4 board and an 11×16 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Range refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide. On a strip a shaded square anywhere but an end cuts the
clear squares in two, and the rules settle every strip that has one answer. A
3×3 board SHALL NOT be refused: boards of it have the tier, though none with
symmetric clues, so the generator gives up on it.

#### Scenario: A strip is not dealt at Unreasonable

- **WHEN** a 1×6 board and a 40×1 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 1×6 board is still dealt at Easy, and a 2×3 and a 3×3 board are
  admitted at Unreasonable

#### Scenario: Every board of a strip is tried

- **WHEN** every allowed shading of a 1×3, a 1×5 and a 1×8 board, with every
  set of its clear squares showing its number, is given to the rules, and
  those they leave unfinished are counted
- **THEN** none of them has exactly one answer
- **AND** the same walk over a 2×3 board finds some that do, and over a 3×3
  board 176, none with symmetric clues

### Requirement: Range's menu offers each size at both difficulties

Range's presets SHALL offer each of 6×9, 8×12, 9×13 and 11×16 as Easy and as
Unreasonable, and the default SHALL be the Easy 6×9.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Range's preset menu is read
- **THEN** its four sizes each appear as Easy and then as Unreasonable

### Requirement: A pasted Range board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the three rules
finish it, and as Unreasonable where it has exactly one answer that they do
not reach, whatever lower difficulty its ID states. A board with several
answers SHALL be refused as having more than one solution, and a board with
none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one answer the rules do not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4du`

#### Scenario: A board with several answers or none is refused

- **WHEN** the description `c6h3_6b` of a 4×4 board, which has three answers,
  and one with a 7 in one corner and a 1 in the opposite one, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Range's hint stops where its rules do

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the cells the three rules force from the player's marks and no others,
and where none is forced it SHALL refuse with the collection's sentence that
deduction has run out. It SHALL go on from the cells the player then fills.

#### Scenario: The hint stops, and goes on from a cell filled rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a cell filled wrongly there is reported by the mistake check
- **AND** with a cell filled as the solution has it wherever the hint stops,
  the hint finishes the board
