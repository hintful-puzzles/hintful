# unruly Specification

## Purpose
Unruly (Binairo), the puzzle of filling every square with one of two pieces so that no
three consecutive squares in a line match and each row and column is half of
each, optionally with no two rows or columns alike. This holds the game's own
rules: its params and description formats, what each difficulty's techniques
are and what a dealt board promises, its controls, its look and live errors,
its mistake check, and its hint's techniques, journeys and marks. What every
game shares is in the engine capabilities.

## Requirements

### Requirement: The board is solved while its counts and runs are valid

Unruly (Binairo, Tohu-wa-Vohu) SHALL be played on a `w2 × h2` grid in which
every cell is filled with one of two values, `one` or `zero`, the two members
of the collection's two-state pair. The board SHALL be reported solved exactly
while no row or column holds a run of three equal cells and each row and
column holds equally many of each.

#### Scenario: Completing the board is detected

- **WHEN** a move fills the final cell of a valid solution
- **THEN** `status` returns `"solved"`, and a flash plays

### Requirement: The unique variant forbids identical rows and columns

An optional `unique` variant SHALL additionally forbid two identical rows and
two identical columns.

#### Scenario: Two identical full rows do not solve a unique board

- **WHEN** a `unique` board is filled so that every count is balanced and no
  run of three exists, and two of its rows are identical
- **THEN** `status` does not return `"solved"`
- **AND** the same grid on a board without `unique` is solved

### Requirement: Unruly's params are a size, the unique variant and a difficulty

Params SHALL be `w2`, `h2` (both even and at least 6), `unique` (boolean), and
`diff` (Easy / Normal / Tricky), encoded `{w2}x{h2}` with an optional `u` for
the unique variant and, when `full`, `d{c}` for the difficulty char.

#### Scenario: Params round-trip

- **WHEN** params `{ w2: 10, h2: 10, unique: false }` at the Tricky tier are
  encoded with `full`
- **THEN** the result encodes the dimensions and difficulty char
- **AND** decoding it round-trips the params
- **AND** decoding a bare `8x8` yields a square grid with `unique` false

### Requirement: Unruly refuses params no board can be dealt for

`validateParams` SHALL reject an odd dimension, an unreasonably large `w2·h2`,
and a `unique`-mode grid too tall or too long for any valid set of distinct
rows (the A177790 bound).

#### Scenario: Invalid params are rejected

- **WHEN** the engine's params check is given an odd dimension, a dimension
  below 6, or a `unique`-mode grid exceeding the distinct-rows bound
- **THEN** it returns a non-null error string

### Requirement: Unruly descriptions are run-length color grids

The desc SHALL encode the immutable clue cells in scan order using upstream's
run-length alphabet: a lowercase letter advances past a run of empty cells and
places a `zero` clue, an uppercase letter does the same placing a `one` clue,
and `z`/`Z` advance 25 cells without placing a clue; the encoded positions SHALL
sum to exactly `w2·h2 + 1`.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and the clue grid is
  re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: A malformed Unruly description is refused

`validateDesc` SHALL reject a desc holding any character outside the
run-length alphabet and any desc whose decoded length differs from
`w2·h2 + 1`.

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an invalid character or a decoded
  length mismatching the params
- **THEN** it returns a non-null error string

### Requirement: Unruly generates uniquely solvable boards at the target difficulty

Every board `newDesc` generates SHALL pass `validateDesc` and be solvable by
the deductive solver at its target difficulty, from its clues alone. `newDesc`
SHALL winnow the clues of a full valid grid, keeping a clue only where the
solver at the target difficulty could not finish without it.

#### Scenario: Generated boards are valid and solvable

- **WHEN** `newDesc` runs for a seeded RNG across the presets
- **THEN** every desc passes `validateDesc`
- **AND** the deductive solver at the board's difficulty solves it from its
  clues alone to a counts-valid, run-valid state

