# pattern Specification

## Purpose
Pattern (Nonogram), the puzzle of shading a grid so that the runs of shaded
squares in each row and column match its clue list: what counts as solved, the
params and description encodings, what the generator promises, what a press, a
drag and the keyboard do, how the picture and its errors look, and what the
explained deductive hint says and marks.

## Requirements

### Requirement: Pattern is solved when every row and column matches its clues

Pattern is the nonogram (Picross, Paint-by-numbers) on a `w × h` grid in which
each cell is `Unknown`, `Full` or `Empty`. The board SHALL be solved when no
cell is `Unknown` and the runs of `Full` cells in every row and column equal
that line's sequence of run-length clues.

#### Scenario: Completing the picture solves the game

- **WHEN** the last move leaves every row and column with no `Unknown` cell and
  with runs equal to its clues
- **THEN** the game reports solved

### Requirement: Pattern's parameters are a size and a difficulty

Params SHALL be `w` and `h`, positive integers, and a difficulty, Easy or
Unreasonable. They SHALL encode as `{w}x{h}`, followed in the full encoding by
`de` for Easy or `du` for Unreasonable; the shared encoding SHALL leave the
difficulty out. A bare `{w}` SHALL decode to a square `w × w` grid, and a
string with no difficulty letter SHALL decode as Easy, so that an ID written
before the game had tiers reads as it did. `validateParams` SHALL refuse an
unreasonably large `w·h`.

#### Scenario: Params round-trip

- **WHEN** Easy params `{ w: 20, h: 15 }` are encoded in full
- **THEN** the result is `20x15de`, and the same params at Unreasonable give
  `20x15du`
- **AND** decoding each round-trips the params
- **AND** decoding a bare `10` yields an Easy `10 × 10` grid

#### Scenario: Invalid params are rejected

- **WHEN** params with a non-positive dimension, or with a grossly oversized
  `w·h`, are checked
- **THEN** they are refused with an error string

#### Scenario: An ID from before the tiers is Easy

- **WHEN** `20x15` is decoded
- **THEN** the params are an Easy `20 × 15` grid

### Requirement: Pattern descriptions are slash-separated clue lists

The desc SHALL encode the `w` column clues followed by the `h` row clues as a
`/`-separated list, each line a `.`-separated list of positive run lengths, an
empty line being an empty section. The board it opens SHALL be all `Unknown`,
apart from any square an immutable suffix names.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and its clues are re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: A Pattern description's suffix of immutable clue squares is read

A desc SHALL be read with or without a trailing `,` suffix that encodes
pre-filled immutable clue squares in the run-length alphabet (`a`/`A` onward,
with `z` advancing 25 cells). Only a desc from outside the generator carries
one, and `newState` SHALL still parse it so that such a desc round-trips.

#### Scenario: A suffix names an immutable square

- **WHEN** a desc carries a `,` suffix that names a square with an uppercase
  letter
- **THEN** `newState` returns that square `Full` and immutable
- **AND** every square the suffix does not name is `Unknown`

### Requirement: A malformed Pattern description is refused

The desc's parse SHALL refuse a clue that is non-positive or longer than its
line, a line whose clues cannot fit in its length, too few or too many line
specifications, and any unrecognized character in either section.

#### Scenario: A malformed description is rejected

- **WHEN** a desc with an over-long line, a wrong number of line
  specifications, or an invalid character is validated
- **THEN** a non-null error is returned

### Requirement: An Easy Pattern board is one the per-line solver solves

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

### Requirement: A Pattern press cycles the pressed cell and begins a drag

A press SHALL cycle the pressed cell as the cursor-select keys do, for a mouse
and a finger alike. A left press SHALL begin a drag whose target state is the
pressed cell's next state in the cycle `Unknown` → `Full` → `Empty` →
`Unknown`, and a right press the same cycle the other way. A single-cell action
SHALL overwrite the cell, so a deliberate click can change a mark.

#### Scenario: A single click still overwrites a mark

- **WHEN** the player clicks a single already-marked cell
- **THEN** the cell takes the next state in that button's cycle

### Requirement: Pattern accepts drag-fill rectangle and cursor input

A drag SHALL snap to a single row or column, except a drag whose target state
is `Unknown`, which erases a rectangle. Release SHALL emit a `fill` move
covering the dragged rectangle only when at least one non-immutable cell in it
would change, and a UI update otherwise. Immutable cells SHALL never be
overwritten.

#### Scenario: A drag that changes cells emits a move

- **WHEN** the player left-drags from an `Unknown` cell across cells not all
  already `Full`
- **THEN** release emits a `fill` move setting the blank cells of that line to
  `Full`

#### Scenario: A no-op drag produces no move

- **WHEN** the player drags over cells that already hold the target state (or are
  all immutable)
- **THEN** no history-affecting move is produced

### Requirement: A multi-cell paint drag leaves placed marks

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

