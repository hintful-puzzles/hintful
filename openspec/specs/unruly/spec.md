# unruly Specification

## Purpose
Unruly (Binairo), the puzzle of filling every square with one of two pieces so that no
three consecutive squares in a line match and each row and column is half of
each, optionally with no two rows or columns alike. This holds the game's own
rules: what its params refuse and which piece each case of its description's
letters gives, what each difficulty's techniques are and how a board's clues
are winnowed, its cycling clicks and digit keys, its look and live errors,
its mistake check, and its hint's techniques, journeys and marks. What every
game shares is in the engine capabilities.

## Requirements

### Requirement: Rules: The board is solved while its counts and runs are valid

Unruly (Binairo, Tohu-wa-Vohu) SHALL be played on a `w2 × h2` grid in which
every cell is filled with one of two values, `one` or `zero`, the two members
of the collection's two-state pair. The board SHALL be reported solved exactly
while no row or column holds a run of three equal cells and each row and
column holds equally many of each.

#### Scenario: Completing the board is detected

- **WHEN** a move fills the final cell of a valid solution
- **THEN** `status` returns `"solved"`, and a flash plays

### Requirement: Rules: The unique variant forbids identical rows and columns

An optional `unique` variant SHALL additionally forbid two identical rows and
two identical columns.

#### Scenario: Two identical full rows do not solve a unique board

- **WHEN** a `unique` board is filled so that every count is balanced and no
  run of three exists, and two of its rows are identical
- **THEN** `status` does not return `"solved"`
- **AND** the same grid on a board without `unique` is solved

### Requirement: Rules: A placement on a clue or off the board is rejected

`executeMove` SHALL reject a placement whose target is out
of bounds or an immutable clue cell.

#### Scenario: A placement on a clue is rejected

- **WHEN** `executeMove` is given a placement on an immutable clue cell
- **THEN** it throws, and the state it was given is unchanged

### Requirement: Rules: Unruly checks player marks against the unique solution

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

### Requirement: Params: An Unruly params string is its declared codec's, and one with no difficulty is Easy

