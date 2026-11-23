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

The per-line solver SHALL be the ladder `pattern.description.yaml` states: its
one technique, `line`, settles each stretch of a row's or column's undecided
cells that every way the line's runs can fit around its marks agrees on, and
it runs to a fixpoint. At Easy the generator SHALL produce a random grid and
accept it only when that solver, from the grid's derived clues alone,
completes it to one fully determined grid.

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

### Requirement: Controls: A Pattern drag sweeps

A drag SHALL give every square it passes that held what the pressed square
held what the pressed square became, so a drag never rewrites a square the
player marked otherwise, and an undecided square's drag never erases.

#### Scenario: A drag over a marked square

- **WHEN** the player drags from an undecided square, which a press shades,
  across a square they marked clear onto an undecided one
- **THEN** both undecided squares are shaded and the clear one stays clear

### Requirement: Controls: Shift or Ctrl with a Pattern move marks clear the squares the cursor leaves and enters

A cursor move with Shift held SHALL mark clear each undecided square it
leaves and enters, and with Ctrl each of those squares that is not already
clear, shaded ones included, as the fill engine's other games do.

#### Scenario: A Shift stroke crosses a shaded square

- **WHEN** the cursor moves with Shift held from a shaded square onto an
  undecided one
- **THEN** the undecided square is marked clear and the shaded one stays
  shaded

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

### Requirement: Hint: Pattern's hint continues from its last step

`hint` SHALL take, of every stretch the ladder could settle, the one that
continues from the cells the latest steps decided, and otherwise the first in
the ladder's order: the rows from the top, then the columns from the left.

#### Scenario: The plan follows the cells it decides

- **WHEN** the hint's plan is read on the 10×10 board
  `8/6.1/4.1.1.1/4.1/4.3/2/2/2.2/2.1.2/1.2/3.2/3.2/5/5/2.2/5/1.2/3.1/6/8`
- **THEN** its first step is the ninth row's, "This row's run of 6 can slide
  only 4 squares, so these squares must be shaded.", the first row any run's
  overlap reaches
- **AND** its second is the fifth column's, which holds one of the squares
  the first step shaded

### Requirement: Hint: A Pattern run's overlap is shaded, and a square no run reaches is clear

A step SHALL take one unbroken stretch of undecided squares of one line that
every fit of the line's runs around its marks agrees on. A stretch one run
covers packed either way SHALL be told as that run's slack, with the marked
squares that hold it outlined, a stretch no run reaches as out of reach, and
a line with no clues as all clear.

#### Scenario: A run with no room to slide

- **WHEN** the hint's plan on the 10×10 board
  `8/6.1/4.1.1.1/4.1/4.3/2/2/2.2/2.1.2/1.2/3.2/3.2/5/5/2.2/5/1.2/3.1/6/8`
  is read
- **THEN** its seventh step shades the top four squares of the third column,
  saying "This column's run of 4 has nowhere to slide, so these squares must
  be shaded."
- **AND** its nineteenth clears the top three squares of the sixth column,
  saying "No run of this column can reach the ringed squares, so those
  squares must be clear."

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

### Requirement: Look: Pattern's step stripes its line through the line's numbers

A hint step SHALL stripe the row or column it reasons on, running on through
that line's numbers in the margin, and the numbers SHALL stay in the ink's
color, the error color, or the cursor's where the cursor is on the line.

#### Scenario: A row's overlap

- **WHEN** a step on a row's overlap is shown
- **THEN** the row and its numbers are striped, and the squares it shades
  are ringed