### Requirement: Pattern's keyboard paints and cycles as the pointer does

A cursor move with Ctrl held SHALL set the square it leaves and the square it
reaches to `Full`, with Shift to `Empty` and with both to `Unknown`, through
the same rectangle `fill` move. A stroke that paints SHALL carry `onlyBlank`,
as the pointer's paint drag does and upstream's stroke does not; one that
clears SHALL NOT. A stroke that changes neither square SHALL make no move. The
cursor-select keys SHALL cycle the cursor's cell: Enter as a left press does,
Space as a right press does.

#### Scenario: A click and Enter agree

- **WHEN** the player clicks a cell, or presses Enter with the cursor on it
- **THEN** the cell moves to the same next state, and likewise a right-click and
  Space

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

### Requirement: A completed Pattern line that contradicts its clue shows the clue in the error color

When a line is fully determined (no `Unknown` cells) but its runs contradict
its clue, that line's clue numbers SHALL be drawn in the error color.

#### Scenario: A contradicting completed line shows red clues

- **WHEN** a row is fully filled in but its `Full` runs do not match its clue
- **THEN** that row's clue numbers are drawn in the error color

### Requirement: Pattern's findMistakes flags marks against the unique solution

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

### Requirement: Pattern provides an explained, deductive hint

Each hint SHALL teach why the move is forced by a recognizable line technique,
not merely state the move: run overlap, cells no run can reach, a line with no
clues, or the general single-line intersection, the cells forced in every
arrangement of one line's runs consistent with its marks.

#### Scenario: A hint explains a forced line deduction

- **WHEN** `hint` is called on an unsolved, mistake-free board with at least one
  deducible cell
- **THEN** it returns a step whose move fills every cell that one line technique
  forces, and whose explanation names the clue/pattern and concludes that those
  cells must be `Full` (or must be `Empty`)

### Requirement: A Pattern hint never reveals the solution or searches

The hint SHALL never reveal the stored solution or run a search. Every Easy
board is one the per-line solver solves with no guessing, so the plan for a
generated Easy board SHALL complete without any un-narrated step. On an
Unreasonable board the plan SHALL hold the steps the lines force and no
others, and where no line forces a cell the hint SHALL refuse with the
collection's sentence that deduction has run out. It SHALL go on from the
marks the player then makes, as it does from any position.

#### Scenario: The plan solves the board

- **WHEN** the full hint plan for any generated Easy board is applied step by
  step
- **THEN** the board reaches its unique solution

#### Scenario: The hint stops where the lines do

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** once the player has marked a cell the lines did not decide as the
  solution has it, the hint has a step again

### Requirement: One Pattern line deduction is one multi-cell step

A single line deduction that forces several cells SHALL be emitted as one
multi-cell `HintStep` whose move fills all of them: one firing is one step.
Each technique's forced set SHALL be a single color, so the step is
understandable at a glance.

#### Scenario: A run's overlap is one step

- **WHEN** a run's overlap forces three adjacent undecided cells of a row
- **THEN** the plan holds that deduction as one step whose move sets all three
  to `Full`

### Requirement: Pattern's narration leads with the indication and concludes by necessity

The narration SHALL lead with the indication, the clue and the spotted pattern
in board terms, and SHALL conclude in the necessity voice (`must be`, `must
stay` or `are always`), never with a bare state-of-being verb.

#### Scenario: An overlap is narrated

- **WHEN** a step fires on a run that can slide only one cell along its row
- **THEN** its sentence first names the row's run and how far it can slide
- **AND** it ends by saying the cells `must be` the engine's word for the
  shaded piece

### Requirement: The single-line intersection is Pattern's bottom rung

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

### Requirement: Pattern's hintKeepTrack follows partial progress

`hintKeepTrack` SHALL return `"completed"` when the player fills the last
forced cell of the displayed step with the correct value, `"onTrack"` on
partial progress, shrinking the step to the remaining cells, and `"off"`
otherwise.

#### Scenario: Part of a step is filled by hand

- **WHEN** a step forces three cells and the player sets one of them to the
  hinted value
- **THEN** the verdict is `"onTrack"` and the step's move and ring cover the
  other two cells

### Requirement: Pattern hint color legend

The displayed hint SHALL render forced cells in `COL_HINT` as a ring only,
never pre-drawing the piece or the cross the move would place: the cell's own
state stays visible and the narration says which it must be.

#### Scenario: Forced cells are highlighted, not pre-filled

- **WHEN** a hint step targeting cells the player must shade is displayed
- **THEN** those cells are ringed in `COL_HINT` and their prior (undecided)
  state is still visible: the piece is not pre-rendered

### Requirement: Pattern's hint premises follow the element-type legend

