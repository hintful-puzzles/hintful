# filling Specification

## Purpose
Filling (Fillomino), the puzzle of writing numbers so that every connected group
of equal numbers has exactly that many cells, with uniquely solvable
generation, mistake checking, a selection the player fills with one digit, and
an explained deduction hint with its own color legend.

## Requirements

### Requirement: Filling's parameters

Params SHALL be `w` and `h`, encoded `{w}x{h}`. A `w` or an `h` below 1 SHALL
be refused, and so SHALL a `w·h` that is unreasonably large.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 13, h: 9 }` are encoded
- **THEN** the result is `13x9`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `9` yields a 9×9 square grid

### Requirement: Filling descriptions are run-length number grids

The desc SHALL encode the immutable clue cells in scan order: a lowercase letter
`a`–`z` advances past a run of `1`–`26` empty (unclued) cells, and a digit
places a clue of that value. A clue SHALL be immutable, and every other cell
SHALL start empty and player-editable.

#### Scenario: Description decodes to the clued board

- **WHEN** a valid desc for a `w × h` board is decoded by `newState`
- **THEN** each clued position holds its number and is immutable
- **AND** every other cell is empty and player-editable

### Requirement: A Filling description is refused unless it fills the grid exactly

The description's parse SHALL refuse any character that is neither a lowercase
letter nor a digit, SHALL refuse a clue of `0` or one above `max(w, h, 3)`, and
SHALL require the decoded area to equal `w·h` exactly.

#### Scenario: Mismatched description length is rejected

- **WHEN** a desc whose decoded area is less than or greater than `w·h` is
  validated
- **THEN** the verdict is a non-null error string

#### Scenario: A zero clue is refused

- **WHEN** a desc for a 3×1 board reads `1a0`
- **THEN** it is refused as out of range

### Requirement: Filling generates uniquely solvable boards

`newDesc` SHALL deal a board whose regions are no larger than
`min(max(max(w,h),3), 9)` cells, and SHALL publish only a clue set from which
the solver still solves the board, so the clues uniquely determine the
solution.

#### Scenario: Every generated board is solvable

- **WHEN** a board is generated for any preset
- **THEN** the solver fills every cell
- **AND** each resulting region's size equals its number

### Requirement: Filling solver deduces the unique solution

The solver SHALL apply four sound, confluent deductive techniques to fixpoint:
forced single-direction region growth, capacity-forced expansion or the drop of
an isolated `1`, critical distant squares, and per-cell possible-number bitmap
elimination, which includes inferring unclued "ghost" regions.

#### Scenario: Solver completes a generated board

- **WHEN** the solver runs on a freshly generated puzzle's clues
- **THEN** it reports solved
- **AND** the produced board has every region sized to its number

### Requirement: Filling builds a selection of cells

`interpretMove` SHALL support selecting cells: a left-click and a left-drag
SHALL build a selection, the keyboard cursor SHALL select several cells,
`CURSOR_SELECT2` at a shown cursor SHALL toggle the cursor's cell in the
selection unless the cell is a clue, and Escape SHALL clear it. The selection
SHALL be cleared after every committed move.

#### Scenario: Escape clears the selection

- **WHEN** two cells are selected and Escape is pressed
- **THEN** no cell is selected

#### Scenario: The first select press only shows the cursor

- **WHEN** the cursor is hidden and `CURSOR_SELECT2` is pressed
- **THEN** the cursor is shown and no cell joins the selection

### Requirement: Filling fill moves and selection

A digit key `0`–`9`, Backspace standing for `0`, SHALL set every selected
non-clue cell to that value, or the cursor's cell when nothing is selected and
the cursor is shown. It SHALL emit a single move, and only one that changes at
least one cell. A value above `max(w,h)` SHALL be rejected, the limit on a 2×2
board being `3` in place of `max(w,h)`.

#### Scenario: Filling a selection sets every selected cell

- **WHEN** two non-clue cells are selected and the digit `3` is pressed
- **THEN** the emitted move sets both cells to `3`
- **AND** after executing it the selection is cleared

#### Scenario: A digit too large for the board is rejected

- **WHEN** a cell is selected on a 3×3 board and the digit `4` is pressed
- **THEN** no move is emitted

### Requirement: A Filling grid is solved when every cell equals its region's size

Filling is Fillomino on a `w × h` grid: every cell is filled with a number `n`
such that each maximal orthogonally-connected region of equal numbers contains
exactly `n` cells. A state SHALL report `solved` when every cell's value equals
the size of its region, and not before.

#### Scenario: A full grid with an oversized region is not a solution

- **WHEN** every cell is filled and one connected region of 3s holds four cells
- **THEN** the board is not solved

### Requirement: Filling rendering shows regions, errors, and completion

`redraw` SHALL draw each cell's number, with clue cells and player-filled cells
in distinct colors, a selection highlight, a cursor outline, a completed-region
shade, and an error shade for a region whose size exceeds its number or an
incomplete region that is fully boxed in.

#### Scenario: Overfull region is flagged

- **WHEN** the board contains a region whose connected size exceeds its number
- **THEN** that region's cells are drawn with the error shade

### Requirement: Filling draws a bold border where two regions are told apart

`redraw` SHALL draw a bold border between two adjacent cells that differ when
both are filled, or when either's region is complete or overfull.

#### Scenario: An unfinished region has no border against an empty cell

- **WHEN** a filled cell whose region is smaller than its number sits beside an
  empty cell
- **THEN** no bold border is drawn between them

### Requirement: Filling flashes when the board is solved

On the transition to solved, and not when Solve made it, the board SHALL flash.

#### Scenario: A fill flashes and Solve does not

- **WHEN** the player's last fill completes the grid
- **THEN** the board flashes
- **AND** a board completed by Solve does not

### Requirement: Filling reports mistakes for Check & Save

The game SHALL implement `findMistakes(state)` by re-solving from the immutable
clues to the unique solution and returning every player-filled cell whose number
contradicts the solution, returning an empty result when the clues are not
uniquely solvable.

#### Scenario: A wrong fill is flagged and clears

- **WHEN** a player fills a cell with a number that contradicts the unique
  solution and `findMistakes` is called
- **THEN** that cell is reported as a mistake
- **AND** when the cell is corrected the mistake is no longer reported

### Requirement: Filling provides an explained deduction hint

The `filling` game SHALL implement `hint(state)` returning a plan-carrying,
narrated hint that explains why each move is forced, and `hintKeepTrack` so the
plan auto-advances as the player follows it. From the player's current board, `hint`
SHALL deduce an ordered sequence of forced steps that together solve the board,
returning one narrated `HintStep` per step. Each step's narration SHALL name
the deduction that forces it and SHALL avoid repeating the region's number.

#### Scenario: Hint explains the next forced move and solves the board

- **WHEN** `hint` is called on an unsolved, mistake-free generated board
- **THEN** it returns `{ ok: true }` with a non-empty list of steps
- **AND** each step's move is a legal `executeMove` whose narration names the
  deduction (region growth / lonely cell / elimination) that forces its squares
- **AND** applying every step's move in order solves the board

### Requirement: One region-growth firing is one hint step

The region-growth deduction, the empty squares a region cannot reach its size
without, SHALL be emitted as one step filling all of them, since that single
deduction pins them together. Its
narration SHALL read either as the region fitting exactly into those squares,
when the group completes the region, or as the region being unable to fully
grow without them, when it still needs more.

#### Scenario: One firing forces several squares as a single step

- **WHEN** a region cannot reach its size without more than one empty square
- **THEN** `hint` emits a single step whose move fills all those squares
- **AND** its narration reads as the region fitting exactly into them, or being
  unable to fully grow without them

### Requirement: A cell no growth group covers is forced on its own

Cells no region-growth group covers SHALL be forced individually by the
remaining rules: a cell no neighboring region can grow into, which is a region
of one and so a 1; a cell where every number but one is eliminated, which takes
the survivor; or a region's single flood-reachable growth square.

#### Scenario: A lonely cell is one step

- **WHEN** the next forced cell is one no neighboring region can grow into
- **THEN** the step fills that single cell with a 1, and its narration says it
  can only be a 1

### Requirement: hintKeepTrack follows a Filling step square by square

`hintKeepTrack` SHALL report `"completed"` when the player's move fills all of
the step's squares with the hinted value, `"onTrack"`, shrinking the step to
the still-empty squares, when it fills only some of them, and `"off"` when it
touches any other cell or uses the wrong value.

#### Scenario: Following a multi-square hint advances or shrinks the plan

- **WHEN** the player fills all of the current step's squares with its value
- **THEN** `hintKeepTrack` returns `"completed"`
- **AND** filling only some of them returns `"onTrack"` with the step shrunk to
  the squares still to fill
- **AND** a move touching any other cell, or using a different value, returns
  `"off"`

### Requirement: Filling draws the displayed step's target and evidence

`redraw` SHALL render the displayed step. Each target square SHALL be ringed
with no digit drawn in it: a call to action and not a filled-in answer, the
value being read from the narration. The deduction's evidence SHALL be marked
too, so the picture the narration names is visible: the region the deduction
reasons about, or the neighboring cells that pin a lonely or eliminated cell.
The evidence cells' digits SHALL remain readable, and the evidence SHALL never
include a target square.

#### Scenario: Region-based steps show visible evidence

- **WHEN** `hint` returns a plan for a generated board
- **THEN** every region-growth step carries a non-empty evidence area, and no
  step marks one of its own target squares as evidence

### Requirement: Filling hint color legend

When a Filling hint is displayed, `redraw` SHALL distinguish the element types
the deduction names by a stable legend, each color paired with a non-color
cue. A target square SHALL be ringed in `COL_HINT`, the region the sentence
names SHALL be striped in `COL_HINT`, and the neighbors that pin a lonely or
eliminated cell SHALL be outlined in `COL_HINT_CELL`. The legend SHALL be
consistent across the deduction kinds (`growth` exact and partial, `blocked`,
`lonely`, `bitmap`).

#### Scenario: The empty target reads distinct from the striped premise

- **WHEN** a `growth` hint names a region of N and the empty squares it must grow
  into
- **THEN** the target squares are ringed in `COL_HINT` with no digit, and the
  cited region is striped with its digits drawn over the stripes and no outline

#### Scenario: Grouped target squares share one color

- **WHEN** one deduction forces several empty squares at once
- **THEN** every forced square is ringed in the same `COL_HINT`, not distinct
  colors

### Requirement: Filling provides on-screen key labels

Filling's on-screen keypad SHALL be the digits `1` to `9`, each labeled by its
digit, followed by the collection's Clear key. It SHALL be those keys whatever
the board's size.

#### Scenario: The keypad is digits 1–9 plus clear

- **WHEN** the key labels are requested for any Filling board
- **THEN** the result is the buttons `1,2,…,9` followed by a clear key

### Requirement: Filling draws its cells on a quiet surface and keeps its borders

`redraw` SHALL draw every cell the player fills on the collection's cell
surface and a cell holding a clue on the collection's lifted surface of a
given, with the collection's surface grid line between cells. A region's border
is content: it SHALL be drawn in ink as one solid stroke, taking the grid
line's own pixel, so no quiet line shows inside a border.

#### Scenario: A border is one stroke

- **WHEN** two differing filled cells sit side by side
- **THEN** the border between them is drawn in ink across the grid line's pixel
  as well as beside it

### Requirement: Filling's frame is as heavy as a border between two regions

The board's edge is always a region's border, and the frame SHALL be as heavy
as a border between two regions and no heavier.

#### Scenario: The edge of the board

- **WHEN** the opening frame is drawn
- **THEN** the line round the board is ink, and with each edge cell's own
  border it is exactly as thick, on all four sides, as the border between two
  differing filled cells

### Requirement: A shade replaces the cell's surface, and four kinds of cell are told apart

A completed region's shade, the error shade and the selection highlight SHALL
each replace the cell's surface, a clue's included. A completed region, a
selected cell, a clue and an empty cell SHALL each be told from the others in
both schemes.

#### Scenario: A clue is told by the cell under it

- **WHEN** the opening frame is drawn
- **THEN** every clue's cell is the lifted surface or the completed-region
  shade, and every empty cell is the plain cell surface
