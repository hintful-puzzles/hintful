# pattern Specification

## Purpose
Pattern (Nonogram), the puzzle of shading a grid so that the runs of black
squares in each row and column match its clue list. This capability specifies
its port to the TS engine, with drag-to-fill and cursor input, an error overlay,
and an explained deductive hint with its own color legend.

## Requirements

### Requirement: Pattern game implements the Game interface

The engine SHALL provide a registered `pattern` game implementing
`Game<PatternParams, PatternState, PatternMove, PatternUi, PatternDrawState>`:
the nonogram (Pattern / Picross / Paint-by-numbers) on a `w × h` grid in which
each cell is `Full` (black) or `Empty` (background) so that each row and column
matches its sequence of run-length clues. Params SHALL be `w` and `h` (positive
integers), encoded `{w}x{h}` with a bare `{w}` decoding to a square `w × w`
grid. The upstream presets (10×10, 15×15, 20×20, 25×25, 30×30) SHALL be offered.
`validateParams` SHALL reject a non-positive dimension and an unreasonably large
`w·h`. The game SHALL provide `solve` and `textFormat`, and SHALL drive a solve-completion flash.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 20, h: 15 }` are encoded
- **THEN** the result is `20x15`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `10` yields `{ w: 10, h: 10 }`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with a non-positive dimension or a grossly
  oversized `w·h`
- **THEN** it returns a non-null error string

### Requirement: Pattern descriptions are slash-separated clue lists

The desc SHALL encode the `w` column clues followed by the `h` row clues as a
`/`-separated list, each line a `.`-separated list of positive run lengths (an
empty line being an empty section). An OPTIONAL trailing `,`-suffix MAY encode
pre-filled immutable clue squares using the run-length alphabet (`a`/`A` … with
`z` advancing 25 cells), as produced by upstream's picture generator; the
fork's generator emits none, but `validateDesc` and `newState` SHALL still parse
it so such descs round-trip. `validateDesc` SHALL reject a clue that is
non-positive or grossly excessive, a line whose clues cannot fit in its length,
too few or too many line specifications, and any unrecognized character in
either section. `newState` SHALL parse the desc into the immutable clue arrays
and an all-`Unknown` grid (with any immutable suffix applied).

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and its clues are re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an over-long line, a wrong number
  of line specifications, or an invalid character
- **THEN** it returns a non-null error string

### Requirement: Pattern ports the per-line solver and gates generation on it

The port SHALL implement the per-line nonogram solver (the row/column fixpoint
that narrows each line against its run-length clue until no further cell is
forced) and a `generate_soluble` generator that produces a random grid and
accepts it only when it is **uniquely line-solvable** from its derived clues.
The solver SHALL be reused by `solve()` and `findMistakes`.

#### Scenario: Generated boards are uniquely line-solvable

- **WHEN** `newDesc` produces a board and the solver is run from its clues on an
  all-unknown grid
- **THEN** the solver completes to a single fully-determined grid (no remaining
  unknown cells, no contradiction)

#### Scenario: Solve recovers the unique grid

- **WHEN** `solve()` is invoked on a generated game
- **THEN** it returns the fully-solved `Full`/`Empty` grid

### Requirement: Pattern accepts drag-fill rectangle and cursor input

`interpretMove` SHALL reproduce upstream's input with two deliberate
divergences: drag-paint skips placed marks, and a press **cycles** the pressed
cell as the cursor-select keys do, for a mouse and a finger alike (upstream
filled on a mouse press and cycled only on a stylus). A left press SHALL begin a
drag whose target state is the pressed cell's next state in the cycle
`Unknown` → `Full` → `Empty` → `Unknown`, and a right press the same cycle the
other way. A drag snaps to a single row or column, except a drag whose target
state is `Unknown`, which erases a rectangle; release emits a `fill` move
covering the dragged rectangle **only when at least one non-immutable cell in it
would change** (otherwise a UI update).

A **multi-cell paint drag** (the value is `Full` or `Empty` and the rectangle
covers more than one cell) SHALL fill only cells currently `Unknown`, leaving
already-marked cells untouched, so dragging across the board never rewrites a
mark the player already placed. A **single-cell** action SHALL overwrite the
cell (so a deliberate click can change a mark), and a **clear** drag (value
`Unknown`) SHALL still reset marked cells. This is carried by an `onlyBlank`
flag on the `fill` move, honored by `executeMove` and previewed consistently by
`redraw`.

Keyboard cursor movement with the control/shift modifiers SHALL set cells to
`Empty` / `Full` / `Unknown` via the same rectangle move, and the cursor-select
keys SHALL cycle a cell's state: Enter as a left press does, Space as a right
press does. Immutable cells SHALL never be overwritten.

#### Scenario: A drag that changes cells emits a move

- **WHEN** the player left-drags from an `Unknown` cell across cells not all
  already `Full`
- **THEN** release emits a `fill` move setting the blank cells of that line to
  `Full`

#### Scenario: A multi-cell paint drag leaves placed marks

- **WHEN** the player drag-paints a line that crosses a cell they have already
  marked the opposite color
- **THEN** that already-marked cell keeps its color and only the blank cells of
  the line are painted

#### Scenario: A single click still overwrites a mark

- **WHEN** the player clicks a single already-marked cell
- **THEN** the cell takes the next state in that button's cycle

#### Scenario: A no-op drag produces no move

- **WHEN** the player drags over cells that already hold the target state (or are
  all immutable)
- **THEN** no history-affecting move is produced

#### Scenario: A click and Enter agree

- **WHEN** the player clicks a cell, or presses Enter with the cursor on it
- **THEN** the cell moves to the same next state, and likewise a right-click and
  Space

### Requirement: Pattern renders clues, the error overlay, and mistakes

`redraw` SHALL draw the grid, the row/column clue numbers, the cursor, and the
drag-rectangle preview, and SHALL drive the solve-completion flash. When a line
is fully determined (no `Unknown` cells) but its runs contradict its clue, that
line's clue numbers SHALL be drawn in the error color (upstream `check_errors`).
The game SHALL implement `findMistakes(state)`: every player-marked cell whose
`Full`/`Empty` value contradicts the unique solution is flagged (an `Unknown`
cell is never flagged), rendered with the `COL_MISTAKE` overlay. Every overlay
that is not part of the packed cell value (mistake highlight, per-line error
flag) SHALL be included in the render cache diff key so it repaints on the frame
it is computed.

#### Scenario: A contradicting completed line shows red clues

- **WHEN** a row is fully filled in but its black runs do not match its clue
- **THEN** that row's clue numbers are drawn in the error color

#### Scenario: Check & Save flags a wrong cell

- **WHEN** `findMistakes` runs on a board with a cell marked `Full` where the
  unique solution is `Empty`
- **THEN** that cell is returned as a mistake and rendered with the mistake
  overlay on the next redraw

### Requirement: Pattern provides an explained, deductive hint

Pattern SHALL implement the Hint System hooks (`hint`, `hintKeepTrack`, and
rendering of the displayed step) to the explained-hint quality bar: each hint
SHALL teach *why* the move is forced by a recognizable nonogram line technique
(run overlap, line completion, unreachable gap, edge/anchor extension, or the
general single-line **intersection** — the cells forced in *every* arrangement of
one line's runs consistent with its marks), not merely state the move. Because the
generator accepts only boards uniquely solvable by the per-line solver with no
guessing, every shipped board is pure-deduction solvable and the hint SHALL never
reveal the stored solution or run a search.

A single line deduction that forces several cells SHALL be emitted as **one**
multi-cell `HintStep` whose move fills all of them (one firing = one step), with
each technique's forced set a single color so the step is understandable at a
glance. The narration SHALL lead with the indication (the clue and the spotted
pattern, in board terms) and conclude in the necessity voice (`must be` /
`must stay` / `are always`), never a bare state-of-being verb.

Every displayed step SHALL name a technique — the hint SHALL NOT emit a generic,
unexplained step (e.g. *"only one arrangement fits"*) for a deduction its named
techniques do not group. Where the elegant techniques do not cover a forced cell,
the plan SHALL narrate the general single-line **intersection** as an honest
deductive bottom rung (*"whichever way this line's runs fit, these cells must be
black / must stay white"* — the necessity voice of the explained-hint bar, never
the retired *"only one arrangement fits"* wording); being the per-line solver's
own fixpoint restricted to one line, that rung always exists for a generated
board, so the plan completes without any un-narrated step.

A hint SHALL be refused with an error string when the board is already solved or
when `findMistakes` reports mistakes, by the midend before it asks the game (the
refusal lighting the mistake overlay and the banner). `hintKeepTrack` SHALL
return `"completed"` when the player fills the
last forced cell of the displayed step with the correct value, `"onTrack"`
(shrinking the step to the remaining cells) on partial progress, and `"off"`
otherwise.

#### Scenario: A hint explains a forced line deduction

- **WHEN** `hint` is called on an unsolved, mistake-free board with at least one
  deducible cell
- **THEN** it returns a step whose move fills every cell that one line technique
  forces, and whose explanation names the clue/pattern and concludes that those
  cells must be black (or must be white)

#### Scenario: No hint step is a generic un-narrated fallback

- **WHEN** the full hint plan is computed for any generated board
- **THEN** every step carries a named line technique (overlap, completion,
  unreachable, edge/anchor, or the single-line intersection bottom rung)
- **AND** no step carries a generic "only one arrangement fits" explanation

#### Scenario: The plan solves the board

- **WHEN** the full hint plan for any generated board is applied step by step
- **THEN** the board reaches its unique solution

#### Scenario: A hint refuses on a wrong board

- **WHEN** a hint is requested while `findMistakes` reports at least one mistake
- **THEN** the midend refuses it with a message before calling `hint`, and the
  mistaken cells are highlighted

### Requirement: Pattern hint color legend

The displayed hint SHALL render forced cells in `COL_HINT` as a ring only,
never pre-drawing the piece or the cross the move would place (the cell's own
state stays visible and the narration says which it must be). Premise elements
SHALL follow the stable element-type color legend, each color paired with a
non-color cue and never named in the narration text: the reasoned-about line's
clue drawn in `COL_HINT` and its line of sight hatched in it; a cited
already-placed **full** cell outlined `COL_HINT_BLACKREF` and a cited **empty**
cell outlined `COL_HINT_WHITEREF`, each outline at the cell's edge, beside the
piece or the cross, so it never hides what the cell holds. Hint overlay bits
SHALL be folded into the per-cell render cache key so they repaint on the
frame they are shown.

#### Scenario: Forced cells are highlighted, not pre-filled

- **WHEN** a hint step targeting cells the player must shade is displayed
- **THEN** those cells are ringed in `COL_HINT` and their prior (undecided)
  state is still visible — the piece is not pre-rendered

#### Scenario: Premise marks are ringed by their color

- **WHEN** a hint cites an already-placed full cell and an already-placed empty
  cell as evidence
- **THEN** the full cell is outlined in the black-reference color and the empty
  cell in the white-reference color, each leaving the cell's own content
  visible

### Requirement: Pattern draws its picture as shaded pieces and crosses on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface. A `Full` cell (the
one the other requirements call black, after upstream) SHALL hold the
collection's shaded piece, in the shaded color and shape, inset on its cell. A
cell marked `Empty` SHALL be plain surface holding the ruled-out cross, with no
fill of its own, and an `Unknown` cell SHALL be plain surface holding nothing:
the three states SHALL NOT be told apart by a step of gray. The lines between
cells and the frame round the grid SHALL be the surface's quiet grid color,
the frame no heavier than a line inside it, with a doubled line every fifth
cell. The clue numbers SHALL stay in the ink color.

The game SHALL name no hue of its own: its hint sentences, its control words
and its hint-mark legend SHALL say the engine's word for the shaded piece and
its word for a cell known not to be shaded, and its help page SHALL name the
shaded color by placeholder.

The Check & Save mistake outline SHALL sit at the cell's edge, beside the
piece.

#### Scenario: The three states are a piece, a cross and nothing

- **WHEN** a board holding a `Full` cell, an `Empty` cell and an `Unknown` cell
  is drawn
- **THEN** all three cells are filled with the one surface color
- **AND** the `Full` cell holds the shaded piece, the `Empty` cell a cross, and
  the `Unknown` cell nothing

#### Scenario: A hint names the shaded piece by the engine's word

- **WHEN** a hint step concludes that cells must be `Full`, or must be `Empty`
- **THEN** its sentence says the engine's word for the shaded piece, or its
  word for a cell known not to be shaded
