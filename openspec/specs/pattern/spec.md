# pattern Specification

## Purpose
Pattern (Nonogram), the puzzle of shading a grid so that the runs of shaded
squares in each row and column match its clue list: what counts as solved,
what its params refuse and what a short params string means, the description
encoding, what the generator promises, what the search assumes, what a press, a
drag and the keyboard do, how the picture and its errors look, and what the
explained deductive hint says and in what order.

## Requirements

### Requirement: Rules: Pattern is solved when every row and column matches its clues

Pattern is the nonogram (Picross, Paint-by-numbers) on a `w × h` grid in which
each cell is `Unknown`, `Full` or `Empty`. The board SHALL be solved when no
cell is `Unknown` and the runs of `Full` cells in every row and column equal
that line's sequence of run-length clues.

#### Scenario: Completing the picture solves the game

- **WHEN** the last move leaves every row and column with no `Unknown` cell and
  with runs equal to its clues
- **THEN** the game reports solved

### Requirement: Rules: A completed Pattern line that contradicts its clue shows the clue in the error color

When a line is fully determined (no `Unknown` cells) but its runs contradict
its clue, that line's clue numbers SHALL be drawn in the error color.

#### Scenario: A contradicting completed line shows red clues

- **WHEN** a row is fully filled in but its `Full` runs do not match its clue
- **THEN** that row's clue numbers are drawn in the error color

### Requirement: Rules: Pattern's findMistakes flags marks against the unique solution

The game SHALL implement `findMistakes(state)`: every player-marked cell whose
`Full` or `Empty` value contradicts the unique solution SHALL be flagged, and
an `Unknown` cell SHALL never be flagged. A flagged cell's outline SHALL be
drawn in the error color at the cell's edge, beside the piece.

#### Scenario: A wrong shaded cell is outlined

- **WHEN** `findMistakes` runs on a board with a cell marked `Full` where the
  unique solution is `Empty`
- **THEN** that cell is returned as a mistake
- **AND** its outline is drawn at the cell's edge and the shaded piece stays
  visible inside it

### Requirement: Params: A Pattern params string may leave out its height and its difficulty

Pattern's params, a size and a difficulty, SHALL be bounded and encoded as its
`paramConfig` and its declared codec give (`engine-params`, "A game declares
its params encoding once, and both codec halves are derived"), and its menu
SHALL be what `presets` builds. A bare `{w}` SHALL decode to a square `w × w`
grid, and a string with no difficulty letter SHALL decode as Easy, so that an
ID written before the game had tiers reads as it did.

#### Scenario: An ID from before the tiers is Easy

- **WHEN** `20x15` is decoded
- **THEN** the params are an Easy `20 × 15` grid
- **AND** decoding a bare `10` yields an Easy `10 × 10` grid

### Requirement: Params: Pattern refuses a grid unreasonably large

`validateParams` SHALL refuse an unreasonably large `w·h`.

#### Scenario: A grossly oversized grid

- **WHEN** params with a grossly oversized `w·h` are checked
- **THEN** they are refused with an error string

### Requirement: Params: Pattern refuses Unreasonable at a size none of whose boards needs it

`validateParams` SHALL refuse Unreasonable, when a board is to be dealt, for a
grid one square wide or tall and for any grid up to 3×3, with the collection's
sentence that no puzzle of that size is Unreasonable. No picture of those
sizes has one answer that the lines do not reach.

#### Scenario: A 3x3 Unreasonable board is not dealt

- **WHEN** the params of an Unreasonable 3×3, 2×3 or 1×5 board are checked for
  dealing
- **THEN** each is refused

#### Scenario: No picture of a refused size needs search

- **WHEN** every picture of every size up to 3×3 is given to the per-line
  solver
- **THEN** wherever the solver leaves a cell undecided, a second picture fits
  the same clues

### Requirement: Description: Pattern descriptions are slash-separated clue lists

The desc SHALL encode the `w` column clues followed by the `h` row clues as a
`/`-separated list, each line a `.`-separated list of positive run lengths, an
empty line being an empty section. The board it opens SHALL be all `Unknown`,
apart from any square an immutable suffix names.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and its clues are re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: Description: A Pattern description's suffix of immutable clue squares is read

A desc SHALL be read with or without a trailing `,` suffix that encodes
pre-filled immutable clue squares in the run-length alphabet (`a`/`A` onward,
with `z` advancing 25 cells). Only a desc from outside the generator carries
one, and `newState` SHALL still parse it so that such a desc round-trips.

#### Scenario: A suffix names an immutable square

- **WHEN** a desc carries a `,` suffix that names a square with an uppercase
  letter
- **THEN** `newState` returns that square `Full` and immutable
- **AND** every square the suffix does not name is `Unknown`

### Requirement: Description: A malformed Pattern description is refused

The desc's parse SHALL refuse a clue that is non-positive or longer than its
line, a line whose clues cannot fit in its length, too few or too many line
specifications, and any unrecognized character in either section.

#### Scenario: A malformed description is rejected

- **WHEN** a desc with an over-long line, a wrong number of line
  specifications, or an invalid character is validated
- **THEN** a non-null error is returned

### Requirement: Generation: An Easy Pattern board is one the per-line solver solves

The per-line solver is the row and column fixpoint that narrows each line
against its run-length clue until no further cell is forced. At Easy the
generator SHALL produce a random grid and accept it only when that solver,
from the grid's derived clues alone, completes it to one fully determined
grid.

#### Scenario: Generated boards are uniquely line-solvable

- **WHEN** `newDesc` produces an Easy board and the solver is run from its
  clues on an all-unknown grid
- **THEN** the solver completes to a single fully-determined grid (no remaining
  unknown cells, no contradiction)

### Requirement: Generation: A Pattern board is Easy where the per-line solver and the hint both finish it

A board SHALL count as Easy where the per-line solver and the hint finish it,
and as Unreasonable where it has exactly one answer that they do not reach.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the lines do not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

### Requirement: Solver: Pattern's search assumes an undecided cell each way

Pattern's search SHALL run over the per-line solver: where no line forces a
cell it SHALL assume one each way and deduce on, and a line that no placement
of its runs fits SHALL end that branch.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the lines decide, on one with one answer
  that they do not reach, on a 2×2 board whose two diagonals both fit, and on
  a board whose clues contradict each other
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** every 3×4 picture's clues are searched, and its pictures are counted
  by laying whole rows and reading the columns
- **THEN** the search reports one answer exactly where one picture fits

### Requirement: Controls: A Pattern press cycles the pressed cell and begins a drag

A press SHALL cycle the pressed cell as the cursor-select keys do, for a mouse
and a finger alike. A left press SHALL begin a drag whose target state is the
pressed cell's next state in the cycle `Unknown` → `Full` → `Empty` →
`Unknown`, and a right press the same cycle the other way. A single-cell action
SHALL overwrite the cell, so a deliberate click can change a mark.

#### Scenario: A single click still overwrites a mark

- **WHEN** the player clicks a single already-marked cell
- **THEN** the cell takes the next state in that button's cycle

#### Scenario: A click and Enter agree

- **WHEN** the player clicks a cell, or presses Enter with the cursor on it
- **THEN** the cell moves to the same next state, and likewise a right-click and
  Space

### Requirement: Controls: Pattern accepts drag-fill rectangle and cursor input

A drag SHALL snap to a single row or column, except a drag whose target state
is `Unknown`, which erases a rectangle. A release SHALL change the squares of
the dragged rectangle through one `fill` move. Immutable cells SHALL never be
overwritten.

#### Scenario: A drag that changes cells emits a move

- **WHEN** the player left-drags from an `Unknown` cell across cells not all
  already `Full`
- **THEN** release emits a `fill` move setting the blank cells of that line to
  `Full`

#### Scenario: A no-op drag produces no move

- **WHEN** the player drags over cells that are all immutable
- **THEN** no history-affecting move is produced

### Requirement: Controls: A multi-cell paint drag leaves placed marks

A multi-cell paint drag, one whose value is `Full` or `Empty` and whose
rectangle covers more than one cell, SHALL fill only cells currently `Unknown`,
so dragging across the board never rewrites a mark the player already placed. A
clear drag, whose value is `Unknown`, SHALL still reset marked cells. This
SHALL be carried by an `onlyBlank` flag on the `fill` move, honored by
`executeMove` and previewed consistently by `redraw`.

#### Scenario: A multi-cell paint drag leaves placed marks

- **WHEN** the player drag-paints a line that crosses a cell they have already
  marked the opposite color
- **THEN** that already-marked cell keeps its color and only the blank cells of
  the line are painted

### Requirement: Controls: Pattern's keyboard stroke paints as the pointer's drag does

A cursor move with Ctrl held SHALL set the square it leaves and the square it
reaches to `Full`, with Shift to `Empty` and with both to `Unknown`, through
the same rectangle `fill` move. A stroke that paints SHALL carry `onlyBlank`,
as the pointer's paint drag does and upstream's stroke does not; one that
clears SHALL NOT.

#### Scenario: A keyboard stroke crosses a marked square

- **WHEN** the cursor is on a square the player has marked `Empty` and moves
  with Ctrl held onto an `Unknown` square
- **THEN** the `Unknown` square becomes `Full` and the marked square stays
  `Empty`, as a pointer paint drag over the same two squares would leave them

#### Scenario: A keyboard stroke over two marked squares makes no move

- **WHEN** the cursor moves with Ctrl or Shift held, alone, between two squares
  that are both already `Full` or `Empty`
- **THEN** the cursor moves and no history-affecting move is produced

#### Scenario: A clearing stroke resets marked squares

- **WHEN** the cursor moves with Ctrl and Shift both held between two marked
  squares
- **THEN** both become `Unknown`

### Requirement: Hint: Pattern's hint stops where the lines do

On an Unreasonable board as on any other, the steps of Pattern's hint SHALL be
those a line forces from its own clue and marks.

#### Scenario: The hint stops where the lines do

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** once the player has marked a cell the lines did not decide as the
  solution has it, the hint has a step again

### Requirement: Hint: One Pattern line deduction is one multi-cell step

A single line deduction that forces several cells SHALL be emitted as one
multi-cell `HintStep` whose move fills all of them: one firing is one step.
Each technique's forced set SHALL be a single color, so the step is
understandable at a glance.

#### Scenario: A run's overlap is one step

- **WHEN** a run's overlap forces three adjacent undecided cells of a row
- **THEN** the plan holds that deduction as one step whose move sets all three
  to `Full`

### Requirement: Hint: Pattern's narration names the clue and what was spotted, and concludes by necessity

A step's indication SHALL be the clue and the spotted pattern in board terms,
and the narration SHALL conclude in the necessity voice (`must be`, `must
stay` or `are always`), never with a bare state-of-being verb.

#### Scenario: An overlap is narrated

- **WHEN** a step fires on a run that can slide only one cell along its row
- **THEN** its sentence first names the row's run and how far it can slide
- **AND** it ends by saying the cells `must be` the engine's word for the
  shaded piece

### Requirement: Hint: The single-line intersection is Pattern's bottom rung

Where the other techniques do not cover a forced cell, the plan SHALL narrate
the single-line intersection as the deductive bottom rung, in the necessity
voice: every way the line's runs can fit covers the cells, or leaves them out,
so they must be `Full`, or `Empty`. The hint SHALL NOT use the wording "only
one arrangement fits".

#### Scenario: No hint step is a generic un-narrated fallback

- **WHEN** the full hint plan is computed for any generated board
- **THEN** every step carries a named line technique (overlap, unreachable, a
  line with no clues, or the single-line intersection bottom rung)
- **AND** no step carries a generic "only one arrangement fits" explanation

### Requirement: Hint: A Pattern run's overlap is shaded, and a cell no run reaches is clear

With each run packed as far to one end of its line as the line's marks
allow, and then to the other, the cells a run covers both ways SHALL be
shaded, and a cell no run covers anywhere between its two placings SHALL be
clear. Every cell of a line with no clues SHALL be clear. A step SHALL take
one unbroken stretch of undecided cells: of one run's overlap, or of the
cells out of reach.

#### Scenario: A run with no room to slide

- **WHEN** the hint's plan on the 10×10 board
  `8/6.1/4.1.1.1/4.1/4.3/2/2/2.2/2.1.2/1.2/3.2/3.2/5/5/2.2/5/1.2/3.1/6/8`
  reaches its third column, whose runs 4, 1, 1 and 1 fill the column with
  one gap between each
- **THEN** four steps shade the runs, each saying its run "has nowhere to
  slide", and three more clear the gaps, each saying "No run of this column's
  outlined clue can reach the ringed cell, so that cell must be clear."

### Requirement: Hint: Pattern's hint takes the first line a named technique decides

Each step SHALL come from the first line, the columns from the left and then
the rows from the top, on which a named technique decides a cell: on a line
with no clues, its cells; otherwise the first run whose overlap has an
undecided cell; otherwise the first cells out of reach. Only where no line
has one SHALL the step be the first cells every fit agrees on, of the first
line that has any. The plan SHALL look again from the first column after
every step.

#### Scenario: The columns come before the rows

- **WHEN** the hint's plan is read on the 10×10 board
  `8/6.1/4.1.1.1/4.1/4.3/2/2/2.2/2.1.2/1.2/3.2/3.2/5/5/2.2/5/1.2/3.1/6/8`
- **THEN** its first step is the first column's, "This column's run of 8 can
  slide only 2 cells, so these cells must be purple.", its second the second
  column's run of 6, and its next seven the third column's

### Requirement: Look: Pattern doubles every fifth grid line, and its frame is one line thick

The frame round the grid SHALL be no heavier than a line inside it, and the
line between cells SHALL be doubled every fifth cell.

#### Scenario: A fifth line is doubled and the frame is not

- **WHEN** a 10×10 board is drawn
- **THEN** the line between the fifth and sixth columns is doubled
- **AND** the frame at the grid's outer edge is one line thick

### Requirement: Look: Pattern draws a full cell as a piece and an empty one as the clear square

`redraw` SHALL draw a `Full` cell as the collection's shaded piece, inset on
the plain cell surface, a cell marked `Empty` as the collection's clear
square with its faint cross, and an `Unknown` cell as plain surface holding
nothing.

#### Scenario: The three states are a piece, a clear square and nothing

- **WHEN** a board holding a `Full` cell, an `Empty` cell and an `Unknown` cell
  is drawn
- **THEN** the `Full` cell holds the shaded piece on the plain surface, the
  `Empty` cell is filled with the clear square's color and holds a cross in
  the square's faint color about its middle, and the `Unknown` cell is plain
  surface and holds nothing
