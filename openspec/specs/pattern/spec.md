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

### Requirement: Pattern's parameters are a width and a height

Params SHALL be `w` and `h`, positive integers, encoded `{w}x{h}`, with a bare
`{w}` decoding to a square `w × w` grid. `validateParams` SHALL refuse an
unreasonably large `w·h`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 20, h: 15 }` are encoded
- **THEN** the result is `20x15`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `10` yields `{ w: 10, h: 10 }`

#### Scenario: Invalid params are rejected

- **WHEN** params with a non-positive dimension, or with a grossly oversized
  `w·h`, are checked
- **THEN** they are refused with an error string

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

### Requirement: Pattern generates only boards the per-line solver solves uniquely

The per-line solver is the row and column fixpoint that narrows each line
against its run-length clue until no further cell is forced. The generator
SHALL produce a random grid and accept it only when that solver, from the
grid's derived clues alone, completes it to one fully determined grid.

#### Scenario: Generated boards are uniquely line-solvable

- **WHEN** `newDesc` produces a board and the solver is run from its clues on an
  all-unknown grid
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

Keyboard cursor movement with the control and shift modifiers SHALL set cells
to `Empty`, `Full` or `Unknown` through the same rectangle `fill` move. The
cursor-select keys SHALL cycle the cursor's cell: Enter as a left press does,
Space as a right press does.

#### Scenario: A click and Enter agree

- **WHEN** the player clicks a cell, or presses Enter with the cursor on it
- **THEN** the cell moves to the same next state, and likewise a right-click and
  Space

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

The hint SHALL never reveal the stored solution or run a search: the generator
accepts only boards the per-line solver solves uniquely with no guessing, so
every
generated board is solvable by pure deduction. The plan for a generated board
SHALL complete without any un-narrated step.

#### Scenario: The plan solves the board

- **WHEN** the full hint plan for any generated board is applied step by step
- **THEN** the board reaches its unique solution

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
