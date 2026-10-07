## MODIFIED Requirements

### Requirement: Unruly game implements the Game interface

The engine SHALL provide a registered `unruly` game implementing
`Game<UnrulyParams, UnrulyState, UnrulyMove, UnrulyUi, UnrulyDrawState>`: the
binary puzzle (Binairo / Tohu-wa-Vohu) on a `w2 × h2` grid in which every cell
is filled with one of two values (`one` or `zero`, the two members of the
collection's two-state pair) so that no row or column contains a
run of three equal cells and each row and column holds equally many of each;
an optional `unique` variant additionally forbids two identical rows or
two identical columns. Params SHALL be `w2`, `h2` (both even and at least 6),
`unique` (boolean), and `diff` (Easy / Normal / Tricky), encoded `{w2}x{h2}`
with an optional `u` for the unique variant and, when `full`, `d{c}` for the
difficulty char. The presets SHALL be 6×6, 8×8, 10×10 and 14×14 boards across the offered difficulties, and one board in the unique variant. `validateParams` SHALL reject an odd or
below-6 dimension, an unreasonably large `w2·h2`, a `unique`-mode grid too tall
or too long for any valid set of distinct rows (the A177790 bound), and an
unknown difficulty. The game SHALL provide `solve` and `textFormat`, and SHALL NOT provide `statusbarText`.

#### Scenario: Params round-trip

- **WHEN** params `{ w2: 10, h2: 10, unique: false, diff: DIFF_NORMAL }` (the
  Tricky tier) are encoded with `full`
- **THEN** the result encodes the dimensions and difficulty char
- **AND** decoding it round-trips the params
- **AND** decoding a bare `8x8` yields a square grid with `unique` false

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with an odd dimension, a dimension below
  6, or a `unique`-mode grid exceeding the distinct-rows bound
- **THEN** it returns a non-null error string

### Requirement: Unruly renders the grid with live error highlighting and a completion flash

`redraw` SHALL draw the board as pieces on a quiet surface: every cell a
surface a small step off the board, a `one` as the first member of the
collection's two-state pair and a `zero` as the second, each in that member's
color and shape, inset on its cell. A cell the puzzle gave SHALL be told by a
lifted surface under its piece and by no mark on the piece. The game SHALL name
no hue of its own for either state.

Recomputed each frame, `redraw` SHALL draw the error overlays: a red bar
spanning any three-in-a-row run, a badge (a `!` on a disc of the error color)
on the pieces of a row or column whose count of that kind is exceeded, and (in
`unique` mode) a red bar across any pair of identical full rows or columns. A
keyboard cursor SHALL be drawn as an outline on the focused cell. On completion
a flash SHALL play, lifting every cell's surface on its first and last frames.

#### Scenario: A three-in-a-row reddens live

- **WHEN** three consecutive cells of one kind exist in a row or column
- **THEN** `redraw` draws an error-colored bar across them without any explicit
  check action

#### Scenario: The completion flash plays once

- **WHEN** a player move transitions the board from unsolved to solved (not the
  Solve command)
- **THEN** a flash of positive duration plays and `redraw` lifts every cell's
  surface during its lit frames

#### Scenario: A given is told from a placed piece by its cell

- **WHEN** a board holds a given and a piece of the same kind that the player
  placed
- **THEN** the two pieces are drawn alike
- **AND** only the given's cell is drawn in the lifted surface

### Requirement: Unruly provides an explained deduction hint and a placement animation

The `unruly` game SHALL implement `hint(state)` returning a plan-carrying,
narrated hint that explains *why* each move is forced (the fork's hint quality
bar), and `hintKeepTrack` so the plan auto-advances as the player follows it.
A hint SHALL be refused when the board is already solved or when
`findMistakes(state)` is non-empty, by the midend before it asks the game, since
a deduction seeded from contradictory marks would mislead. Otherwise `hint(state)`
SHALL deduce, from the player's
current marks, the ordered sequence of forced cells (run to fixpoint at the
solver's full strength) and return one narrated `HintStep` per forced cell. Each
step's narration SHALL state the deduction technique that forces the cell — two
of three consecutive cells already equal (a third would be three in a row), a
row or column whose count of one kind is already complete (so the rest are the
other), a unique-rows conflict (a cell that would duplicate a full
row/column), or a near-complete row whose single remaining odd cell is
pinned to one window (so every other empty cell is forced). A sentence SHALL
name a piece's color in the word the palette gives that member of the pair, so
the word is the color the piece is drawn in. Moves that a single
firing forces (a whole line completing to one kind, a near-complete row's
forced remainder) SHALL be emitted as one journey via `continuesPrevious`, so
they read and auto-play as a single coherent hint. `hintKeepTrack` SHALL report
`"completed"` when the player's move sets the hinted cell to the hinted value and
`"off"` otherwise.

`redraw` SHALL render the displayed step with the marks its sentence refers
to: a ring on the cell the step fills, an outline on each cell the step reasons
from, and stripes on the row or column the sentence names. Every step SHALL
carry visible evidence, never a bare conclusion.

Independently of hints, the game SHALL implement `animLength` so that a `place`
move which changes a cell animates: `redraw` SHALL grow a placed piece from the
middle of its cell to full size over the animation, and shrink a piece that is
taken away. The animation SHALL be geometric (no color tween), settle to the
plain piece, and coexist with the completion flash. Because the base
animation length is non-zero, a hint-executed move SHALL play stretched to the
uniform hint-step duration, so auto-hint reads as continuous placements.

#### Scenario: Hint explains the next forced move

- **WHEN** `hint` is called on an unsolved, mistake-free generated board
- **THEN** it returns `{ ok: true }` with a non-empty list of steps
- **AND** the first step's move is a legal `executeMove` whose narration names the
  technique (three-in-a-row / completed count / unique rows / near-complete) that
  forces its cell
- **AND** applying every step's move in order solves the board

#### Scenario: One firing reads as one journey

- **WHEN** a single completed-count or near-complete firing forces several cells
- **THEN** those cells are emitted as consecutive steps, the first beginning a
  journey and the rest flagged `continuesPrevious`
- **AND** the per-cell techniques (three-in-a-row, unique rows) emit independent
  steps

#### Scenario: Every hint step shows visible evidence

- **WHEN** `hint` returns a plan for a generated board
- **THEN** every step carries an outlined premise cell or a striped line — never
  a bare conclusion

#### Scenario: Hint refuses on a solved or mistaken board

- **WHEN** a hint is requested on a solved board, or on a board where the player
  has marked a cell contradicting the unique solution
- **THEN** the midend refuses it with an explanatory error before calling `hint`

#### Scenario: Following the hint advances the plan

- **WHEN** the player makes the move the current hint step describes
- **THEN** `hintKeepTrack` returns `"completed"`
- **AND** a move that sets a different cell, or the hinted cell to a different
  value, returns `"off"`

#### Scenario: A placement animates as a growing fill

- **WHEN** a `place` move fills a cell and `redraw` runs mid-animation
- **THEN** the cell draws its piece smaller than at rest, centered, and larger
  the further the animation has run
- **AND** at rest the cell shows the plain piece

## REMOVED Requirements

### Requirement: Unruly hint color legend

**Reason**: It described a filled forced cell, an inset preview of the forced
color and shaded journey cells (`COL_HINT_CELL`), none of which the game
draws; one of its scenarios cannot be kept by a modification.

**Migration**: "Unruly's hint marks are told apart by color and by place"
below states the marks the game draws.

## ADDED Requirements

### Requirement: Unruly's hint marks are told apart by color and by place

When an Unruly hint is displayed, `redraw` SHALL distinguish the element types
the deduction names using a stable color legend, each color paired with a
non-color cue:

- The **forced cell** (the move) SHALL be ringed `COL_HINT` and SHALL NOT be
  filled: a fill in a game whose move is to put one of two pieces in a cell
  reads as a third piece already placed.
- The **line** the sentence names SHALL be hatched `COL_HINT`, under the pieces
  it holds.
- The **cited premise / pivotal cells** the deduction reasons over (the
  like pair in `threes`, the completed quota in `complete`, the full
  reference line in `unique`, the reserved window in `nearcomplete`) SHALL be
  ringed `COL_HINT_REF`, not `COL_HINT` — so the cited premise is not drawn in
  the same color as the forced move. The cell keeps its own appearance (a
  piece stays visible; an empty reserved-window cell stays empty) inside the
  ring.

Every mark SHALL be drawn at the cell's edge, beside the piece and not on it.
Unruly uses a **single** premise ring color (not one per kind of piece): its
ringed cells are not uniformly one kind — `unique` rings a
balanced line holding both and `nearcomplete` rings empty cells — so a
state-derived ring color is ill-defined. The legend SHALL be consistent across
the four techniques.

#### Scenario: A cited premise rings distinct from the forced cell

- **WHEN** a `threes`, `complete`, or `unique` hint is displayed (filled premise
  cells force a move)
- **THEN** the cited premise cells are ringed `COL_HINT_REF` and the forced cell
  is ringed `COL_HINT`, in different colors
- **AND** no cell is filled in either
