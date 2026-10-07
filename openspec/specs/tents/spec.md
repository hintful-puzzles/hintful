# tents Specification

## Purpose
Tents, the puzzle of placing tents so that each tree can be matched to its own
orthogonally adjacent tent, no two tents touch even diagonally, and each row and
column holds its clued count. This capability specifies its port to the TS
engine: the graded solver, live errors and completion, drag, cursor and
direct-key input, and mistake-checking.

## Requirements

### Requirement: Tents game implements the Game interface

The engine SHALL provide a registered `tents` game implementing
`Game<TentsParams, TentsState, TentsMove, TentsUi, TentsDrawState, TentsMistake>`:
place tents on a `w × h` grid of fixed trees so that each tent is
orthogonally adjacent to a tree in a one-to-one tree↔tent matching, no two
tents are even diagonally adjacent, and each row/column contains exactly its
edge-clue number of tents. Params SHALL be `w`, `h` and `diff`
(Easy / Normal), encoded `{w}x{h}d{e|t}` (short form `{w}x{h}`, square
shorthand `{n}`). All 6 upstream presets (8×8, 10×10, 15×15 × Easy/Normal)
SHALL be offered. `validateParams` SHALL enforce minimum size 4×4. The game SHALL provide `solve` and `textFormat`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 15, h: 15, diff: DIFF_TRICKY }` (the Normal tier) are encoded in full
- **THEN** the result is `15x15dt` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a grid smaller than 4×4
- **THEN** it returns a non-null error string

### Requirement: Tents descriptions use the upstream run-length encoding

The desc SHALL encode the tree grid row-major (a run-length code where `_`
is a tree, `a`–`y` a run of 1–25 blanks then a tree, `z` a run of 25 blanks,
and the sequence terminates with a tree-past-the-end marker) followed by the
`w + h` edge numbers (columns then rows) each preceded by a comma.
`validateDesc` SHALL reject invalid characters, wrong grid area, and missing
or malformed numbers. `newState` SHALL parse the desc into a tree grid and an
edge-number array shared (frozen) across all states of the game, with all
non-tree squares initially blank.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with a bad grid area or a missing
  number
- **THEN** it returns a non-null error string

### Requirement: Tents computes live errors and completion as upstream

`redraw` SHALL compute live error highlighting exactly as upstream
`find_errors`: diagonally- or orthogonally-adjacent tent pairs mark the
shared corner(s) with an error diamond; a row/column whose tent count exceeds
its clue or whose tents-plus-blanks fall below its clue marks that edge
number red; and, via two connected-component passes over the bipartite
tent/tree adjacency (a `dsf`), a tent in a component with fewer trees than
tents, or a tree in a component with more trees than tents-or-blanks, is
highlighted red. The board SHALL be reported complete exactly as upstream
`execute_move` judges it: the tent count equals the tree count, every edge
number is met, no two tents are adjacent, and the trees and tents admit a
perfect adjacency matching (bipartite `matching`). Completion SHALL be judged
from the board however it was reached, and the win flash SHALL NOT play for the
Solve command.

#### Scenario: Adjacent tents are flagged

- **WHEN** two tents are placed diagonally adjacent
- **THEN** the shared corner shows an error diamond

#### Scenario: An unmet clue is flagged

- **WHEN** a column already holds more tents than its edge number
- **THEN** that edge number renders red

#### Scenario: Completion requires a valid matching

- **WHEN** the tents match all edge numbers and are non-adjacent but no
  perfect tree↔tent matching exists
- **THEN** the state does not report completed

### Requirement: Tents input maps drag gestures, cursor and direct keys

`interpretMove` SHALL implement the upstream drag model: pressing the left or
right button starts a one-cell drag; dragging extends it along the single
nearer row or column; releasing enacts it. A left click sets a blank square
to a tent or clears a non-blank square; a right click sets a blank to a
non-tent or clears a non-blank; a right-drag sets every blank square it
covers to a non-tent. Trees are never modified. Arrow keys SHALL move a
cursor (revealing it first), select/select2 SHALL set the cursor square to a
tent/non-tent (or clear it), and the literal keys `T`/`N`/`B` SHALL set it
directly. A gesture producing no change SHALL return no move.

A left drag between a tree and the square orthogonally beside it, in either
direction, SHALL be the link gesture when that square holds a tent or is
blank: it joins the two, placing a tent on a blank square in the same move, or
parts them when they are already joined, and it changes no other square. `L`
on the cursor's tree, tent or blank square, followed by an arrow, SHALL make
the same move toward that neighbor and take the cursor along; any other key
disarms it. A left drag that is not the link gesture keeps upstream's meaning,
a click at its start.

#### Scenario: A left click toggles a tent

- **WHEN** a blank square is left-clicked, then left-clicked again
- **THEN** the square becomes a tent, then blank

#### Scenario: A right-drag paints non-tents

- **WHEN** the right button is dragged across a row of blank squares
- **THEN** every covered blank square becomes a non-tent

#### Scenario: A drag from a tree to a blank square places its tent joined

- **WHEN** the player left-drags from a tree onto the blank square beside it,
  or from that square onto the tree
- **THEN** the square becomes a tent joined to that tree, in one move

#### Scenario: The keyboard joins with L and an arrow

- **WHEN** the cursor is on a tree, the player presses `L` and then the arrow
  toward the blank square or tent beside it
- **THEN** the same link move is made and the cursor moves onto that square

### Requirement: Tents ships findMistakes

`findMistakes(state)` SHALL re-solve the board's trees and edge numbers with
the top-difficulty solver and, when a unique solution exists, return one
mistake per placed square that contradicts it — a tent where the solution has
none, or a non-tent where the solution has a tent (blank squares are never
mistakes) — rendered with a distinct inset red overlay; it SHALL return an
empty list when the board is not uniquely solvable. It SHALL also return every
link that no pairing of the solution's tents with its trees can hold together
with the links before it in reading order, rendered in the mistake color: the
solution's tents are unique but its pairing need not be.

#### Scenario: A wrong tent blocks Check & Save

- **WHEN** a tent is placed where the unique solution has none and
  `findMistakes` runs
- **THEN** exactly that square is reported and rendered with the mistake
  overlay

#### Scenario: Blank squares are not mistakes

- **WHEN** the board holds only correct tents and non-tents plus blanks
- **THEN** `findMistakes` returns an empty list

#### Scenario: A link no pairing holds is a mistake

- **WHEN** the player joins a correct tent to a tree that no pairing of the
  solution gives it, and `findMistakes` runs
- **THEN** that link is reported and drawn in the mistake color

### Requirement: Tents solves with a graded deductive solver

The solver SHALL return the impossible / unique / non-converged (0 / 1 / 2)
verdict at each difficulty. It SHALL perform: tent↔tree link deduction (a tent with one unattached adjacent tree,
and a tree with one candidate square, are linked); non-tent marking (a blank
with no adjacent unmatched tree, or diagonally adjacent to any tent); the
Normal-tier (`DIFF_TRICKY`) tree diagonal-pair elimination; and the row/column
combination-enumeration pass that places a tent or non-tent in any square
given the same state by every valid placement of the row's remaining tents
(with the Normal-tier adjacent-row influence). The solver SHALL be reused by
`solve()`, the generator's difficulty gate, and `findMistakes`.

#### Scenario: Generated boards solve at exactly their difficulty

- **WHEN** a board generated at Normal is solved
- **THEN** the Normal solver reaches the unique solution
- **AND** the Easy solver fails to converge on it

#### Scenario: Solve recovers from a wrong mid-game state

- **WHEN** `solve()` runs against a state containing wrong tents
- **THEN** the returned move yields the unique solution

### Requirement: Tents generates solver-gated boards reproducibly

`newDesc` SHALL generate the same board for the same seed: place `w*h/5` tents at random mutually-non-adjacent squares (an order
permutation driven by `random_upto`), place trees via the bipartite
`matching`, reject any layout with an empty row or column,
derive the edge numbers, and accept only when the solver succeeds at the
target difficulty and fails one level below.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Tents description

### Requirement: Tents renders trees, tents, clues, errors and the completion flash

`redraw` SHALL render: grass-filled non-blank tiles, trees (trunk rectangle
plus leaf circles), tents (triangle), grid lines, the edge numbers on the
bottom (columns) and right (rows) borders, red error coloring (error trunk,
error leaf/tent, adjacency diamonds with exclamation marks, red numbers), the
keyboard cursor outline, and the upstream 3-phase completion flash (trees and
tents blanked on the flashed thirds). The web build's `NARROW_BORDERS`
geometry SHALL be used (thin top-left border, number room on the
bottom/right). The drawstate SHALL diff a packed `Int32Array` per tile
(square value plus every error, cursor, flash, and mistake overlay bit) and a
separate per-number diff array, so every overlay is in the diff key.

#### Scenario: A mistake overlay repaints an unchanged tile

- **WHEN** a tile is painted, `findMistakes` flags it, and `redraw` runs
  again with no square-value change
- **THEN** the second paint renders the mistake overlay

#### Scenario: Edge numbers render red on error

- **WHEN** a row's tent count exceeds its edge clue
- **THEN** that row's number is drawn in the error color

### Requirement: Tents' solver is a certified deduction ladder

Tents' solver SHALL run its deductions as a `runDeductionFixpoint` ladder of seven
rungs: the tent↔tree link, beneath Easy so the generator's links-only cap runs it
alone; the two grass rules, a tree's single candidate and the per-line count at
Easy; and at Tricky the tree diagonal-pair elimination and the line count's reading
of the two lines alongside, each a rung of its own that writes only what its Tricky
half deduces. A firing census SHALL walk generated boards covering the preset sizes
at both tiers and a non-square board, at every cap the generator uses, and assert
that every rung fires on the corpus. The hand-written loop the ladder replaced
SHALL NOT be kept once the adoption is proved; git holds it.

#### Scenario: A Tricky rung nothing depends on is still certified

- **WHEN** the tree diagonal-pair rung is silenced
- **THEN** the census reports it as never fired, even though the frozen
  differential still passes, because other rungs reach its conclusions on nearly
  every board

#### Scenario: A mis-tiered Tricky rung fails

- **WHEN** either Tricky rung is declared at Easy
- **THEN** the generator's gate accepts different boards, and the frozen
  differential fails

### Requirement: Tents has a link notation

The state SHALL record, per square, the tree or tent it is joined to, only
ever between a tent and an orthogonally adjacent tree and always at both ends.
A link move SHALL set rather than toggle. A square that stops being a tent
SHALL let go of its tree, and a solve SHALL clear every link. The win condition
SHALL NOT read links. `redraw` SHALL draw a link as a thin ink line across the
shared grid line, in a shape and color distinct from a tree's trunk.

#### Scenario: Removing a tent parts its link

- **WHEN** a joined tent is cleared or marked as grass
- **THEN** neither it nor its tree is joined to anything

### Requirement: Tents explains the next deduction

The game SHALL implement `hint` as a recording projection of its own solver
rungs, one premise per step: grass beside no tree, grass beside trees that all
have their tents, grass round a tent, a tree's one open square, the square
between a tree's two diagonal candidates, a row or column's count over its own
squares (met, or with no spare room), and over the lines beside it. Every fact
a step rests on SHALL be a tent, grass, a tree, a clue or a link the player can
see: before each firing the links SHALL be re-read as the ones drawn, plus a
tent's tree when it is the only tree beside the tent not drawn to another, or a
tree's tent when it is the tree's only square that is blank or an undrawn tent.
A pairing the rungs need beyond that SHALL be a step that draws the link, taken
only when some stalled rung fires once it is drawn, the square-placing rungs
before the line counts. A tree's single open square SHALL be one step placing
the tent joined to that tree. Each step SHALL name why it is forced, in one
sentence of at most 120 characters, ring what it decides, outline what it
reasons from, hatch the row or column it counts with, color that clue in the
action color, and draw a link it asks for in the action color. The hint SHALL
refuse on a solved board and while `findMistakes` reports anything.
`hintKeepTrack` SHALL judge a move by the squares and links it changes, holding
a step that is only partly made and shrinking it to what is left.

#### Scenario: Following the hint finishes a board

- **WHEN** a generated board at either tier is played by following the hint's
  steps
- **THEN** the board is completed, and after every step `findMistakes` reports
  nothing

#### Scenario: A step rests on nothing the player cannot see

- **WHEN** any firing of the hint's recording pass is taken
- **THEN** the board it reasons from is the player's board with its links read
  as drawn plus those readable at a glance

#### Scenario: A link is drawn only for a step that needs it

- **WHEN** a step draws only a link
- **THEN** the next firing could not have fired on the board before it

#### Scenario: Placing a tree's tent by a click is progress

- **WHEN** the displayed step places a tent joined to a tree and the player
  places that tent by a click
- **THEN** the step stays displayed and asks only for the link

### Requirement: Tents draws its squares on the collection's quiet surface

`redraw` SHALL draw a square the player has not decided as the collection's
cell surface, with the collection's surface grid line between squares and
round the grid. A square that is grass, a tree or a tent SHALL keep its grass
fill, so an undecided square and a grass one differ in hue and not by a step of
gray, in both schemes. The trees and the tents keep their shapes and colors.
The clues, a link between a tent and its tree, the keyboard cursor and the
edge of an error diamond SHALL be drawn in ink, not in the grid's color.

#### Scenario: Undecided and grass are told apart by hue

- **WHEN** a board holds an undecided square beside one marked as grass
- **THEN** the first is the cell surface and the second the grass fill

#### Scenario: A link is ink on a quiet grid

- **WHEN** a tent is linked to its tree
- **THEN** the link is drawn in ink
- **AND** the grid line it crosses is the surface's grid line
