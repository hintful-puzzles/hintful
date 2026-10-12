# filling Specification

## Purpose
Filling (Fillomino), the puzzle of writing numbers so that every connected group
of equal numbers has exactly that many cells, with uniquely solvable
generation, mistake checking, a selection the player fills with one digit, and
an explained deduction hint.

## Requirements

### Requirement: Rules: A Filling grid is solved when every cell equals its region's size

Filling is Fillomino on a `w × h` grid: every cell is filled with a number `n`
such that each maximal orthogonally-connected region of equal numbers contains
exactly `n` cells. A state SHALL report `solved` when every cell's value equals
the size of its region, and not before.

#### Scenario: A full grid with an oversized region is not a solution

- **WHEN** every cell is filled and one connected region of 3s holds four cells
- **THEN** the board is not solved

### Requirement: Rules: Filling reports mistakes for Check & Save

`findMistakes(state)` SHALL return every player-filled cell whose number
contradicts the board's one answer.

#### Scenario: A wrong fill is flagged and clears

- **WHEN** a player fills a cell with a number that contradicts the unique
  solution and `findMistakes` is called
- **THEN** that cell is reported as a mistake
- **AND** when the cell is corrected the mistake is no longer reported

### Requirement: Params: A Filling params string may leave out its height and its difficulty