### Requirement: A board above Easy needs its own tier

For any difficulty above Easy, `newDesc` SHALL reject a board the solver one
level easier can already finish (the too-easy gate), and SHALL regenerate.

#### Scenario: A Tricky board is not a Normal one

- **WHEN** `newDesc` deals a board at Tricky
- **THEN** the deductive solver capped at Normal does not finish it from its
  clues

### Requirement: The Easy techniques are the impending three and the single gap

At Easy the solver SHALL apply two techniques: the two cells of an
almost-three filled the same color force the third cell to the opposite color,
and a row or column with one empty cell left for a color fills it.

#### Scenario: The impending-three rule forces the third cell

- **WHEN** the solver runs on a row with two adjacent same-color cells and an
  adjacent empty cell that would complete a forbidden run
- **THEN** that empty cell is set to the opposite color

### Requirement: The Normal techniques are the completed count and the unique-rows conflict

At Normal the solver SHALL additionally apply two techniques: a row or column
already holding its full count of one color fills the rest with the other, and,
in `unique` mode only, a full row or column matched in all but one place by a
one-short row or column forces that place to differ.

#### Scenario: A completed count fills the rest of its line

- **WHEN** the solver runs at Normal on a row that holds its full count of one
  color and several empty cells
- **THEN** every empty cell of the row is set to the other color

### Requirement: The Tricky technique is the near-complete line

At Tricky the solver SHALL additionally apply one technique: in a near-complete
row or column whose last cell of a color, if placed in certain cells, would
create three-in-a-row, that color is forced elsewhere.

#### Scenario: The last piece is pinned beside a pair of empties

- **WHEN** a row has one cell of a color left to place and holds two adjacent
  empty cells beside a cell of the other color
- **THEN** the solver at Tricky sets every other empty cell of the row to the
  other color

### Requirement: A placement on a clue or off the board is rejected

`executeMove` SHALL reject a placement whose target is out
of bounds or an immutable clue cell.

#### Scenario: A placement on a clue is rejected

- **WHEN** `executeMove` is given a placement on an immutable clue cell
- **THEN** it throws, and the state it was given is unchanged

### Requirement: Unruly marks cells via three-state cycling moves

Left-button / select on a non-immutable cell SHALL cycle
empty → one → zero → empty; right-button / select2 SHALL cycle
empty → zero → one → empty. An immutable cell SHALL be inert. A click or key
that would not change the target cell SHALL produce no history move.

#### Scenario: Left and right cycle in opposite directions

- **WHEN** an empty non-immutable cell receives a left-button action, then
  another, then another
- **THEN** it passes one → zero → empty
- **AND** the same cell under three right-button actions passes zero → one →
  empty

#### Scenario: Immutable cells reject marking

- **WHEN** a marking action targets an immutable clue cell
- **THEN** `interpretMove` produces no move and the cell is unchanged

### Requirement: Unruly's keys place and clear at the cursor

A keyboard cursor SHALL move within the grid. At the cell under a shown cursor,
the `1` key SHALL place one, `0` or `2` SHALL place zero, and Backspace or
Delete SHALL clear the cell.

#### Scenario: A digit sets the cell under the cursor

- **WHEN** the cursor is shown on an empty non-immutable cell and `1` is pressed
- **THEN** a move places one in that cell
- **AND** pressing `1` there again produces no move

### Requirement: Unruly draws pieces on a quiet surface

`redraw` SHALL draw the board as pieces on a quiet surface: every cell a
surface a small step off the board, a `one` as the first member of the
collection's two-state pair and a `zero` as the second, each in that member's
color and shape, inset on its cell. A cell the puzzle gave SHALL be told by a
lifted surface under its piece and by no mark on the piece.

#### Scenario: A given is told from a placed piece by its cell

- **WHEN** a board holds a given and a piece of the same kind that the player
  placed
- **THEN** the two pieces are drawn alike
- **AND** only the given's cell is drawn in the lifted surface

