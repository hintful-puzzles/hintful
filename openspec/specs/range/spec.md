# range Specification

## Purpose
Range (Kurodoko), the puzzle of shading squares so that no two shaded
squares touch, the squares left clear stay connected, and each number counts
the clear squares it sees in four directions, itself included. The game
highlights errors live, checks mistakes against the solution, and gives an
explained deduction hint with its own legend of marks.

## Requirements

### Requirement: Range game implements the Game interface

The engine SHALL provide a registered `range` game implementing `Game`. The
player paints some white squares black so that no two black squares are
orthogonally adjacent, all white squares stay connected, and every numbered
clue equals the number of white squares visible from it in a straight line,
itself counted once (`h + v - 1`). The game SHALL provide `solve` and
`textFormat`, and SHALL NOT provide `statusbarText`.

#### Scenario: A clue counts itself once

- **WHEN** a clue sees a horizontal white run of 3 and a vertical white run of
  2, each run including the clue's own square
- **THEN** the clue it must equal is 4

### Requirement: Range params are a width and a height

Params SHALL be `w` and `h`, encoded `{w}x{h}`, and a bare number SHALL decode
as a square board of that size. Four presets SHALL be offered, each taller
than wide: 6×9, 8×12, 9×13 and 11×16.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 13, h: 9 }` are encoded
- **THEN** the result is `13x9`
- **AND** decoding `13x9` round-trips the params
- **AND** decoding the bare `12` yields `{ w: 12, h: 12 }`

### Requirement: Range params are refused outside their bounds

The width and height items SHALL each declare a lower bound of 1, from which
the engine refuses a non-positive dimension. `validateParams` SHALL refuse a
`w + h` above 128, which overflows the cell encoding, and, when `full`, a grid
with both dimensions at most 2 (1×1, 1×2, 2×1 and 2×2), which admits no good
puzzle.

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with full generation on a 2×2 grid
- **THEN** it returns a non-null error string
- **AND** params with a non-positive dimension are refused by the engine from
  the declared bound

### Requirement: Range descriptions are run-length clue grids

The desc SHALL encode the board in scan order: the decimal digits of each
clue, a letter `a`-`z` for each run of 1-26 blank (non-clue) cells, and `_`
as an explicit separator exactly where two clues would otherwise merge.
`newState` SHALL parse the desc into the grid with clue cells holding their
value and every other cell `EMPTY`.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and the clue grid is
  re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: A malformed Range description is refused

Parsing a desc SHALL refuse any character other than a digit, a run letter or
a separating `_`, any clue outside `1 .. w + h - 1`, and any desc whose
decoded cell count differs from `w * h`. The refusal SHALL be raised by
`newState`'s parse, from which the engine derives its verdict on a desc.

#### Scenario: A malformed description is rejected

- **WHEN** a desc with an invalid character, an out-of-range clue, or a
  decoded length mismatching the params is validated
- **THEN** the verdict is a non-null error string

### Requirement: Range generates uniquely solvable symmetric boards

Every board `newDesc` generates SHALL be uniquely solvable by the deductive
solver without search and SHALL have two-way rotationally symmetric clues. On
a grid at least two squares each way it SHALL contain at least one black
square.

#### Scenario: Generated boards are valid and solvable

- **WHEN** `newDesc` runs for a seeded RNG across all four presets
- **THEN** every desc is accepted as a valid description
- **AND** the deductive solver, without search, solves every resulting board
  from its visible clues alone to a state with no errors

### Requirement: Range's generator paints black squares, then strips clues

`newDesc` SHALL paint black up to `n / 3` randomly chosen squares, skipping
any that would touch a black square or disconnect the white region, and
compute every white square's clue from its horizontal and vertical white
runs. It SHALL then remove every clue rotationally symmetric to a black
square, retrying the whole generation when that leaves the board unsolvable
without search, and then remove rotationally symmetric pairs in random order,
keeping only a removal that leaves it so solvable.

#### Scenario: A removal that needs search is put back

- **WHEN** removing a symmetric pair of clues leaves a board the deductive
  solver cannot finish without search
- **THEN** both clues are restored and the next pair is tried

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

### Requirement: Range's Solve searches where deduction stalls

`solve` SHALL run the full solver from the initial clues: the three rules,
and only when they stall, a search that tries an undecided cell each color in
turn and keeps a completion on which `findErrors` finds no error. It SHALL
return one move, carrying the solve flag, that sets every non-clue cell, or an
error when the clues admit no completion.

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

### Requirement: Range is solved exactly while it has no error

The board SHALL be reported solved exactly while `findErrors` finds no error
on it, judged from the board however it was reached.

#### Scenario: Completing the board is detected

- **WHEN** a move paints the final black square of the unique solution
- **THEN** `findErrors` reports no error, `status` returns `"solved"`, and a
  flash plays

### Requirement: Range's keyboard cursor marks white with shift

A keyboard cursor SHALL move within the grid, and shift with a cursor
direction SHALL mark the vacated and/or entered empty cells white. The cursor
SHALL be the collection's shared `(x, y)` shape, so `cursor.x` is this game's
column and `cursor.y` its row, while the row-major grid's own helpers take
`(r, c)`.

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

`findMistakes` SHALL re-solve the puzzle from its initial clues and return
every player-marked non-clue cell whose mark contradicts the unique solution:
black where the solution is white, or marked white where the solution is
black. It SHALL return none when the marks are consistent or undecided.

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

### Requirement: A Range hint is refused on a solved or mistaken board

A hint SHALL be refused when the board is already solved or when
`findMistakes(state)` is non-empty, since a deduction seeded from
contradictory marks would mislead. The engine makes both refusals before it
calls the game, and `hint` itself SHALL refuse, with the engine's
deduction-exhausted refusal, only when the rules force no cell.

#### Scenario: Hint refuses on a solved or mistaken board

- **WHEN** a hint is requested on a solved board, or on a board where the
  player has marked a cell contradicting the unique solution
- **THEN** the request is refused with an explanatory error

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

### Requirement: A known-white Range cell is told without a fill

Independently of hints, `redraw` SHALL render a known-white cell so that it
is told from an undecided one without a fill of its own: a clue by the lifted
surface under it, since clues are implicitly white, and a player white mark
by its cross, leaving an undecided cell the plain cell surface.

#### Scenario: A white mark differs from an undecided cell only by its cross

- **WHEN** a cell marked white and an undecided cell are drawn
- **THEN** both are the plain cell surface and only the first holds a cross

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

### Requirement: Range's cursor and hint marks sit at the cell's edge

The keyboard cursor and every hint mark SHALL be drawn at the cell's edge,
beside the piece.

#### Scenario: The cursor on a shaded cell leaves the piece whole

- **WHEN** the keyboard cursor is shown on a shaded cell
- **THEN** the cell holds its shaded piece
- **AND** the cursor is drawn out at the cell's corners

### Requirement: Range names no hue of its own

The game SHALL name no hue of its own. Its hint sentences, its control words
and its hint-mark legend SHALL say the collection's word for the shaded color
and its word for a cell that is not shaded, and its help page SHALL name the
shaded color by placeholder.

#### Scenario: A hint says the word for the color the piece is drawn in

- **WHEN** a hint step concludes that a cell must be shaded
- **THEN** its sentence says the collection's word for the shaded color
- **AND** applying the step draws the shaded piece in the cell