Filling's params, a size and a difficulty, SHALL be bounded and encoded as its
`paramConfig` and its declared codec give (`engine-params`, "A game declares
its params encoding once, and both codec halves are derived"), and its menu
and default SHALL be what `presets` and `defaultParams` give. A string with no
height SHALL decode as a square grid, and one with no difficulty letter as
Easy.

#### Scenario: A string that leaves a field out

- **WHEN** `13x9`, written before the game had tiers, is decoded
- **THEN** it decodes as Easy
- **AND** decoding a bare `9` yields a 9×9 square grid

### Requirement: Params: Filling refuses Unreasonable where no board of a size needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide and one, three or four squares long, lying either way.
No clue set of those sizes has one answer that the solver does not reach.

#### Scenario: A strip of three is not dealt at Unreasonable

- **WHEN** a 1×1, 1×3, 3×1, 1×4 or 4×1 Unreasonable board is asked for
- **THEN** it is refused with the sentence that no puzzle of that size is
  Unreasonable
- **AND** the same params with a description supplied are accepted

#### Scenario: Every clue set of a refused size is one the solver finishes

- **WHEN** every clue set of each refused size is counted
- **THEN** each one with exactly one answer is finished by the solver

### Requirement: Params: Filling rejects board sizes it cannot generate

`validateParams` SHALL refuse, when a board is to be dealt at either
difficulty, a board of more than 300 squares, with a reason naming that
maximum.

#### Scenario: A board past the bound is refused with a reason

- **WHEN** an 18×17, a 20×20 and a 1×301 board are validated for generation
- **THEN** each is refused with a message naming 300
- **AND** a 17×17, a 15×20 and a 1×300 board are admitted at either difficulty

### Requirement: Description: Filling descriptions are run-length number grids

The desc SHALL encode the cells in scan order in the engine's run letters
(`engine-params`, "The engine provides the run-letter description grammar"),
where a digit places a clue of that value. A clue SHALL be immutable, and
every other cell SHALL start empty and player-editable.

#### Scenario: Description decodes to the clued board

- **WHEN** a valid desc for a `w × h` board is decoded by `newState`
- **THEN** each clued position holds its number and is immutable
- **AND** every other cell is empty and player-editable

### Requirement: Description: A Filling description is refused unless it fills the grid exactly

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

### Requirement: Generation: Filling generates uniquely solvable boards

`newDesc` SHALL deal a board whose regions are no larger than
`min(max(max(w,h),3), 9)` cells. At Easy it SHALL publish only a clue set from
which the solver still solves the board, and an Easy board SHALL be the one
upstream's generator deals from the same seed.

#### Scenario: Every generated board is solvable

- **WHEN** an Easy board is generated for any preset
- **THEN** the solver fills every cell
- **AND** each resulting region's size equals its number

### Requirement: Generation: An Unreasonable Filling board is a full board with clues hidden while one answer is proved

Filling's Unreasonable boards SHALL be dealt by the engine's deal
(`engine-difficulty`, "The engine deals the Unreasonable board of a game that
searches"), with a strip of the game's own: clues are hidden from a full
board while the search still proves one answer.

#### Scenario: The smallest boards carry the tier

- **WHEN** an Unreasonable 1×2, 2×2, 1×5 or 2×3 board is dealt
- **THEN** it is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Generation: A Filling board is Easy where the solver and the hint both finish it

A board SHALL count as Easy where the solver and the hint finish it, and as
Unreasonable where it has exactly one answer that they do not reach.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

### Requirement: Solver: Filling solver deduces the unique solution

The solver SHALL apply four sound deductive techniques to fixpoint, in a fixed
order: forced single-direction region growth, capacity-forced expansion or the
drop of an isolated `1`, critical distant squares, and per-cell
possible-number bitmap elimination, which includes inferring unclued "ghost"
regions. Every square it fills SHALL be right. How many it fills MAY depend on
the order the squares were filled in, since the last technique is not
monotone.

#### Scenario: Solver completes a generated board

- **WHEN** the solver runs on a freshly generated puzzle's clues
- **THEN** it reports solved
- **AND** the produced board has every region sized to its number

### Requirement: Solver: Filling's search assumes each number an empty square can still take

Filling's search for a clue set's answers SHALL run over the solver, assuming
each number an empty square can still take where the solver stops. Its budget
SHALL be 2,000 positions, and SHALL NOT be lowered: a board already dealt,
which a saved game holds, loads only within it.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the solver finishes, on a 5×5 with one
  answer that it does not reach, on an empty 3×1 and on a 3×1 of three 2s
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with clues taken away and
  the same with one clue changed are each counted by writing numbers into the
  empty squares one at a time
- **THEN** the search reports one answer exactly where one filling fits,
  several where more do and none where none does

### Requirement: Solver: Filling's solver run says when a position is impossible

After the deductions stop, a position SHALL be reported contradictory where a
region is past its number's size or is walled in short of it, and solved only
where every region is exactly its size.

#### Scenario: A region past its size, and one shut in short

- **WHEN** the search is given one position to try on `3x1:222`, `3x1:121`
  and `4x1:13a1`
- **THEN** it reports no answer for each
- **AND** on an empty 3×1 it reports that it stopped

### Requirement: Controls: Filling builds a selection of cells

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

### Requirement: Controls: Filling fill moves and selection

A digit key `0`–`9`, Backspace standing for `0`, SHALL set every selected
non-clue cell to that value, or the cursor's cell when nothing is selected and
the cursor is shown, as a single move. A value above `max(w,h)` SHALL be
rejected, the limit on a 2×2 board being `3` in place of `max(w,h)`.

#### Scenario: Filling a selection sets every selected cell

- **WHEN** two non-clue cells are selected and the digit `3` is pressed
- **THEN** the emitted move sets both cells to `3`
- **AND** after executing it the selection is cleared

#### Scenario: A digit too large for the board is rejected

- **WHEN** a cell is selected on a 3×3 board and the digit `4` is pressed
- **THEN** no move is emitted

### Requirement: Controls: Enter starts and ends a Filling keyboard drag

With the cursor shown, Enter SHALL start a keyboard drag and add the cursor's
square to the selection, and while the drag lasts every square an arrow moves
the cursor onto SHALL join the selection. A second Enter SHALL end the drag
and keep the selection, and Space, Escape, a pointer press and a key that
fills or erases SHALL end it too; a digit too large for the board SHALL NOT.
A clue SHALL NOT join the selection. With the cursor hidden, Enter SHALL only
show it.

#### Scenario: Three squares filled from the keyboard

- **WHEN** the cursor is shown on the first of three empty squares in a row,
  Enter is pressed, the Right arrow is pressed twice and `3` is typed
- **THEN** one move writes 3 in all three squares, and nothing is selected

#### Scenario: The drag passes over a clue

- **WHEN** a keyboard drag moves the cursor across a clue and on to the empty
  square beyond it
- **THEN** the squares on either side of the clue are selected and the clue is
  not

#### Scenario: A press ends the drag

- **WHEN** a keyboard drag is on, the player clicks a square, and then presses
  an arrow
- **THEN** the clicked square alone is selected, and the square the cursor
  moved onto is not

### Requirement: Hint: One region-growth firing is one hint step

The region-growth deduction, the empty squares a region cannot reach its size
without, SHALL be emitted as one step filling all of them, since that single
deduction pins them together. Its
narration SHALL read either as the region fitting exactly into those squares,
when the group completes the region, or as the region being unable to fully
grow without them, when it still needs more. A step's narration SHALL avoid
repeating the region's number.

#### Scenario: One firing forces several squares as a single step

- **WHEN** a region cannot reach its size without more than one empty square
- **THEN** `hint` emits a single step whose move fills all those squares
- **AND** its narration reads as the region fitting exactly into them, or being
  unable to fully grow without them

### Requirement: Hint: A cell no growth group covers is forced on its own

Cells no region-growth group covers SHALL be forced individually by the
remaining rules: a cell no neighboring region can grow into, which is a region
of one and so a 1; a cell where every number but one is eliminated, which takes
the survivor; or a region's single flood-reachable growth square.

#### Scenario: A lonely cell is one step

- **WHEN** the next forced cell is one no neighboring region can grow into
- **THEN** the step fills that single cell with a 1, and its narration says it
  can only be a 1

### Requirement: Hint: A Filling target is ringed empty, and is never its own evidence

Each target square of a displayed step SHALL be ringed with no digit drawn in
it: a call to action and not a filled-in answer, the value being read from
the narration. The evidence, the region the deduction reasons about or the
neighbors that pin a lonely or eliminated cell, SHALL never include a target
square.

#### Scenario: Region-based steps show visible evidence

- **WHEN** `hint` returns a plan for a generated board
- **THEN** every region-growth step carries a non-empty evidence area, and no
  step marks one of its own target squares as evidence

### Requirement: Hint: Filling's hint keeps what the solver deduces from the clues alone

The plan SHALL depart in one thing from `engine-hints`, "A hint is deduced
from the board in play": where no rule forces a square of the board it has
reached, it SHALL take the next still-empty square the solver fills from the
clues alone, narrated with the deduction that forced it there and with its
evidence read from the board the step is shown on. The plan SHALL so finish
every mistake-free position of a board the solver finishes from its clues,
whatever order its squares were filled in.

#### Scenario: A board the rules stall on from its own hint's position

- **WHEN** `hint` is asked on the opening of
  `7x9:a24h8e45552a5255a4d8a2a4d1b544d53a444553b`
- **THEN** applying every step's move in order solves the board
- **AND** the plan made with no run from the clues to keep stops with squares
  empty

#### Scenario: A position the player filled in their own order

- **WHEN** any share of that board's answer is filled in and `hint` is asked
- **THEN** the plan fills every empty square with the answer's number

### Requirement: Hint: Filling's hint finishes an Unreasonable board from numbers tried rightly

On an Unreasonable board the hint's steps SHALL be those its deductions force
from the player's numbers, and with a number entered as the solution has it
wherever the hint stops, the hint SHALL finish the board.

#### Scenario: The hint goes on from a number tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses, and
  a number is entered as the solution has it wherever the hint stops
- **THEN** the hint finishes the board

### Requirement: Look: Filling rendering shows regions, errors, and completion

`redraw` SHALL draw each cell's number, with clue cells and player-filled cells
in distinct colors, a selection highlight, a cursor outline, a completed-region
shade, and an error shade for a region whose size exceeds its number or an
incomplete region that is fully boxed in.

#### Scenario: Overfull region is flagged

- **WHEN** the board contains a region whose connected size exceeds its number
- **THEN** that region's cells are drawn with the error shade

### Requirement: Look: Filling draws a bold border where two regions are told apart

`redraw` SHALL draw a bold border between two adjacent cells that differ when
both are filled, or when either's region is complete or overfull.

#### Scenario: An unfinished region has no border against an empty cell

- **WHEN** a filled cell whose region is smaller than its number sits beside an
  empty cell
- **THEN** no bold border is drawn between them

### Requirement: Look: Filling draws its cells on a quiet surface and keeps its borders

`redraw` SHALL draw every cell the player fills on the collection's cell
surface and a cell holding a clue on the collection's lifted surface of a
given, with the collection's surface grid line between cells. A region's border
is content: it SHALL be drawn in ink as one solid stroke, taking the grid
line's own pixel, so no quiet line shows inside a border.

#### Scenario: A border is one stroke

- **WHEN** two differing filled cells sit side by side
- **THEN** the border between them is drawn in ink across the grid line's pixel
  as well as beside it

### Requirement: Look: Filling's frame is as heavy as a border between two regions

The board's edge is always a region's border, and the frame SHALL be as heavy
as a border between two regions and no heavier.

#### Scenario: The edge of the board

- **WHEN** the opening frame is drawn
- **THEN** the line round the board is ink, and with each edge cell's own
  border it is exactly as thick, on all four sides, as the border between two
  differing filled cells

### Requirement: Look: A shade replaces the cell's surface, and four kinds of cell are told apart

A completed region's shade, the error shade and the selection highlight SHALL
each replace the cell's surface, a clue's included. A completed region, a
selected cell, a clue and an empty cell SHALL each be told from the others in
both schemes.

#### Scenario: A clue is told by the cell under it

- **WHEN** the opening frame is drawn
- **THEN** every clue's cell is the lifted surface or the completed-region
  shade, and every empty cell is the plain cell surface
