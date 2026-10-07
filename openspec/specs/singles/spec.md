# singles Specification

## Purpose
Singles (Hitori), the puzzle of shading squares so that no number repeats
in a row or column, no two shaded squares share an edge, and the squares left
clear stay connected. This capability specifies its port to the TS engine, with
difficulty-graded unique generation, the show-black-numbers preference,
mistake-checking, and an explained deduction hint with its own legend of marks.

## Requirements

### Requirement: Singles game implements the Game interface

The engine SHALL provide a registered `singles` game implementing
`Game<SinglesParams, SinglesState, SinglesMove, SinglesUi, SinglesDrawState,
SinglesMistake>`: the Nikoli puzzle Hitori on a `w × h` grid of numbers, in
which the player blackens cells so that no number repeats among the remaining
(white) cells of any row or column, no two black cells are orthogonally
adjacent, and the white cells form one orthogonally-connected region. Params
SHALL be `w`, `h`, and `diff` (Easy or Normal), encoded `{w}x{h}d{c}` when full
(`c` = `e`/`k`) and `{w}x{h}` otherwise, with presets at 5×5, 6×6, 8×8, 10×10,
and 12×12 in both Easy and Normal. `validateParams` SHALL require `w ≥ 2`,
`h ≥ 2`, both `≤ 62`, and (when full) a known difficulty. The game SHALL provide `solve` and `textFormat`, and SHALL NOT provide `statusbarText`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 8, h: 8, diff: "tricky" }` (the Normal tier) are encoded
  with `full = true`
- **THEN** the result is `8x8dk`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `8x8`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `w < 2` or `h < 2`
- **THEN** it returns a non-null error string

### Requirement: Singles descriptions are fixed-length number grids

The desc SHALL encode the board's numbers in scan order, one character per cell:
digits `0`–`9` for `0`–`9`, letters `a`–`z` for `10`–`35`, `A`–`Z` for `36`–`61`.
`validateDesc` SHALL require the desc length to equal `w·h` exactly and every
decoded number to lie in `1..max(w,h)`. `newState` SHALL decode the desc into an
immutable `nums` grid with all flags blank.

#### Scenario: Description decodes to the number grid

- **WHEN** a valid desc for a `w × h` board is decoded by `newState`
- **THEN** each cell holds its decoded number
- **AND** every cell starts neither black nor circled

#### Scenario: Wrong-length description is rejected

- **WHEN** `validateDesc` is given a desc whose length is not `w·h`
- **THEN** it returns a non-null error string

### Requirement: Singles toggle moves and cursor

`interpretMove` SHALL map a left-click / `CURSOR_SELECT` on a grid cell to a move
that toggles the cell black (clearing it to empty if it was already black or
circled), and a right-click / `CURSOR_SELECT2` to a move that toggles the cell
circled (clearing it to empty if already set). A click outside the grid SHALL
toggle the show-black-numbers preference (a `UI_UPDATE`). Keyboard cursor moves
SHALL move the cursor and SHALL return a `UI_UPDATE` (revealing the cursor on the
first arrow press) rather than a history move. `executeMove` SHALL clear both the
black and circle bits on each targeted cell before applying the new value, and
SHALL set the board completed when `checkComplete` reports no errors.

#### Scenario: Left-click cycles a cell through black and back to empty

- **WHEN** the player left-clicks an empty cell, then left-clicks it again
- **THEN** the first move marks it black
- **AND** the second move clears it to empty

#### Scenario: Completion is detected

- **WHEN** the player reaches a configuration with no repeated white numbers in
  any row or column, no adjacent blacks, and a single white region
- **THEN** `status` reports the game solved

### Requirement: Singles deductive solver

The game SHALL provide a deductive solver reproducing the upstream techniques:
the auto-cascade (a black forces its neighbors white; a circled cell forces
same-numbered cells in its row/column black), `singlesep`, `doubles`, `corners`,
`offsetpair` (Normal and above), `allblackbutone`, and `removesplits` (Normal
and above). It SHALL detect impossibility (e.g. a white cell with no white
escape, or a contradiction in the cascade). `solve` SHALL attempt to solve the
current state and then the initial state, returning the move that completes the
board or an error when neither can be solved, and SHALL mark the state as
solved-with-help.

#### Scenario: Solver completes a generated board

- **WHEN** a board generated at a given difficulty is solved by the solver from
  its initial numbers
- **THEN** the solver fully determines every cell (black or white) with no errors

#### Scenario: Solve reports failure on an unsolvable position

- **WHEN** `solve` is called on a board the solver cannot complete
- **THEN** it returns a non-null error and applies no move

### Requirement: Singles rendering

`redraw` SHALL draw the board as pieces on a quiet surface. Every cell SHALL be
the collection's cell surface, with the collection's surface grid line between
cells and a frame round the grid no heavier than that line. A blackened cell
SHALL hold the collection's shaded piece, inset on its cell. A circled cell
SHALL hold a ring round its number in the collection's ruled-out color, with no
fill of its own, and SHALL carry no other mark for that state. An undecided
cell SHALL be plain surface. State SHALL never be told by a step of gray.

A cell that holds no piece SHALL always show its number, in ink. A blackened
cell SHALL show its number only when the show-black-numbers preference is on,
drawn on the piece in a color that is the same in both schemes, and smaller
than the number of a cell that holds no piece.

A cell `checkComplete` flags as an error SHALL be drawn in the error color: the
piece of a blackened cell, and the number and the ring of any other. The cursor
SHALL be brackets at the corners of the cursor cell, and the hint's marks and
the Check & Save outline SHALL be bands at the cell's edge, so that each lands
beside the piece and the ring and never on them. The grid lines and the frame
SHALL be drawn in the error color when the board is in an impossible state. A
genuine completion (not a solved-with-help) SHALL trigger the completion flash,
which lifts the surface of every cell that holds no piece.

The game SHALL name no hue of its own for a blackened cell: its hint
sentences, its control words and its preference's label SHALL say the
collection's word for the shaded color and its word for a cell that is not
shaded, and its help page SHALL name the shaded color by placeholder.

#### Scenario: A blackened cell holds the shaded piece with no number by default

- **WHEN** a cell is blackened and the show-black-numbers preference is off
- **THEN** the cell holds the shaded piece and no number is drawn

#### Scenario: An erroneous cell renders in the error color

- **WHEN** `checkComplete` flags a cell as an error
- **THEN** that cell's piece, or its number and ring where it holds no piece,
  is drawn in the error color

#### Scenario: A circled cell is a ring on the surface

- **WHEN** a cell is circled
- **THEN** it is drawn as the cell surface with an unfilled ring round its
  number
- **AND** the ring stands in from the cell's edge by more than the thickness
  of a hint's band

#### Scenario: A hint names the color the piece is drawn in

- **WHEN** a hint step concludes that a cell must be blackened
- **THEN** its sentence says the collection's word for the shaded color
- **AND** applying the step draws the shaded piece in that cell

### Requirement: Singles show-black-numbers preference

The game SHALL expose a single boolean preference (keyword `show-black-nums`),
labeled "Show numbers on … squares" with the collection's word for the shaded
color, via the engine `prefs` hook, stored on the `Ui` and read by `redraw`. It
SHALL default to off.

#### Scenario: Preference toggles numbers on black squares

- **WHEN** the show-black-numbers preference is turned on
- **THEN** subsequent redraws draw each black cell's number

### Requirement: Singles mistake-checking

The game SHALL implement `findMistakes(state)`: re-solve the board from its
immutable numbers to the unique solution and return every player cell whose
black/white choice contradicts that solution (a cell marked black where the
solution is white, or circled where the solution is black). Undecided cells SHALL
never be reported. It SHALL return an empty result when the board is consistent
with the unique solution, so the shell's Check & Save control hard-blocks a save
only on a genuine mistake.

#### Scenario: A wrong black is flagged

- **WHEN** the player blackens a cell that the unique solution leaves white
- **THEN** `findMistakes` includes that cell

#### Scenario: A correct partial board reports no mistakes

- **WHEN** every black/circle the player has placed agrees with the unique
  solution
- **THEN** `findMistakes` returns an empty result

### Requirement: Singles provides an explained deduction hint

The `singles` game SHALL implement `hint(state)` returning a plan-carrying,
narrated hint that explains *why* each move is forced (the fork's hint quality
bar), and `hintKeepTrack` so the plan auto-advances as the player follows it.
The hint SHALL refuse (a `{ ok: false }` result) when the board is already
solved or when `findMistakes(state)` is non-empty, since a deduction seeded from
contradictory marks would mislead. Otherwise it SHALL run the deductive solver
from the player's current marks, recording each forced cell in deduction order
with the deduction that forces it, and return the ordered sequence of narrated
`HintStep`s (the remaining solution).

Each step's narration SHALL state the deduction that forces the cell: two equal
numbers one cell apart forcing the middle white; an adjacent equal pair
blackening the other copies in its line; a 2×2 board-corner argument
(four/three/two matching numbers); an offset-pair pattern; a white cell with a
single non-black neighbor forcing that neighbor white; a square whose
shading would split the white region forcing it white; a cell adjacent to a
shaded square forcing it white; or a number sharing a line with a circled white
forcing it shaded. A single deduction that forces **two cells at once** (the
four-in-a-corner pair, an offset-pair's two whites) SHALL be emitted as **one**
multi-cell `HintStep`, not two.

`redraw` SHALL render the displayed step: the target cell(s) ringed in the
hint color at the cell's edge, drawn without the forced mark (the narration
says whether to shade or circle), and the deduction's **evidence** outlined at
the cell's edge so the narration's premise is visible — in the evidence color
where the evidence is an undecided number cell, and in a color of its kind
where the evidence is an already-decided cell whose black or circled state is
itself the reason (an adjacent shaded square; a circled cell using up a
number). The row or column a sentence names SHALL be striped. Every step SHALL
carry visible evidence — at least one outlined cell — never a bare conclusion.

Where a single deduction has premise cells in **distinct roles**, those roles
SHALL be rendered in distinct colors, so the highlight does not imply cells
share a role they do not. Specifically, a 2×2-corner deduction SHALL distinguish
the **matching pair** (the cells that share a number, outlined as evidence) from
the **protected corner** (the cell that would be sealed off, outlined in its own
distinct color). The three roles (target, evidence, protected corner) SHALL be
mutually disjoint — no cell carries two roles. The corner deduction's narration
SHALL name the **actual numbers** involved (not generic "this square / its other
neighbor") and follow the proof-by-contradiction order it embodies — the
signal (the touching matching pair), the move being ruled out (shading the
target), its consequence (the corner's other neighbor forced shaded, the corner
boxed in), and the deduction (the target stays not shaded) — in the shape "A
touching pair of 3s sits at the corner, so one must be *shaded*. Shading this 5
would force the 3 beside the corner *shaded*, leaving the corner 4 boxed in, so
it must stay *not shaded*", each italic word being the collection's word for
that state.

`hintKeepTrack` SHALL report `"completed"` when the player's move sets exactly
the hinted cell(s) to the hinted value, `"onTrack"` (shrinking a multi-cell step
in place to the cells still outstanding) when the move fills a strict subset of a
multi-cell step's cells with the hinted value and nothing else, and `"off"`
otherwise.

#### Scenario: Hint explains the next forced move

- **WHEN** `hint` is called on an unsolved, mistake-free generated board
- **THEN** it returns `{ ok: true }` with a non-empty list of steps
- **AND** the first step's move is a legal `executeMove` whose narration names
  the deduction (sandwich / pair / corner / offset / connectivity / cascade)
  that forces its cell
- **AND** applying every step's move in order solves the board

#### Scenario: A two-cell firing is one step

- **WHEN** the deduction that fires forces two cells simultaneously (a 2×2
  corner with four matching numbers, or an offset-pair pattern)
- **THEN** the hint emits a single `HintStep` whose move sets both cells

#### Scenario: A corner deduction separates the corner from the matching pair

- **WHEN** a 2×2-corner deduction fires (e.g. a top-left 2×2 of `[[4,3],[5,3]]`,
  where the two 3s match and the 4 corner would be sealed off)
- **THEN** the matching pair is the outlined evidence, the corner is the distinct
  "protected corner" role in its own color, and the forced cell is the target —
  the three roles disjoint
- **AND** the narration names the actual numbers and follows the contradiction
  arc ("A touching pair of 3s sits at the corner … Shading this 5 … leaving
  the corner 4 boxed in …"), ending that the 5 must stay not shaded

#### Scenario: Every hint step shows visible evidence

- **WHEN** `hint` returns a plan for a generated board
- **THEN** every step carries at least one outlined cell — never a bare
  conclusion

#### Scenario: Hint refuses on a solved or mistaken board

- **WHEN** `hint` is called on a solved board, or on a board where the player has
  marked a cell contradicting the unique solution
- **THEN** it returns `{ ok: false }` with an explanatory error

#### Scenario: Following the hint advances the plan

- **WHEN** the player makes the move the current hint step describes
- **THEN** `hintKeepTrack` returns `"completed"` (or `"onTrack"` when a
  multi-cell step is filled one cell at a time)
- **AND** a move that sets a different cell, or the hinted cell to a different
  value, returns `"off"`

### Requirement: Singles hint color legend

When a Singles hint is displayed, `redraw` SHALL distinguish the element types
the deduction names using a stable color legend. Every cell carries a number,
so no hint role SHALL be a fill: each SHALL be a band at the cell's edge,
beside the piece and the ring, or stripes under the cell's content.

- The **forced cell(s)** (the move) SHALL be banded `COL_HINT` with no
  mark preview drawn.
- An **undecided number premise** (the matching numbers a deduction reasons
  over) SHALL be banded `COL_HINT_CELL`.
- A cited **decided shaded premise** SHALL be banded `COL_HINT_BLACKREF`; a
  cited **decided circled premise** SHALL be banded `COL_HINT_WHITEREF` — so a
  deduction that names both a decided premise and the forced cell does not
  draw them in the same color. The band's color SHALL be chosen from the
  cell's own decided state, and the cell's own piece or ring SHALL stay drawn
  as the cue that is not a color.
- The **protected corner** of a corner deduction SHALL be banded
  `COL_HINT_STRAND`.
- The **row or column** a sentence names SHALL be striped in `COL_HINT`.

The legend SHALL be consistent across deductions (a shaded-square premise is the
same color in every hint that cites one). Which cell takes which mark SHALL be
read from the step's words, with the `SinglesHint` payload's `strand` telling
the protected corner from the other outlined cells, and the three highlight
roles SHALL be disjoint.

#### Scenario: A cited shaded square rings distinct from the forced cell

- **WHEN** an `adjBlack` hint is displayed (a shaded square forces an adjacent
  cell to be not shaded)
- **THEN** the cited shaded premise is banded `COL_HINT_BLACKREF` and the forced
  cell is banded `COL_HINT`, in different colors

#### Scenario: A cited ringed white square uses the white-reference color

- **WHEN** a `sameLine` or `boxedIn` hint is displayed (a circled square is
  the reason)
- **THEN** the cited circled premise is banded `COL_HINT_WHITEREF`

#### Scenario: Number premises and corners take their own colors

- **WHEN** a hint cites undecided matching numbers, or a corner deduction
  protects a corner
- **THEN** the numbers are banded `COL_HINT_CELL`, their digits untouched, and
  the protected corner is banded `COL_HINT_STRAND`

### Requirement: Singles generates unique, difficulty-graded boards

`newDesc` SHALL generate a board by constructing a Latin rectangle, adding black
squares at random with solver assistance (forced whites laid between
placements), and assigning numbers under the black squares so the solution stays
unique. It SHALL accept the board only when it is solvable at the requested
difficulty and *not* solvable one difficulty level below (with the sneaky
generation-artifact deduction enabled), regenerating otherwise. Difficulty SHALL
downgrade to Easy when `min(w, h) < 4`. Generation from a given seed SHALL
be reproducible.

#### Scenario: Generated boards are uniquely solvable at their difficulty

- **WHEN** a board is generated at difficulty D
- **THEN** the solver solves it at D
- **AND** (for Normal) the solver fails to solve it at the level below D even
  with the sneaky deduction

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Singles description