Unruly's params (a width and a height, the `unique` variant and a difficulty)
and their encoding SHALL be those its `paramConfig` and its declared codec
give (`engine-params`, "A game declares its params encoding once, and both
codec halves are derived"), with no departure from the codec grammar. A params
string with no `d` SHALL decode as Easy.

#### Scenario: The unique board of the Type menu

- **WHEN** `8x8ude` is decoded
- **THEN** the board is 8×8 with unique rows and columns, at Normal
- **AND** encoding it without `full` gives `8x8u`

### Requirement: Params: Unruly refuses params no board can be dealt for

`validateParams` SHALL reject an odd dimension, an unreasonably large `w2·h2`,
and a `unique`-mode grid too tall or too long for any valid set of distinct
rows (the A177790 bound).

#### Scenario: Invalid params are rejected

- **WHEN** the engine's params check is given an odd dimension, a dimension
  below 6, or a `unique`-mode grid exceeding the distinct-rows bound
- **THEN** it returns a non-null error string

### Requirement: Description: Unruly descriptions are run-length color grids

The desc SHALL encode the immutable clue cells in scan order, in the engine's
dot-run grammar (`engine-params`, "The engine provides the dot-run description
grammar"): a lowercase letter is a `zero` clue and an uppercase letter a `one`
clue. The parser SHALL refuse what `readDotRuns` refuses (`engine-params`,
"The dot-run reader refuses what its writer never writes"), and nothing of
its own.

#### Scenario: Two clues of the two kinds

- **WHEN** a 6×6 board whose first cell is a `one` clue and whose second is a
  `zero` clue, with no other, is written and read back
- **THEN** its description opens with an uppercase letter and then a lowercase
  one
- **AND** the first two cells are immutable in those values, and the third is
  empty and the player's to fill

### Requirement: Generation: Unruly winnows the clues of a full valid grid

`newDesc` SHALL winnow the clues of a full valid grid, keeping a clue only
where the solver at the target difficulty could not finish without it.

#### Scenario: A Tricky board is not a Normal one

- **WHEN** `newDesc` deals a board at Tricky
- **THEN** the deductive solver capped at Normal does not finish it from its
  clues

### Requirement: Generation: The Easy techniques are the impending three and the single gap

At Easy the solver SHALL apply two techniques: the two cells of an
almost-three filled the same color force the third cell to the opposite color,
and a row or column with one empty cell left for a color fills it.

#### Scenario: The impending-three rule forces the third cell

- **WHEN** the solver runs on a row with two adjacent same-color cells and an
  adjacent empty cell that would complete a forbidden run
- **THEN** that empty cell is set to the opposite color

### Requirement: Generation: The Normal techniques are the completed count and the unique-rows conflict

At Normal the solver SHALL additionally apply two techniques: a row or column
already holding its full count of one color fills the rest with the other, and,
in `unique` mode only, a full row or column matched in all but one place by a
one-short row or column forces that place to differ.

#### Scenario: A completed count fills the rest of its line

- **WHEN** the solver runs at Normal on a row that holds its full count of one
  color and several empty cells
- **THEN** every empty cell of the row is set to the other color

### Requirement: Generation: The Tricky technique is the near-complete line

At Tricky the solver SHALL additionally apply one technique: in a near-complete
row or column whose last cell of a color, if placed in certain cells, would
create three-in-a-row, that color is forced elsewhere.

#### Scenario: The last piece is pinned beside a pair of empties

- **WHEN** a row has one cell of a color left to place and holds two adjacent
  empty cells beside a cell of the other color
- **THEN** the solver at Tricky sets every other empty cell of the row to the
  other color

### Requirement: Controls: Unruly marks cells via three-state cycling moves

The left-click verb of Unruly's `targetVerbs` SHALL cycle a non-immutable
cell empty → one → zero → empty, and the right-click verb
empty → zero → one → empty. An immutable cell SHALL be inert.

#### Scenario: Left and right cycle in opposite directions

- **WHEN** an empty non-immutable cell receives a left-button action, then
  another, then another
- **THEN** it passes one → zero → empty
- **AND** the same cell under three right-button actions passes zero → one →
  empty

#### Scenario: Immutable cells reject marking

- **WHEN** a marking action targets an immutable clue cell
- **THEN** `interpretMove` produces no move and the cell is unchanged

### Requirement: Controls: Unruly's digit keys place at the cursor

At the cell under a shown cursor, the `1` key SHALL place one and `0` or `2`
SHALL place zero.

#### Scenario: A digit sets the cell under the cursor

- **WHEN** the cursor is shown on an empty non-immutable cell and `1` is pressed
- **THEN** a move places one in that cell

### Requirement: Hint: A hint step states the technique that forces its cell

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

### Requirement: Hint: A firing that forces several cells is one journey

The plan SHALL hold one narrated step per forced cell. The moves that a single
firing forces (a whole line completing to one kind, a near-complete row's
forced remainder) SHALL be one journey.

#### Scenario: One firing reads as one journey

- **WHEN** a single completed-count or near-complete firing forces several cells
- **THEN** those cells are emitted as consecutive steps, the first beginning a
  journey and the rest flagged `continuesPrevious`
- **AND** the per-cell techniques (three-in-a-row, unique rows) emit independent
  steps

### Requirement: Hint: hintKeepTrack completes on the hinted cell and value

`hintKeepTrack` SHALL report `"completed"` when the player's move sets the
hinted cell to the hinted value and `"off"` otherwise.

#### Scenario: Following the hint advances the plan

- **WHEN** the player makes the move the current hint step describes
- **THEN** `hintKeepTrack` returns `"completed"`
- **AND** a move that sets a different cell, or the hinted cell to a different
  value, returns `"off"`

### Requirement: Hint: Every step shows the evidence it rests on

What the ring, the outline and the stripes of a displayed step stand for SHALL
be the legend's (`hintMarks`). Every step SHALL carry visible evidence, never
a bare conclusion.

#### Scenario: Every hint step shows visible evidence

- **WHEN** `hint` returns a plan for a generated board
- **THEN** every step carries an outlined premise cell or a striped line, never
  a bare conclusion

### Requirement: Hint: The named line is hatched under its pieces

The line the sentence names SHALL be hatched `COL_HINT`, under the pieces it
holds.

#### Scenario: A completed-count hint hatches its line

- **WHEN** a `complete` hint is displayed
- **THEN** every cell of the row or column it names is hatched `COL_HINT`
- **AND** each piece on that line is drawn over the hatch

### Requirement: Hint: A cited premise is ringed apart from the move

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

### Requirement: Hint: Unruly uses a single premise ring color

Unruly SHALL use a single premise ring color, not one per kind of piece: its
ringed cells are not uniformly one kind, since `unique` rings a balanced line
holding both and `nearcomplete` rings empty cells, so a state-derived ring
color is ill-defined.

#### Scenario: A reference line of both kinds rings in one color

- **WHEN** a `unique` hint is displayed
- **THEN** every cell of the reference line is ringed `COL_HINT_REF`, whichever
  piece it holds

### Requirement: Hint: Unruly's hint tries the simplest technique first

The hint SHALL try its techniques in this order: three in a row, a line with
one empty cell, a completed count, on a `unique` board the unique-rows
conflict, and the near-complete line. It SHALL take every cell the first of
them that fires forces in one pass over the board, and then start again from
the first. It SHALL try all of them whatever tier the board was dealt at. A
line with one empty cell SHALL be told as a completed count.

#### Scenario: A pair and a full quota on one board

- **WHEN** one row holds two like pieces side by side with an empty cell
  beyond them, and another row already holds all its pieces of one kind with
  several cells empty
- **THEN** the step for the cell beside the pair comes before any step that
  fills the other row

#### Scenario: A row with one cell left

- **WHEN** a row holds all its pieces of one kind and all but one of the
  other, and no three in a row is pending
- **THEN** the step fills the last cell with the other kind, and its sentence
  says the row already holds all its cells of the first

### Requirement: Look: Unruly draws pieces on a quiet surface

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

### Requirement: Look: Unruly draws its error overlays live

Recomputed each frame, `redraw` SHALL draw the error overlays: an outline in
the error color around any three-in-a-row run, a badge (a `!` on a disc of the
error color) on the pieces of a row or column whose count of that kind is
exceeded, and (in `unique` mode) a bar in the error color across any pair of
identical full rows or columns.

#### Scenario: A three-in-a-row reddens live

- **WHEN** three consecutive cells of one kind exist in a row or column
- **THEN** `redraw` draws an error-colored outline around them without any
  explicit check action

### Requirement: Look: Unruly draws a cursor outline, and the win flash fills a cell under its piece

A keyboard cursor SHALL be drawn as an outline on the focused cell. A cell the
completion flash is on SHALL be filled with a flash color and keep its piece,
a given as any other cell.

#### Scenario: The completion flash plays once

- **WHEN** the completion flash is on a cell
- **THEN** `redraw` fills that cell with a flash color, under its piece
- **AND** once the flash has left it the cell is on its own surface again, and
  is not lit a second time

### Requirement: Look: A flagged mark is outlined apart from the live errors

`redraw` SHALL render each cell `findMistakes` flagged with a distinct inset
error-colored outline, separate from the live three-in-a-row and count error
overlays.

#### Scenario: Check & Save refuses a mistaken board

- **WHEN** the board carries at least one contradicting mark
- **THEN** the engine reports `canCheck` true, `findMistakes` returns a
  non-empty list, and the displayed mistake overlay renders the flagged cells in
  the error color

### Requirement: Look: A placement animates as a growing fill

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
