# range Specification

## Purpose
Range (Kurodoko), the puzzle of shading squares so that no two shaded
squares touch, the squares left clear stay connected, and each number counts
the clear squares it sees in four directions, itself included. This capability
specifies its port to the TS engine, with live error highlighting,
mistake-checking, and an explained deduction hint with its own legend of marks.

## Requirements

### Requirement: Range game implements the Game interface

The engine SHALL provide a registered `range` game implementing
`Game<RangeParams, RangeState, RangeMove, RangeUi, RangeDrawState>`: the
Nikoli puzzle Kurodoko / Kuromasu, in which the player paints some white
squares black so that no two black squares are orthogonally adjacent, all
white squares stay connected, and every numbered clue equals the number of
white squares visible from it in a straight line (itself counted once,
`h + v - 1`). Params SHALL be `w` and `h`, encoded `{w}x{h}`. Four presets —
6×9, 8×12, 9×13, 11×16, upstream's sizes turned to draw taller than wide —
SHALL be offered. `validateParams` SHALL
reject non-positive dimensions, a `w + h` that overflows the cell encoding,
and (when `full`) the degenerate 1×1, 1×2, 2×1, and 2×2 grids that admit no
good puzzle. The game SHALL provide `solve` and `textFormat`, and SHALL NOT provide `statusbarText`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 13, h: 9 }` are encoded
- **THEN** the result is `13x9`
- **AND** decoding `13x9` round-trips the params
- **AND** decoding the bare `12` yields `{ w: 12, h: 12 }`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with full generation on a 2×2 grid, or
  with a non-positive dimension
- **THEN** it returns a non-null error string

### Requirement: Range descriptions are run-length clue grids

The desc SHALL encode the board in scan order: the decimal digits of each
clue, a letter `a`-`z` for each run of 1-26 blank (non-clue) cells, and `_`
as an explicit separator where two clues or a clue and a run would otherwise
merge, exactly as upstream. `validateDesc` SHALL reject any other character,
any clue outside `1 .. w + h - 1`, and any desc whose decoded cell count
differs from `w * h`. `newState` SHALL parse the desc into the grid with clue
cells holding their value and every other cell `EMPTY`.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and the clue grid is
  re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an invalid character, an
  out-of-range clue, or a decoded length mismatching the params
- **THEN** it returns a non-null error string

### Requirement: Range generates uniquely solvable symmetric boards

`newDesc` SHALL generate a board by painting up to `n / 3` randomly chosen
squares black (skipping any that would touch an existing black square or
disconnect the white region), computing every white square's clue from its
horizontal and vertical white runs, then removing clues — all clues
rotationally symmetric to a black square, then rotationally symmetric pairs
in random order — keeping only removals that leave the board solvable
**without** recursion, retrying the whole generation when the symmetric
removals cannot all be made. Every generated board SHALL be uniquely solvable
by the deductive solver without recursion, contain at least one black square,
and have two-way rotationally symmetric clues.

#### Scenario: Generated boards are valid and solvable

- **WHEN** `newDesc` runs for a seeded RNG across all four presets
- **THEN** every desc passes `validateDesc`
- **AND** the deductive solver (without recursion) solves every resulting
  board from its visible clues alone to a state with no errors

### Requirement: Range solves boards with four deductive rules plus recursion

The solver SHALL reach a unique solution by repeatedly applying, to a
fixpoint: (1) a cell adjacent to a black cell is white; (2) a clue whose
visible white run in three directions is fixed forces the remaining count
into the fourth direction, and a cell whose inclusion would exceed the clue
is black; (3) a square whose painting black would disconnect the white region
(a cut vertex of the white graph) is white; and only when those stall, (4)
recursion — try a cell both colors and force the surviving color when one
leads to a contradiction. `solve` SHALL run the full solver (including
recursion) from the initial clues and return the completing sequence of
cell-sets, or an error when the board contains a contradiction.

#### Scenario: The adjacency rule whitens a neighbor

- **WHEN** the solver runs on a grid with a black cell beside an empty cell
- **THEN** that empty cell is set white

#### Scenario: Solve completes a generated board

- **WHEN** the Solve command runs on a generated board
- **THEN** it returns a move whose cell-sets paint every undecided cell, after
  which `status` returns `"solved"` and `findErrors` reports no error

### Requirement: Range marks cells via three-state cycling moves

A `RangeMove` SHALL be a list of cell-sets (each painting a cell black, white,
or empty) plus an optional solve flag (upstream's `S`). `executeMove` SHALL be
pure and throw on an out-of-bounds or clue-cell target; the board SHALL be
reported solved exactly while `findErrors` finds no error on it, judged from the board however it was reached. Left-button / select on a
non-clue cell SHALL cycle empty → black → white → empty; right-button /
select2 SHALL cycle empty → white → black → empty; a clue cell SHALL be
inert. A keyboard cursor SHALL move within the grid, and shift + a cursor
direction SHALL mark the vacated and/or entered empty cells white.

Range's grid is row-major and its own helpers take `(r, c)`. The keyboard
cursor is nevertheless the collection's shared `(x, y)` shape, so `cursor.x` is
this game's column and `cursor.y` its row — the one place in the collection
where the two conventions meet, and therefore the one place it is worth saying.

#### Scenario: Left and right cycle in opposite directions

- **WHEN** an empty non-clue cell receives a left-button action, then another,
  then another
- **THEN** it passes black → white → empty
- **AND** the same cell under three right-button actions passes white → black
  → empty

#### Scenario: Clue cells reject marking

- **WHEN** a marking action targets a cell holding a clue
- **THEN** `interpretMove` returns `null` and the cell is unchanged

#### Scenario: Completing the board is detected

- **WHEN** a move paints the final black square of the unique solution
- **THEN** `findErrors` reports no error, `status` returns `"solved"`, and a
  flash plays

### Requirement: Range highlights errors live and checks mistakes against the solution

`redraw` SHALL highlight, in the error color, every cell currently violating
a rule — a black cell orthogonally adjacent to another black cell, a clue
whose visible white run cannot equal its number, or a white cell cut off from
the main white component — recomputed each frame from `findErrors`, matching
upstream's live error display. Separately, `findMistakes` SHALL re-solve the
puzzle from its initial clues and return every player-marked non-clue cell
whose mark contradicts the unique solution (black where the solution is white,
or marked white where the solution is black), returning none when the marks
are consistent or undecided.

#### Scenario: A black-adjacency violation reddens live

- **WHEN** two orthogonally adjacent cells are both painted black
- **THEN** `redraw` frames both in the error color without any explicit check
  action

#### Scenario: findMistakes flags a wrong black

- **WHEN** the player paints black a cell that is white in the unique solution
  and Check & Save runs
- **THEN** `findMistakes` returns that cell
- **AND** a board whose marks all agree with the solution returns no mistakes

### Requirement: Range provides an explained deduction hint

The `range` game SHALL implement `hint(state)` returning a plan-carrying,
narrated hint that explains *why* each move is forced (the fork's hint quality
bar), and `hintKeepTrack` so the plan auto-advances as the player follows it.
The hint SHALL refuse (a `{ ok: false }` result) when the board is already
solved or when `findMistakes(state)` is non-empty, since a deduction seeded
from contradictory marks would mislead. Otherwise it SHALL deduce, from the
player's current marks, the ordered sequence of forced cells (the remaining
no-recursion solution) and return one narrated `HintStep` per forced cell.
Each step's narration SHALL state the deduction that forces the cell — the
adjacent black square (a neighbor of a black must be white), a clue already
satisfied (its run must stop, so the next cell is black), a clue that would be
overrun (the cell must be black), a clue that can only reach its count one way
(the cell must be white), or a cut-vertex of the white region (it must be
white to keep the white cells connected). `hintKeepTrack` SHALL report
`"completed"` when the player's move sets the hinted cell to the hinted value
and `"off"` otherwise. `redraw` SHALL render the displayed step: the target
cell ringed in the hint color at its edge, with no preview of the forced mark
(the narration says which mark), and the deduction's **evidence outlined as an
area** in the evidence color — the clue's line of sight (satisfied/overrun),
what the clue already sees along its other arms (reach), or the non-black
cells a cut would isolate (connect) — so the picture the narration names is
visible, not merely a single premise cell. A `reach` step SHALL also stripe
the run the clue must see along, from the clue up to the target. A premise
that is a **black** square (the adjacent one, which keeps its piece) SHALL
take a doubled outline in a color of its own. The evidence SHALL be
computed against the board state as each step's deduction fires (the prior
steps applied), so the run grows as the player follows the plan, and SHALL
never include the target cell itself.

Independently of hints, `redraw` SHALL render a **known-white cell so that it
is told from an undecided one without a fill of its own**: a clue by the
lifted surface under it (clues are implicitly white), and a player white mark
by its dot, leaving an undecided cell the plain cell surface, so a beginner
reads determined state at a glance.

#### Scenario: Hint explains the next forced move

- **WHEN** `hint` is called on an unsolved, mistake-free generated board
- **THEN** it returns `{ ok: true }` with a non-empty list of steps
- **AND** the first step's move is a legal `executeMove` whose narration names
  the deduction (adjacency / clue / connectedness) that forces its cell
- **AND** applying every step's move in order solves the board

#### Scenario: Every hint step shows visible evidence

- **WHEN** `hint` returns a plan for a generated board
- **THEN** every step carries a non-empty outlined area, a striped run or an
  outlined black premise cell — never a bare conclusion — and neither the
  outline nor the run contains the step's own target cell

#### Scenario: Hint refuses on a solved or mistaken board

- **WHEN** `hint` is called on a solved board, or on a board where the player
  has marked a cell contradicting the unique solution
- **THEN** it returns `{ ok: false }` with an explanatory error

#### Scenario: Following the hint advances the plan

- **WHEN** the player makes the move the current hint step describes
- **THEN** `hintKeepTrack` returns `"completed"`
- **AND** a move that sets a different cell, or the hinted cell to a different
  value, returns `"off"`

### Requirement: Range hint color legend

When a Range hint is displayed, `redraw` SHALL distinguish the element types the
deduction names using a stable legend of marks, none of them a fill that hides
a cell's content:

- The **forced cell** (the move) SHALL be ringed `COL_HINT`, the same whether
  the step shades it or marks it not shaded, with no preview of the forced
  mark.
- **Premise cells that hold no shaded piece** (a clue's line of sight, the
  cells a cut would disconnect) SHALL be outlined `COL_HINT_CELL`.
- A cited **shaded square** premise (the adjacent one in an `adjacency`
  deduction) SHALL take a doubled outline in `COL_HINT_SHADEDREF`, not
  `COL_HINT` — so a deduction that names both a shaded premise and the forced
  cell does not draw them in the same color. The cell keeps its shaded piece.
- The **run** a `reach` deduction names SHALL be striped in `COL_HINT`.
- The **clue** a deduction counts from SHALL have its number drawn in
  `COL_HINT`.

The legend SHALL be consistent across deductions. Which cell takes which mark
SHALL be read from the step's words, so the sentence and the picture name the
same cells.

#### Scenario: A cited black square rings distinct from the forced cell

- **WHEN** an `adjacency` hint is displayed (a shaded square forces an adjacent
  cell to be not shaded)
- **THEN** the cited shaded premise takes a doubled outline in
  `COL_HINT_SHADEDREF` and the forced cell is ringed `COL_HINT`, in different
  colors

#### Scenario: Premises that are not shaded are outlined

- **WHEN** a `satisfied`, `overrun`, `reach`, or `connect` hint cites the cells
  a clue sees or the cells a cut would disconnect
- **THEN** those premise cells are outlined `COL_HINT_CELL`, distinct from
  both the target and any cited shaded square

### Requirement: Range draws a shaded cell as the collection's shaded piece

`redraw` SHALL draw the board as pieces on a quiet surface. A cell the player
has shaded (the state the other requirements call black, after upstream) SHALL
hold the collection's shaded piece, in its color and shape, inset on its cell.
A cell the player has marked as not shaded (the state they call white) SHALL
hold the collection's ruled-out dot and take no fill of its own, and an
undecided cell SHALL be the plain cell surface, so no state is told by a step
of gray. A clue cell SHALL sit on the lifted surface of a given, with its
number in ink. The line between cells and the frame round the grid SHALL be
the surface's grid line.

A cell in error SHALL keep its content and take a frame in the error color at
its edge, with a clue's number or a dot drawn in the error color; a shaded
piece keeps its own color. The completion flash SHALL lift every cell to the
given's surface on its lit beats, a step that reads in both schemes, and leave
the pieces standing. The keyboard cursor and every
hint mark SHALL be drawn at the cell's edge, beside the piece.

The game SHALL name no hue of its own: its hint sentences, its control words
and its hint-mark legend SHALL say the collection's word for the shaded color
and its word for a cell that is not shaded, and its help page SHALL name the
shaded color by placeholder.

#### Scenario: Three states on one surface

- **WHEN** a board holds a shaded cell, a cell marked not shaded and an
  undecided cell
- **THEN** all three are drawn on the same cell surface
- **AND** the first holds the shaded piece, the second the ruled-out dot and
  the third nothing

#### Scenario: A clue is told by the cell under it

- **WHEN** a board with a clue is drawn
- **THEN** the clue's cell is the lifted surface and no other cell is

#### Scenario: A shaded cell in error is still a shaded piece

- **WHEN** two orthogonally adjacent cells are both shaded
- **THEN** each holds a piece in the shaded color
- **AND** each cell is framed in the error color

#### Scenario: A hint says the word for the color the piece is drawn in

- **WHEN** a hint step concludes that a cell must be shaded
- **THEN** its sentence says the collection's word for the shaded color
- **AND** applying the step draws the shaded piece in the cell
