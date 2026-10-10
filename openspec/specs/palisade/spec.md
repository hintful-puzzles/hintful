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

Params SHALL be `w`, `h`, `k` (the region size) and a difficulty, Easy or
Unreasonable. They SHALL encode as `{w}x{h}n{k}`, and the difficulty in the
full form only, as `de` or `du`. A bare number SHALL decode as a square grid
whose region size is its width, and a string with no difficulty letter as
Easy.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 8, h: 6, k: 6 }` are encoded
- **THEN** the result is `8x6n6`
- **AND** decoding `8x6n6` round-trips the params
- **AND** decoding a bare `5` yields `{ w: 5, h: 5, k: 5 }`

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 8×6 board in regions of 6 is encoded
- **THEN** the full encoding is `8x6n6du` and the shared one `8x6n6`
- **AND** `8x6n6`, written before the game had tiers, decodes as Easy

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

At Easy `newDesc` SHALL emit only a board the deductive solver solves from
its clues alone, so the board has one division and needs no guess. It SHALL
strip clues, keeping a clue removed only while the solver still solves the
board.

#### Scenario: Generated boards are solvable

- **WHEN** `newDesc` produces an Easy board for each preset across several
  seeds
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

`findMistakes(state)` SHALL take the board's one division from the search
that counts its answers, at either difficulty, and flag every edge where the
player has drawn a wall the solution lacks or set a no-wall mark where the
solution has a wall. Where the search did not prove exactly one division it
SHALL return an empty result, never a false positive. `redraw` SHALL redden
each flagged edge.

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

`hint(state)` SHALL start the solver from the player's current state: the
player's walls as walls already drawn, and every edge the player has marked
"no wall" as a join already made. It SHALL then run the six deductions to a
fixpoint.

#### Scenario: A player no-wall mark is not re-hinted

- **WHEN** the player has marked an edge "no wall" that the solver would also
  deduce as no-wall
- **THEN** that edge does not appear as a step in the returned plan, since its
  fact is part of what the solver starts from

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

### Requirement: Palisade's clue layer stays its own

Palisade's clue semantics (each cell's count of adjacent walls), its solver,
its generator, its difficulty grading and its clue rendering SHALL remain
entirely its own: the digit, the clue-satisfaction test that decides when a
region is finished, and the explained hint's sentences.

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

### Requirement: Palisade counts a clue set's answers by a bounded search

The game SHALL count a clue set's divisions up to two by trial and error over
the solver, assuming an undecided edge a wall and then not where the solver
stops. It SHALL report one answer, several, none, or that it stopped at its
budget, which SHALL be counted in positions and never in time. Solve SHALL
take the answer from it at either difficulty.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 5×5 board the solver finishes, on one with
  one division that it does not reach, on one with no clue and on one whose
  only clue is a 4
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with clues taken away and
  the same with one clue changed are each counted by laying whole regions
  down one at a time
- **THEN** the search reports one answer exactly where one division fits,
  several where more do and none where none does

### Requirement: Palisade's solver run says when a position is impossible

After the deductions stop, a position SHALL be reported contradictory where
a region is past its size, a wall lies inside a region, a clue has more walls
than its number or too few edges left to reach it, or a region short of its
size has no undecided edge to grow through. It SHALL be reported solved once
the walls are a whole division that meets every clue.

#### Scenario: Each kind of impossible position is told at once

- **WHEN** four boards, one for each kind, are searched with exactly the
  positions each needs, and with one fewer
- **THEN** each has one answer with them and is out of reach with one fewer

### Requirement: An Unreasonable Palisade board has one answer that the solver does not reach

At Unreasonable the generator SHALL take an Easy board and strip further
clues, each only while the search still proves one division within a budget
of its own, well under the search's, and SHALL keep the board only when the
solver stops short on it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 3×2 to 6×6
- **THEN** the solver leaves each unfinished
- **AND** exactly one division fits each, by a count that has no search in it

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 3×2 board in threes, 2×4 in fours, 3×3 in threes
  and 12×15 in tens is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Palisade refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide or high, and one in regions of one. Such a board
divides one way whatever its clues, and the solver finds that way with none.

#### Scenario: A strip is not dealt at Unreasonable

- **WHEN** a 1×4 board in twos, a 6×1 board in threes and a 3×4 board in
  ones are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** the same params with a description supplied are accepted

#### Scenario: The solver finishes such a board with no clue

- **WHEN** the solver runs on a strip or a board in regions of one that has
  no clue at all
- **THEN** it finishes it, and the board divides exactly one way

### Requirement: Unreasonable is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 180 squares, with a reason naming the difficulty. The same
size SHALL still be asked for at Easy.

#### Scenario: A size past the bound is refused at Unreasonable only

- **WHEN** a 14×13 board in sevens is checked for dealing at each difficulty
- **THEN** it is refused at Unreasonable and not at Easy
- **AND** a 12×15 board in tens and a 9×20 board in sixes are admitted at
  Unreasonable

### Requirement: Palisade's menu offers each board at both difficulties

Palisade's presets SHALL offer each of its four boards, 5×5 in fives, 6×8 in
sixes, 8×10 in eights and 12×15 in tens, as Easy and as Unreasonable, and the
default SHALL be the Easy 5×5.

#### Scenario: Every board is offered at both difficulties

- **WHEN** Palisade's preset menu is read
- **THEN** its four boards each appear as Easy and then as Unreasonable

### Requirement: A pasted Palisade board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one division that
they do not reach, whatever lower difficulty its ID states. A board with
several divisions SHALL be refused as having more than one solution, and a
board with none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one division the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5n5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 5×5 board with no clue, and one whose only clue is a 4, are
  entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Palisade's hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the edges its deductions force from the player's walls and marks and no
others, and where none is forced it SHALL refuse with the collection's
sentence that deduction has run out. It SHALL go on from the edges the player
then decides.

#### Scenario: The hint stops, and goes on from an edge tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** an edge decided wrongly there is reported by the mistake check
- **AND** with an edge decided as the solution has it wherever the hint
  stops, the hint finishes the board