### Requirement: Unruly draws its error overlays live

Recomputed each frame, `redraw` SHALL draw the error overlays: an outline in
the error color around any three-in-a-row run, a badge (a `!` on a disc of the
error color) on the pieces of a row or column whose count of that kind is
exceeded, and (in `unique` mode) a bar in the error color across any pair of
identical full rows or columns.

#### Scenario: A three-in-a-row reddens live

- **WHEN** three consecutive cells of one kind exist in a row or column
- **THEN** `redraw` draws an error-colored outline around them without any
  explicit check action

### Requirement: Unruly draws a cursor outline and a completion flash

A keyboard cursor SHALL be drawn as an outline on the focused cell. On
completion a flash SHALL play, lifting every cell's surface on its first and
last frames.

#### Scenario: The completion flash plays once

- **WHEN** a player move transitions the board from unsolved to solved (not the
  Solve command)
- **THEN** a flash of positive duration plays and `redraw` lifts every cell's
  surface during its lit frames

### Requirement: Unruly checks player marks against the unique solution

The `unruly` game SHALL implement `findMistakes(state)`, the mistake check
Check & Save hard-blocks on: re-solve the board from its immutable clues alone with
the full deductive solver and return every player-placed (non-immutable) cell
whose color contradicts that unique solution. It SHALL return none when the
clues do not deduce a complete solution (a foreign or non-unique board) or when
the player's marks are all consistent.

#### Scenario: A wrong mark is flagged and a correct one is not

- **WHEN** the player places, on a non-clue cell, the opposite color to the
  cell's value in the unique solution, and Check & Save runs
- **THEN** `findMistakes` returns that cell
- **AND** placing instead the solution's color there leaves `findMistakes`
  returning no mistakes

### Requirement: A flagged mark is outlined apart from the live errors

`redraw` SHALL render each cell `findMistakes` flagged with a distinct inset
error-colored outline, separate from the live three-in-a-row and count error
overlays.

#### Scenario: Check & Save refuses a mistaken board

- **WHEN** the board carries at least one contradicting mark
- **THEN** the engine reports `canCheck` true, `findMistakes` returns a
  non-empty list, and the displayed mistake overlay renders the flagged cells in
  the error color

### Requirement: Unruly provides an explained deduction hint

The `unruly` game SHALL implement `hint(state)` returning a plan-carrying,
narrated hint that explains why each move is forced, and `hintKeepTrack` so the
plan auto-advances as the player follows it. `hint(state)` SHALL deduce, from
the player's current marks, the ordered sequence of forced cells, run to
fixpoint at the solver's full strength, and return one narrated `HintStep` per
forced cell.

#### Scenario: Hint explains the next forced move

- **WHEN** `hint` is called on an unsolved, mistake-free generated board
- **THEN** it returns `{ ok: true }` with a non-empty list of steps
- **AND** the first step's move is a legal `executeMove` whose narration names the
  technique (three-in-a-row / completed count / unique rows / near-complete) that
  forces its cell
- **AND** applying every step's move in order solves the board

### Requirement: A hint step states the technique that forces its cell

Each step's narration SHALL state the deduction technique that forces the cell:
two of three consecutive cells already equal (a third would be three in a row),
a row or column whose count of one kind is already complete (so the rest are
the other), a unique-rows conflict (a cell that would duplicate a full row or
column), or a near-complete row whose single remaining odd cell is pinned to
one window (so every other empty cell is forced).

#### Scenario: A pair of like cells is named as the reason

- **WHEN** a step's cell is forced by two like cells among three consecutive
- **THEN** its sentence says those cells are already that color and that the
  step's cell would make three in a row

### Requirement: A firing that forces several cells is one journey