Premise elements SHALL follow the stable element-type color legend, each color
paired with a non-color cue and never named in the narration text. The
reasoned-about line's clue SHALL be drawn in `COL_HINT` and its line of sight
hatched in it. A cited already-placed `Full` cell SHALL be outlined
`COL_HINT_BLACKREF` and a cited `Empty` cell `COL_HINT_WHITEREF`, each outline
at the cell's edge, beside the piece or the cross, so it never hides what the
cell holds.

#### Scenario: Premise marks are ringed by their color

- **WHEN** a hint cites an already-placed full cell and an already-placed empty
  cell as evidence
- **THEN** the full cell is outlined in the black-reference color and the empty
  cell in the white-reference color, each leaving the cell's own content
  visible

### Requirement: Pattern draws its picture as shaded pieces and crosses on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface. A `Full` cell SHALL
hold the collection's shaded piece, in the shaded color and shape, inset on its
cell. A cell marked `Empty` SHALL be plain surface holding the ruled-out cross,
with no fill of its own, and an `Unknown` cell SHALL be plain surface holding
nothing. The three states SHALL NOT be told apart by a step of gray.

#### Scenario: The three states are a piece, a cross and nothing

- **WHEN** a board holding a `Full` cell, an `Empty` cell and an `Unknown` cell
  is drawn
- **THEN** all three cells are filled with the one surface color
- **AND** the `Full` cell holds the shaded piece, the `Empty` cell a cross, and
  the `Unknown` cell nothing

### Requirement: Pattern's grid lines are the surface's quiet grid color

The lines between cells and the frame round the grid SHALL be the surface's
quiet grid color, the frame no heavier than a line inside it, with a doubled
line every fifth cell. The clue numbers SHALL stay in the ink color.

#### Scenario: A fifth line is doubled and the frame is not

- **WHEN** a 10×10 board is drawn
- **THEN** the line between the fifth and sixth columns is doubled
- **AND** the frame at the grid's outer edge is one line thick

### Requirement: Pattern names no hue of its own

The game SHALL name no hue of its own: its hint sentences, its control words
and its hint-mark legend SHALL say the engine's word for the shaded piece and
its word for a cell known not to be shaded, and its help page SHALL name the
shaded color by placeholder.

#### Scenario: A hint names the shaded piece by the engine's word

- **WHEN** a hint step concludes that cells must be `Full`, or must be `Empty`
- **THEN** its sentence says the engine's word for the shaded piece, or its
  word for a cell known not to be shaded

### Requirement: Pattern counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
per-line solver: where no line forces a cell it assumes one each way and
deduces on, and a line that no placement of its runs fits ends that branch.
The search SHALL report one answer, several, none, or that it stopped at its
budget, which SHALL be counted in positions tried and never in time. Solve and
the mistake check SHALL take the board's answer from this search at either
tier.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the lines decide, on one with one answer
  that they do not reach, on a 2×2 board whose two diagonals both fit, and on
  a board whose clues contradict each other
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** every 3×4 picture's clues are searched, and its pictures are counted
  by laying whole rows and reading the columns
- **THEN** the search reports one answer exactly where one picture fits

### Requirement: An Unreasonable Pattern board has one answer that the lines do not reach

At Unreasonable the generator SHALL accept a grid only when the per-line
solver leaves some cell of it undecided and the search proves its clues have
exactly one answer. Its retry bound SHALL be counted in squares drawn, so that
a small size whose such boards are rare is given enough grids to find one.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 4×4 to 10×10
- **THEN** the per-line solver leaves each unfinished
- **AND** exactly one picture fits each board's clues, by a count that has no
  search in it

### Requirement: Pattern refuses Unreasonable at a size none of whose boards needs it

`validateParams` SHALL refuse Unreasonable, when a board is to be dealt, for a
grid one square wide or tall and for any grid up to 3×3, with the collection's
sentence that no puzzle of that size is Unreasonable. No picture of those
sizes has one answer that the lines do not reach. A board of such a size that
arrives with its description SHALL still load.

#### Scenario: A 3x3 Unreasonable board is not dealt

- **WHEN** the params of an Unreasonable 3×3, 2×3 or 1×5 board are checked for
  dealing
- **THEN** each is refused
- **AND** the same params are accepted for a board that arrives with its
  description

#### Scenario: No picture of a refused size needs search

- **WHEN** every picture of every size up to 3×3 is given to the per-line
  solver
- **THEN** wherever the solver leaves a cell undecided, a second picture fits
  the same clues

### Requirement: A pasted Pattern board opens at the tier it needs

A board that arrives as a game ID SHALL open as Easy where the per-line solver
and the hint finish it, and as Unreasonable where it has exactly one answer
that they do not reach, whatever tier its ID states below that. A board with
several answers SHALL be refused with the collection's sentence that it has
more than one solution, and a board with none with the sentence that its clues
contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the lines do not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 2×2 ID whose two diagonals both fit, and one whose clues
  contradict each other, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory
