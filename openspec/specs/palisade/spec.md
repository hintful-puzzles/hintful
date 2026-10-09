# palisade Specification

## Purpose
Palisade, the puzzle of dividing a grid along its edges into connected regions
of one given size `k`, each numbered square having that many of its edges
walled. This capability specifies what is the game's own: its params and
description encodings, its three-valued shared edges and how the buttons set
them, what counts as solved and as a mistake, what the generator promises, how
the board looks, and the deduction hint that sets this collection's bar for
what an explained hint is. What every game does the same way (Solve, the win
flash, the mistake overlay, the midend's hint refusals) is the engine
capabilities' to state.

## Requirements

### Requirement: Palisade's parameters are a size and a region size

Params SHALL be `w`, `h` and `k` (the region size), encoded `{w}x{h}n{k}`. A
bare number SHALL decode as a square grid whose region size is its width.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 8, h: 6, k: 6 }` are encoded
- **THEN** the result is `8x6n6`
- **AND** decoding `8x6n6` round-trips the params
- **AND** decoding a bare `5` yields `{ w: 5, h: 5, k: 5 }`

### Requirement: Palisade refuses a region size the grid cannot be divided by

The bounds the params declare SHALL refuse a `w`, an `h` or a `k` below 1.
`validateParams` SHALL refuse a `k` that does not divide `w·h`. Under full
validation it SHALL also refuse `k = w·h`, and `k = 2` unless `w` or `h` is 1.

#### Scenario: Invalid params are rejected

- **WHEN** params are fully validated with `k` not dividing `w·h`, or
  `k = w·h`, or `k = 2` on a board wider and taller than 1
- **THEN** the result is a non-null error string

#### Scenario: A region size of zero is refused by its bound

- **WHEN** params `{ w: 5, h: 5, k: 0 }` are validated
- **THEN** the refusal is "Region size must be at least 1."

### Requirement: Palisade descriptions are run-length clue grids

The desc SHALL encode the clue grid in scan order: a digit `0`–`4` for each
clue and a letter `a`–`z` for each run of 1–26 clueless cells. Validating a
desc SHALL reject a digit above `4`, any other character that is neither a clue
nor a run letter, and a desc describing more than `w·h` squares.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded from the
  resulting clue board
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc containing a `5` or another invalid character, or describing
  more than `w·h` squares, is validated
- **THEN** the result is a non-null error string

### Requirement: A new Palisade board holds its clues and only the rim walls

`newState` SHALL build a board holding the desc's clues, with the grid-rim
walls set and all interior edges unknown.

#### Scenario: A fresh board has no interior wall

- **WHEN** `newState` builds a board from a valid desc
- **THEN** every edge on the grid's rim is a wall
- **AND** every edge between two cells is unknown

### Requirement: Palisade generates uniquely solvable boards

`newDesc` SHALL emit only a board the deductive solver solves from its clues
alone, so every board has one division and needs no guess. It SHALL then strip
clues, keeping a clue removed only while the solver still solves the board.

#### Scenario: Generated boards are solvable

- **WHEN** `newDesc` produces a board for each preset across several seeds
- **THEN** the deductive solver solves each board to a valid division (every
  region size `k`, every clue satisfied, no stray walls)

### Requirement: Palisade edges are three-valued and shared between cells

Each edge SHALL be wall, no-wall-mark, or unknown, stored as one byte per cell:
the low nibble the walls U/R/D/L, the high nibble the no-wall marks. A wall or
mark SHALL be recorded on both cells sharing the edge, so every edit
`interpretMove` emits is two-sided.

#### Scenario: A wall toggle records both sides

- **WHEN** the player toggles a wall on the right edge of an interior cell `i`
- **THEN** `executeMove` sets the right-wall bit of `i` and the left-wall bit
  of the cell to its right

### Requirement: Each button toggles the nearest edge toward its own state

`interpretMove` SHALL map a left-click to toggle the edge nearest the pointer
between wall and unknown, and a right-click to toggle it between no-wall-mark
and unknown. An edge holding the other button's state SHALL go straight to the
pressed button's state. `interpretMove` SHALL support the half-grid keyboard
cursor: it moves by half a cell, and select toggles the edge it rests on.

#### Scenario: A second left-click returns the edge to unknown

- **WHEN** the player left-clicks an unknown interior edge twice
- **THEN** the first click makes it a wall and the second returns it to unknown

#### Scenario: A left-click on a no-wall mark makes a wall

- **WHEN** the player left-clicks an edge carrying a no-wall mark
- **THEN** the edge becomes a wall and the mark is cleared, on both cells

### Requirement: The grid rim cannot be edited

`executeMove` SHALL reject any edit toggling a wall that points off the grid.

#### Scenario: The grid rim cannot be toggled

- **WHEN** a move would toggle a wall pointing off the grid
- **THEN** `executeMove` throws (the move is rejected)

### Requirement: Palisade detects completion and the unique-division solve

`isSolved` SHALL report a state solved iff the walls divide the grid into
connected components every of size `k`, every clue equals its cell's wall
count, and no wall lies within a single component (no stray border).

#### Scenario: A correct division is complete

- **WHEN** the walls divide the grid into size-`k` regions matching all clues
  with no stray walls
- **THEN** `isSolved` returns true and `status` reports a win

#### Scenario: A stray wall keeps the board unsolved

- **WHEN** a correct division also carries a wall between two cells of one
  region
- **THEN** `isSolved` returns false

### Requirement: Palisade reddens what the board already contradicts

`redraw` SHALL redden, from the current borders: an edge beside a group
of cells joined by no-wall marks that is larger than `k`, a wall beside a
wall-bounded region smaller than `k`, and a wall dangling within a single
region. It SHALL redden a clue whose wall count is already impossible: more
walls than the clue, or too few edges free of a no-wall mark to reach it.

#### Scenario: An over-large region reddens its edges

- **WHEN** the player's no-wall marks join more than `k` cells
- **THEN** `redraw` emits the edges between that group and its neighbors in
  the error color

#### Scenario: An undersized region reddens its walls

- **WHEN** the player's walls enclose a region smaller than `k`
- **THEN** `redraw` emits the walls between that region and its neighbors in
  the error color

### Requirement: Palisade checks mistakes against the unique solution

`findMistakes(state)` SHALL re-solve the clue set from the bare grid rim with
the deductive solver and, on a unique solution, flag every edge where the
player has drawn a wall the solution lacks or set a no-wall mark where the
solution has a wall. When the clue set is not uniquely solvable, it SHALL
return an empty result, never a false positive. `redraw` SHALL redden each
flagged edge.

#### Scenario: A wrong wall is flagged

- **WHEN** the player draws a wall that the unique solution does not contain
- **THEN** `findMistakes` includes that edge
- **AND** `redraw`, given that mistake, draws the edge in the error color

#### Scenario: A correct partial board is clean

- **WHEN** every wall the player has drawn agrees with the unique solution
- **THEN** `findMistakes` returns an empty result

### Requirement: Palisade offers a deduction-based hint

The `palisade` game SHALL implement `Game.hint()` and `Game.hintKeepTrack()`,
surfacing its deductive solver as a narrated, highlighted hint plan.
`hint(state)` SHALL return the full chain of forced edges as the plan, in
discovery order, so a single request shows the next deduction with all its
legs and auto-hint can play the whole chain. Each leg's move SHALL be the
two-sided `edges` edit that sets its edge to the forced state.

#### Scenario: Next deduction is surfaced and solves the board

- **WHEN** `hint()` is called on a fresh, uniquely-solvable Palisade board
- **THEN** it returns a non-empty plan whose steps are forced edges in
  discovery order
- **AND** applying every step's move in order brings the board to a solved state

### Requirement: The hint is seeded from the player's own walls and marks

`hint(state)` SHALL seed the solver from the player's current state: the
player's walls copied into the solver's borders, and every player no-wall mark
(`DISABLED` bit) pre-merged into the solver's DSF. It SHALL then run the six
deductions to a fixpoint. Seeding the hint from the player's state SHALL NOT
mutate that state.

#### Scenario: A player no-wall mark is not re-hinted

- **WHEN** the player has marked an edge "no wall" that the solver would also
  deduce as no-wall
- **THEN** that edge does not appear as a step in the returned plan (its fact is
  already seeded into the solver's DSF)

### Requirement: The hint records every edge the deductions force

The hint SHALL record, in discovery order, a wall for each wall the deductions
newly set, and a no-wall for each join an individual edge is forced into: a
clue whose walls are all placed, two edges to one region the clue cannot afford
as walls, or an under-sized region whose single growth target is reached by
exactly one undecided edge. Each recorded edge SHALL carry the firing, the
single logical deduction, that produced it.

#### Scenario: A satisfied clue opens its remaining edges in one firing

- **WHEN** a clue has all its walls placed and two of its edges undecided,
  leading into different regions
- **THEN** both edges are recorded as no-wall, carrying the same firing

### Requirement: The solver concludes the same with or without the hint's recorder

Running the solver without a recorder SHALL reach exactly what it reaches with
one: the `solve`, `findMistakes` and generator paths SHALL be unaffected by the
hint's recording.

#### Scenario: Solving records nothing

- **WHEN** `solve`, `findMistakes` or the generator runs the solver
- **THEN** no forced edge is recorded, and the walls it reaches are the
  solver's own

### Requirement: A hint sentence is advice that has not been applied

Each leg's explanation SHALL name the rule that fired, phrased as advice that
has not yet been applied: "must be a wall" or "can't be a wall", never "is a
wall" or "has none".

#### Scenario: A region that would grow too large

- **WHEN** a leg walls the edge between two regions that together exceed `k`
- **THEN** its sentence ends "so this edge must be a wall."

### Requirement: A multi-edge firing says why its edges are forced together

For a multi-edge firing the first leg SHALL state why the moves are forced
together. For `equivalentEdges`: the two highlighted edges border the same
region and therefore share a fate (both walls or both open), which together
with the clue's count forces the result. For `numberExhausted`: the clue's
count leaves its remaining edges a single possible state. The first leg SHALL phrase
the conclusion across the set ("draw them all", "both must be walls").

#### Scenario: The coupled pair's first leg states the shared fate

- **WHEN** the next deduction is an `equivalentEdges` firing of two edges
- **THEN** the first leg's explanation states that the two edges share a fate
  (both walls or both open) and names the clue that decides them
- **AND** the plan holds both edges as one journey, the second leg flagged
  `continuesPrevious`

### Requirement: Each hint leg marks every element its sentence references

Each leg's highlights SHALL identify every element it references: the edge the
leg sets, the firing's other edges not yet set as sibling edges, and the
referenced cells: a clue pair, the clue cell, the four squares at a corner, or
the region the deduction reasons about.

#### Scenario: The coupled pair's first leg marks its sibling and its region

- **WHEN** the first leg of an `equivalentEdges` firing is displayed
- **THEN** its marks include the other edge as a sibling and the shared region
  as referenced cells

### Requirement: The hint refuses when the deductions force no edge

When the deductions force no edge, as on a clue set that is not uniquely
solvable, `hint()` SHALL return an error rather than a plan.

#### Scenario: A board the deductions cannot advance gets no plan

- **WHEN** `hint()` is asked about a clue set from which no edge is forced
- **THEN** it returns an error and no plan is shown

### Requirement: Making the hinted edit completes the step

`hintKeepTrack(move, step, state)` SHALL return `"completed"` when the player's
`edges` move toggles the step's hinted edge into its forced state, and `"off"`
otherwise. The verdict is side- and button-checked: a wrong-button click on the
same edge SHALL NOT complete the step.

#### Scenario: Following the hinted edit advances the plan

- **WHEN** a hint step is displayed and the player makes the exact hinted edge
  edit
- **THEN** `hintKeepTrack` returns `"completed"`
- **AND** a wrong-button click on the same edge, or an edit on a different edge,
  returns `"off"`

### Requirement: The hint paints a firing's edges as one set

The renderer SHALL paint every edge of the current step's firing that is not
yet set, the leg's own edge and the firing's others alike, in `COL_HINT`: they
share a fate (all walls or all open), so they share a color, signaling the
player to treat them as one set.

#### Scenario: The hint highlights a firing's edges as one set

- **WHEN** `redraw` is given a displayed multi-edge firing step (the leg's
  edge, the firing's other forced edge, and referenced cells)
- **THEN** both forced edges are painted in `COL_HINT` (the same color, since
  they share a fate)
- **AND** with no hint step the tiles draw without any hint color

### Requirement: The hint marks the cells it reasons from inside the cell body

The renderer SHALL outline in `COL_HINT_CELL` every cell the step's sentence
reasons from, and SHALL hatch in `COL_HINT` the one region the sentence is
about. Both SHALL sit inside the cell body, because the cell's border is where
walls and the hint's forced edges are drawn. For the `equivalentEdges`
deduction the marked cells SHALL be the region the edges border, not the clue
cell that decides the edges.

#### Scenario: Two regions a join would merge are outlined

- **WHEN** a `notTooBig` step is displayed
- **THEN** every cell of the two regions is outlined in `COL_HINT_CELL`, a
  different color from the forced edge's `COL_HINT`

#### Scenario: The one region a sentence is about is hatched

- **WHEN** a `notTooSmall` or `equivalentEdges` step is displayed
- **THEN** every cell of the region it names is hatched, and for
  `equivalentEdges` the clue cell is neither hatched nor outlined

### Requirement: Palisade shades completed correct regions

The render SHALL fill a wall-bounded region with the shared finished-region
role (`REGION_DONE`, a wash of the theme pair's first hue) once it is a
completed, correct region: exactly `k` cells, every clue in it equal to its
wall count, and no wall interior to it. The untouched board (one undivided
region) SHALL NOT be filled. The fill is a local check on the region as drawn,
not a check against the unique solution.

#### Scenario: The solved board shades every region, the untouched board none

- **WHEN** the board carries the unique solution's walls
- **THEN** every region renders with the `COL_CORRECT` background
- **AND** the untouched board (no interior walls) renders none

#### Scenario: Breaking a finished region clears its fill

- **WHEN** the player adds a wall inside a filled region
- **THEN** the next `redraw` draws that region's cells without the fill

### Requirement: Palisade shares its border-marking mechanic rather than owning a copy

Palisade SHALL take the grid-edge marking mechanic it shares with Separate
from the shared engine modules and own no copy of it: the edge bits and
direction tables, the nearest-edge hit test, the three-state toggle, the paired
edit of an edge's two cells, the half-cell cursor, and its look: the geometry,
the edge rects, the tile skeleton and the live error model. A change to what
counts as a wrong wall SHALL take effect in both games at once.

#### Scenario: A fix to the shared mechanic reaches both games

- **WHEN** a defect is found in the edge hit test, the three-state toggle or
  the test for a wall that separates nothing
- **THEN** it is fixed once in the shared module
- **AND** both Palisade and Separate receive the fix, rather than one game
  silently retaining the defect

### Requirement: Palisade's clue layer stays its own

Palisade's clue semantics (each cell's count of adjacent walls), its solver,
its generator, its difficulty grading and its clue rendering SHALL remain
entirely its own: the digit, the clue-satisfaction test that decides when a
region is finished, and the explained hint's sentences. The shared renderer
SHALL take Palisade's palette indices and a callback for the middle of a tile,
and SHALL NOT branch on which game is drawing.

#### Scenario: The explained hint survives the shared renderer

- **WHEN** a hint step is displayed
- **THEN** the edges it forces paint in the hint color, over their normal
  three-valued states
- **AND** the cells it references are marked inside the cell body
- **AND** its narration is Palisade's own

### Requirement: Palisade draws its cells on the collection's quiet surface

`redraw` SHALL draw every cell's body on the collection's cell surface. A cell
that holds a clue SHALL sit on the lifted surface of a given, so the clues the
puzzle fixed are told by the cell under them, with the digit in ink. The edges
SHALL keep their own roles and strengths, since they are what the player
draws: a wall in ink, an edge ruled out and an edge undecided each in its own
color.

#### Scenario: A clue is told by the cell under it

- **WHEN** an untouched board is drawn
- **THEN** every cell holding a clue is the lifted surface
- **AND** every other cell is the plain cell surface

#### Scenario: The edges keep their three colors

- **WHEN** a board holds a wall, an edge ruled out and an edge undecided
- **THEN** each is drawn in its own color

### Requirement: A finished region and the solved flash cover the clue cells

A completed correct region SHALL fill whole, its clue cells included, with the
shared finished-region role. The solved flash SHALL lift every cell to the
given's surface on its lit beats, a step that reads in both schemes.

#### Scenario: A clue cell in a finished region takes the region's fill

- **WHEN** a region holding a clue is completed correctly
- **THEN** the clue's cell is drawn in the finished-region fill, not on the
  lifted surface
