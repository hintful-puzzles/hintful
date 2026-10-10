# filling Specification

## Purpose
Filling (Fillomino), the puzzle of writing numbers so that every connected group
of equal numbers has exactly that many cells, with uniquely solvable
generation, mistake checking, a selection the player fills with one digit, and
an explained deduction hint with its own color legend.

## Requirements

### Requirement: Filling's parameters

Params SHALL be `w`, `h` and a difficulty, Easy or Unreasonable. A `w` or an
`h` below 1 SHALL be refused. The encoding SHALL carry `{w}x{h}`, and the
difficulty in the full form only, as `de` or `du`. A string with no difficulty
letter SHALL decode as Easy.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 13, h: 9 }` are encoded
- **THEN** the result is `13x9`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `9` yields a 9×9 square grid

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 13×9 board is encoded
- **THEN** the full encoding is `13x9du` and the shared one `13x9`
- **AND** `13x9`, written before the game had tiers, decodes as Easy

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
`min(max(max(w,h),3), 9)` cells. At Easy it SHALL publish only a clue set from
which the solver still solves the board, and an Easy board SHALL be the one
upstream's generator deals from the same seed.

#### Scenario: Every generated board is solvable

- **WHEN** an Easy board is generated for any preset
- **THEN** the solver fills every cell
- **AND** each resulting region's size equals its number

### Requirement: Filling solver deduces the unique solution

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

The game SHALL implement `findMistakes(state)` by taking the board's one
answer from the search that counts its answers, at either difficulty, and
returning every player-filled cell whose number contradicts it. It SHALL
return an empty result when the search did not prove exactly one answer.

#### Scenario: A wrong fill is flagged and clears

- **WHEN** a player fills a cell with a number that contradicts the unique
  solution and `findMistakes` is called
- **THEN** that cell is reported as a mistake
- **AND** when the cell is corrected the mistake is no longer reported

### Requirement: Filling provides an explained deduction hint

`hint(state)` SHALL return a plan-carrying, narrated hint that explains why
each move is forced, and `hintKeepTrack` SHALL advance the plan as the player
follows it. From any mistake-free position, `hint` SHALL deduce an ordered
sequence of forced steps that together solve the board, one narrated `HintStep`
per step. Each step's narration SHALL name the deduction that forces it and
SHALL avoid repeating the region's number.

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

### Requirement: Filling's hint keeps what the solver deduces from the clues alone

Where no rule forces a square of the board the plan has reached, the plan
SHALL take the next still-empty square the solver fills from the clues alone,
narrated with the deduction that forced it there and with its evidence read
from the board the step is shown on. The plan SHALL so finish every
mistake-free position of a board that loads, whatever order its squares were
filled in.

#### Scenario: A board the rules stall on from its own hint's position

- **WHEN** `hint` is asked on the opening of
  `7x9:a24h8e45552a5255a4d8a2a4d1b544d53a444553b`
- **THEN** applying every step's move in order solves the board
- **AND** the plan made with no run from the clues to keep stops with squares
  empty

#### Scenario: A position the player filled in their own order

- **WHEN** any share of that board's answer is filled in and `hint` is asked
- **THEN** the plan fills every empty square with the answer's number

### Requirement: Filling counts a clue set's answers by a bounded search

The game SHALL count a clue set's answers up to two by trial and error over
the solver, assuming each number an empty square can still take where the
solver stops. It SHALL report one answer, several, none, or that it stopped
at its budget, which SHALL be counted in positions and never in time. Solve
SHALL take the answer from it at either difficulty.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the solver finishes, on a 5×5 with one
  answer that it does not reach, on an empty 3×1 and on a 3×1 of three 2s
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with clues taken away and
  the same with one clue changed are each counted by writing numbers into the
  empty squares one at a time
- **THEN** the search reports one answer exactly where one filling fits,
  several where more do and none where none does

### Requirement: Filling's solver run says when a position is impossible

After the deductions stop, a position SHALL be reported contradictory where a
region is past its number's size or is walled in short of it, and solved only
where every region is exactly its size.

#### Scenario: A region past its size, and one shut in short

- **WHEN** the search is given one position to try on `3x1:222`, `3x1:121`
  and `4x1:13a1`
- **THEN** it reports no answer for each
- **AND** on an empty 3×1 it reports that it stopped

### Requirement: An Unreasonable Filling board has one answer that the solver does not reach

At Unreasonable the generator SHALL hide clues from a full board while the
search still proves one answer within a budget of its own, well under the
search's, and SHALL keep the board only when the solver stops short on it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 2×2 to 6×6
- **THEN** the solver leaves each unfinished
- **AND** exactly one filling fits each, by a count that has no search in it

#### Scenario: The smallest boards carry the tier

- **WHEN** an Unreasonable 1×2, 2×2, 1×5 or 2×3 board is dealt
- **THEN** it is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Filling refuses Unreasonable where no board of a size needs it

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

### Requirement: Filling rejects board sizes it cannot generate

`validateParams` SHALL refuse, when a board is to be dealt at either
difficulty, a board of more than 300 squares, with a reason naming that
maximum. A description that is supplied SHALL NOT be held to the bound.

#### Scenario: A board past the bound is refused with a reason

- **WHEN** an 18×17, a 20×20 and a 1×301 board are validated for generation
- **THEN** each is refused with a message naming 300
- **AND** a 17×17, a 15×20 and a 1×300 board are admitted at either difficulty

#### Scenario: An existing large description still loads

- **WHEN** a 25×25 board's params accompany a supplied description
- **THEN** validation succeeds

### Requirement: Filling's menu offers each size at both difficulties

Filling's presets SHALL offer each of 7×9, 9×13 and 13×17 as Easy and as
Unreasonable, and the default SHALL be an Easy 9×13.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Filling's preset menu is read
- **THEN** its 7×9, 9×13 and 13×17 boards each appear as Easy and as
  Unreasonable

### Requirement: A pasted Filling board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one answer that they
do not reach, whatever lower difficulty its ID states. A board with several
answers SHALL be refused as having more than one solution, and a board with
none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** an empty 3×1 board and `3x1:222`, whose three 2s are one region of
  three, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Filling's hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the steps its deductions force from the player's numbers and no others,
and where none forces anything it SHALL refuse with the collection's sentence
that deduction has run out. It SHALL go on from the numbers the player then
enters.

#### Scenario: The hint stops, and goes on from a number tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a number entered wrongly there is reported by the mistake check
- **AND** with a number entered as the solution has it wherever the hint
  stops, the hint finishes the board