Moves that a single firing forces (a whole line completing to one kind, a
near-complete row's forced remainder) SHALL be emitted as one journey via
`continuesPrevious`, so they read and auto-play as a single coherent hint.

#### Scenario: One firing reads as one journey

- **WHEN** a single completed-count or near-complete firing forces several cells
- **THEN** those cells are emitted as consecutive steps, the first beginning a
  journey and the rest flagged `continuesPrevious`
- **AND** the per-cell techniques (three-in-a-row, unique rows) emit independent
  steps

### Requirement: hintKeepTrack completes on the hinted cell and value

`hintKeepTrack` SHALL report `"completed"` when the player's move sets the
hinted cell to the hinted value and `"off"` otherwise.

#### Scenario: Following the hint advances the plan

- **WHEN** the player makes the move the current hint step describes
- **THEN** `hintKeepTrack` returns `"completed"`
- **AND** a move that sets a different cell, or the hinted cell to a different
  value, returns `"off"`

### Requirement: A displayed step carries the marks its sentence refers to

`redraw` SHALL render the displayed step with the marks its sentence refers
to: a ring on the cell the step fills, an outline on each cell the step reasons
from, and stripes on the row or column the sentence names. Every step SHALL
carry visible evidence, never a bare conclusion.

#### Scenario: Every hint step shows visible evidence

- **WHEN** `hint` returns a plan for a generated board
- **THEN** every step carries an outlined premise cell or a striped line, never
  a bare conclusion

### Requirement: A placement animates as a growing fill

Independently of hints, the game SHALL implement `animLength` so that a `place`
move which changes a cell animates: `redraw` SHALL grow a placed piece from the
middle of its cell to full size over the animation, and shrink a piece that is
taken away. The animation SHALL be geometric (no color tween), settle to the
plain piece, and coexist with the completion flash.

#### Scenario: A placement animates as a growing fill

- **WHEN** a `place` move fills a cell and `redraw` runs mid-animation
- **THEN** the cell draws its piece smaller than at rest, centered, and larger
  the further the animation has run
- **AND** at rest the cell shows the plain piece

### Requirement: A hint-executed placement plays at the hint-step duration

Because the base animation length is non-zero, a hint-executed move SHALL play
stretched to the uniform hint-step duration, so auto-hint reads as continuous
placements.

#### Scenario: A hint step's move has an animation to stretch

- **WHEN** a hint step's placement is executed
- **THEN** `animLength` for it is positive, and the move plays over the
  hint-step duration

### Requirement: The named line is hatched under its pieces

The line the sentence names SHALL be hatched `COL_HINT`, under the pieces it
holds.

#### Scenario: A completed-count hint hatches its line

- **WHEN** a `complete` hint is displayed
- **THEN** every cell of the row or column it names is hatched `COL_HINT`
- **AND** each piece on that line is drawn over the hatch

### Requirement: A cited premise is ringed apart from the move

The cited premise or pivotal cells the deduction reasons over SHALL be ringed
`COL_HINT_REF`, not `COL_HINT`, so the cited premise is not drawn in the same
color as the forced move: the like pair in `threes`, the completed quota in
`complete`, the full reference line in `unique`, and in `nearcomplete` the
reserved window with the piece beside it when there is one. The cell SHALL keep
its own appearance inside the ring: a piece stays visible, and an empty
reserved-window cell stays empty.

#### Scenario: A reserved window is ringed and stays empty

- **WHEN** a `nearcomplete` hint is displayed
- **THEN** the empty cells of its reserved window are ringed `COL_HINT_REF`
- **AND** they are drawn empty inside the ring

### Requirement: Unruly uses a single premise ring color

Unruly SHALL use a single premise ring color, not one per kind of piece: its
ringed cells are not uniformly one kind, since `unique` rings a balanced line
holding both and `nearcomplete` rings empty cells, so a state-derived ring
color is ill-defined.

#### Scenario: A reference line of both kinds rings in one color

- **WHEN** a `unique` hint is displayed
- **THEN** every cell of the reference line is ringed `COL_HINT_REF`, whichever
  piece it holds
