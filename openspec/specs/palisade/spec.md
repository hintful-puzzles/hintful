# palisade Specification

## Purpose
Palisade, the puzzle of dividing a grid along its edges into connected regions
of one given size `k`, each numbered square having that many of its edges
walled. This capability specifies what is the game's own: what its params
refuse and what a short params string means, its description encoding, what
counts as solved and as a mistake, what the generator promises, what the
search that counts a board's answers assumes, how a clue and a finished region
look, and the deduction hint that sets this collection's bar for what an
explained hint is. How an edge is stored, what the buttons, the drag and the
cursor do to it, which edges redden and how a hint's marks are drawn are
`border-grid`'s to state, and what every game does the same way (Solve,
the win flash, the mistake overlay, the midend's hint refusals) the other
engine capabilities'.

## Requirements

### Requirement: Rules: A new Palisade board holds its clues and only the rim walls

`newState` SHALL build a board holding the desc's clues, with the grid-rim
walls set and all interior edges unknown.

#### Scenario: A fresh board has no interior wall

- **WHEN** `newState` builds a board from a valid desc
- **THEN** every edge on the grid's rim is a wall
- **AND** every edge between two cells is unknown

### Requirement: Rules: The grid rim cannot be edited

`executeMove` SHALL reject any edit toggling a wall that points off the grid.

#### Scenario: The grid rim cannot be toggled

- **WHEN** a move would toggle a wall pointing off the grid
- **THEN** `executeMove` throws (the move is rejected)

### Requirement: Rules: A Palisade board is solved when its walls are a whole division that meets every clue

`status` SHALL report a board solved iff the walls divide the grid into
connected components every of size `k`, every clue equals its cell's wall
count, and no wall lies within a single component (no stray border).

#### Scenario: A correct division is complete

- **WHEN** the walls divide the grid into size-`k` regions matching all clues
  with no stray walls
- **THEN** `status` reports a win

#### Scenario: A stray wall keeps the board unsolved

- **WHEN** a correct division also carries a wall between two cells of one
  region
- **THEN** `status` does not report a win

### Requirement: Rules: Palisade reddens a clue that is already impossible

`redraw` SHALL redden a clue whose wall count is already impossible: more
walls than the clue, or too few edges free of a no-wall mark to reach it.

#### Scenario: A clue with too many walls, and one that cannot reach its number

- **WHEN** a clue of 1 has two walls on its edges, and a clue of 3 has two of
  its edges marked "no wall"
- **THEN** `redraw` draws each clue's digit in the error color

### Requirement: Rules: Palisade checks mistakes against the unique solution

`findMistakes(state)` SHALL flag every edge where the player has drawn a wall
the board's one division lacks or set a no-wall mark where that division has
a wall.

#### Scenario: A wrong wall is flagged

- **WHEN** the player draws a wall that the unique solution does not contain
- **THEN** `findMistakes` includes that edge

#### Scenario: A correct partial board is clean

- **WHEN** every wall the player has drawn agrees with the unique solution
- **THEN** `findMistakes` returns an empty result

### Requirement: Params: A Palisade params string may leave out its region size and its difficulty

Palisade's params, their bounds and their encoding SHALL be those its
`paramConfig` and its declared codec give (`engine-params`, "A game declares
its params encoding once, and both codec halves are derived"), and its menu
what `presets` builds. A params string that gives no region size SHALL decode
with the region size `k` equal to the width, so a bare number is a square grid
in regions of its width, and a string with no difficulty letter SHALL decode
as Easy.

#### Scenario: A string that leaves a field out

- **WHEN** a bare `5` is decoded
- **THEN** it yields `{ w: 5, h: 5, k: 5 }`
- **AND** `8x6n6`, written before the game had tiers, decodes as Easy

### Requirement: Params: Palisade refuses a region size the grid cannot be divided by

`validateParams` SHALL refuse a `k` that does not divide `w·h`, and a grid of
2³¹ squares or more as too large. Under full validation it SHALL also refuse
`k = w·h`, and `k = 2` unless `w` or `h` is 1. It SHALL refuse no smaller size
for the time its deal takes, at either difficulty: a player can stop a deal.

#### Scenario: Invalid params are rejected

- **WHEN** params are fully validated with `k` not dividing `w·h`, or
  `k = w·h`, or `k = 2` on a board wider and taller than 1
- **THEN** the result is a non-null error string

#### Scenario: A large board and one in many regions are asked for

- **WHEN** a 14×13 board in sevens, a 30×30 board in threes and a 40×60 board
  in twenties are checked for dealing at Easy and at Unreasonable
- **THEN** none is refused

### Requirement: Params: Palisade refuses Unreasonable where no board needs it

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

### Requirement: Description: Palisade descriptions are run-length clue grids

The desc SHALL be the clue grid in scan order, in the engine's run-letter
grammar (`engine-params`, "The engine provides the run-letter description
grammar"): a digit `0`–`4` for each clue, and the grammar's letters for the
clueless cells. Validating a desc SHALL reject a digit above `4`, any other
character that is neither a clue nor a run letter, and a desc describing more
than `w·h` squares. One describing fewer SHALL load with the rest clueless:
the writer ends a desc at its last clue.

#### Scenario: A description that stops short of the last square

- **WHEN** `a2a1a2b2e1e33`, which describes 22 squares, is read for a 5×5 board
- **THEN** it loads, and the last three squares hold no clue

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded from the
  resulting clue board
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc containing a `5` or another invalid character, or describing
  more than `w·h` squares, is validated
- **THEN** the result is a non-null error string

### Requirement: Generation: Palisade generates uniquely solvable boards

At Easy `newDesc` SHALL emit only a board the deductive solver solves from
its clues alone, so the board has one division and needs no guess. It SHALL
strip clues, keeping a clue removed only while the solver still solves the
board. It SHALL deal a board at every size `validateParams` admits, at both
difficulties: a division the solver cannot solve from all of its clues is
divided again where it stalls, and is not thrown away.

#### Scenario: Generated boards are solvable

- **WHEN** `newDesc` produces an Easy board for each preset across several
  seeds
- **THEN** the deductive solver solves each board to a valid division (every
  region size `k`, every clue satisfied, no stray walls)

#### Scenario: Boards in many small regions are dealt

- **WHEN** a 9×9 board in threes is dealt at Easy and at Unreasonable, and a
  12×12 board in fours at Easy
- **THEN** each is dealt, and the lowest difficulty that solves it is the one
  asked for

#### Scenario: No board of a size that stalls often is given up on

- **WHEN** a hundred Easy 6×6 boards in threes are dealt
- **THEN** every one is dealt, and the solver solves it

### Requirement: Generation: An Unreasonable Palisade board has one answer that the solver does not reach

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

### Requirement: Generation: A Palisade board is Easy where the solver and the hint both finish it

A board SHALL count as Easy where the solver and the hint finish it, and as
Unreasonable where it has exactly one division that they do not reach.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one division the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5n5du`

### Requirement: Solver: Palisade counts a clue set's answers by a bounded search

Where the solver stops, the search that counts a clue set's divisions SHALL
assume an undecided edge a wall and then not.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 5×5 board the solver finishes, on one with
  one division that it does not reach, on one with no clue and on one whose
  only clue is a 4
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with clues taken away and
  the same with one clue changed are each counted by laying whole regions
  down one at a time
- **THEN** the search reports one answer exactly where one division fits,
  several where more do and none where none does

### Requirement: Solver: Palisade's solver run says when a position is impossible

After the deductions stop, a position SHALL be reported contradictory where
a region is past its size, a wall lies inside a region, a clue has more walls
than its number or too few edges left to reach it, or a region short of its
size has no undecided edge to grow through. It SHALL be reported solved once
the walls are a whole division that meets every clue.

#### Scenario: Each kind of impossible position is told at once

- **WHEN** four boards, one for each kind, are searched with exactly the
  positions each needs, and with one fewer
- **THEN** each has one answer with them and is out of reach with one fewer

### Requirement: Controls: Palisade takes its buttons, drag and cursor from the border grid

Palisade's `targetVerbs` SHALL be `borderGridVerbs`, whose edits it wraps in
its `edges` move, and `interpretMove` SHALL add no input of its own. What the
buttons, a drag and the keys do is `border-grid`'s: "Each button cycles an
edge between its own state and undecided", "A press addresses the nearest
interior edge", "A drag along a line of edges repeats the press" and "The
keyboard cursor moves by half a cell". Palisade SHALL depart from none.

#### Scenario: A second left-click returns the edge to unknown

- **WHEN** the player left-clicks an unknown interior edge twice
- **THEN** the first click makes it a wall and the second returns it to unknown

### Requirement: Hint: The plan is every edge the deductions force from the player's walls and marks

`hint(state)` SHALL start the solver from the player's current state: the
player's walls as walls already drawn, and every edge the player has marked
"no wall" as a join already made. Its plan SHALL be the full chain of edges
the deductions then force, in discovery order, so a single request shows the
next deduction with all its legs and auto-hint can play the whole chain.

#### Scenario: A player no-wall mark is not re-hinted

- **WHEN** the player has marked an edge "no wall" that the solver would also
  deduce as no-wall
- **THEN** that edge does not appear as a step in the returned plan, since its
  fact is part of what the solver starts from

#### Scenario: The hint goes on from an edge decided rightly

- **WHEN** the hint is followed on an Unreasonable board, and an edge is
  decided as the solution has it wherever the hint stops
- **THEN** the hint finishes the board

### Requirement: Hint: A hint sentence is advice that has not been applied

Each leg's explanation SHALL name the rule that fired, phrased as advice that
has not yet been applied: "must be a wall" or "can't be a wall", never "is a
wall" or "has none".

#### Scenario: A region that would grow too large

- **WHEN** a leg walls the edge between two regions that together exceed `k`
- **THEN** its sentence ends "so this edge must be a wall."

### Requirement: Hint: A multi-edge firing says why its edges are forced together

For a multi-edge firing the first leg SHALL state why the moves are forced
together. For `equivalentEdges`: the two highlighted edges border the same
region and therefore share a fate, which together with the clue's count forces
the result. For `numberExhausted`: the clue's count leaves its remaining edges
a single possible state. The first leg SHALL phrase the conclusion across the
set ("draw them all", "both must be walls").

#### Scenario: The coupled pair's first leg states the shared fate

- **WHEN** the next deduction is an `equivalentEdges` firing of two edges
- **THEN** the first leg's explanation states that the two edges share a fate
  and names the clue that decides them

### Requirement: Hint: Palisade's marks and its keep-track verdict are the border grid's

A step's marks SHALL be the roles `hintMarks` declares: a ring along every
edge its firing has yet to set, and an outline and stripes inside the cell
body, all drawn by the layer of `border-grid`, "Border-grid games share the
hint's notation layer". `hintKeepTrack` SHALL hand an `edges` move's edits to
`borderHintKeepTrack`, whose verdict is `border-grid`, "A hinted edge's step
is completed by the edit that sets it". Palisade SHALL depart from neither.

#### Scenario: Two regions a join would merge are outlined

- **WHEN** a `notTooBig` step is displayed
- **THEN** every cell of the two regions is outlined in `COL_HINT_CELL`, a
  different color from the forced edge's `COL_HINT`

### Requirement: Hint: Two Palisade clues side by side are walled apart where their region would be the wrong size

The edge between two neighboring clues SHALL be a wall where 8 less the two
clues is more than the region size, or where both are 3 and the region size
is not 2. With that edge open each clue's walls go on its other three sides,
so their region holds at least that many squares, and two 3s' exactly two.
The step SHALL outline both clues, ring the edge, and say the size the shared
region would need, or of two 3s that it would be exactly 2 cells.

#### Scenario: Two 3s in regions of five

- **WHEN** the hint is asked on the 5×5 board `a2a1a2b2e1e33`, in regions of
  5, whose bottom row begins with two 3s
- **THEN** its first step says "Two 3s each keep just one side open, and it
  has to be the one they share, so their region would be exactly 2 cells.
  Regions here hold 5, so the edge between them must be a wall."

### Requirement: Hint: A Palisade clue that is full, or needs every edge left, settles its edges

A clue with as many walls as its number SHALL make each of its undecided
edges open. A clue whose number is 4 less its open edges SHALL make each of
its undecided edges a wall. Either SHALL be one firing over all those edges.
The step SHALL outline the clue and ring the edges, and SHALL say of a 0 that
it allows no walls.

#### Scenario: A clue with all its walls

- **WHEN** the hint is asked on the 5×5 board `23d2e2c2e232`
- **THEN** its first step says "Clue 2 already has all its walls, so its
  remaining edges can't be walls.", and its next leg clears the clue's other
  edge

### Requirement: Hint: Palisade regions are all one size, in the hint as on the board

An undecided edge between two regions too big to join SHALL be a wall; the
step SHALL outline both and say the size they would make. A region short of
its size whose undecided edges all lead into one other region SHALL grow
through each; the step SHALL ring them as open, stripe the region and say how
many squares it has. A region is the squares the board's no-wall marks join,
one square included, and a size a step says SHALL be one the board shows.

#### Scenario: Two regions too big to join

- **WHEN** the plan on `23d2e2c2e232` reaches an edge between regions of
  squares that would together number 6
- **THEN** the step says "Joining these two regions would make 6 cells, but a
  region here holds 5, so this edge must be a wall."

#### Scenario: A region with one way to grow

- **WHEN** the plan on `23d2e2c2e232` reaches three squares joined by no-wall
  marks, with one undecided edge between them and the rest of the board
- **THEN** the step says "This region has 3 of its 5 cells and just one way
  left to grow, so this edge can't be a wall."

#### Scenario: A region with several edges into one other

- **WHEN** a region short of its size has several undecided edges and all of
  them lead into the same other region
- **THEN** one step rings them all and says the region has "only one region
  left to grow into, so these edges can't be walls", and a leg follows for
  each further edge

#### Scenario: A region a later step speaks of

- **WHEN** a plan is followed on a dealt board and a step stripes a region or
  outlines two
- **THEN** each is a whole region of the board's no-wall marks as they stand
  when the step is reached

### Requirement: Hint: A Palisade wall does not stop at a corner

At a point where four squares meet, where exactly two of the four edges are
not known to be open and one of the two is a wall, the other SHALL be a wall.
The step SHALL outline the four squares and ring the edge.

#### Scenario: A wall arriving at a corner

- **WHEN** the plan on `23d2e2c2e232` reaches a corner with one wall, one
  undecided edge and two open edges
- **THEN** the step says "A wall can't stop in mid-air at this corner, so
  this edge must be a wall."

### Requirement: Hint: Two edges of a Palisade clue that border one region share a fate

Where two undecided edges of a clue of 1, 2 or 3 lead into the same region,
both SHALL be open where walls on both would exceed the clue, as they always
would a 1, and both SHALL be walls where leaving both open would leave it
short, as it always would a 3. A 2 SHALL go by the edges it has already
decided: open with a wall placed, walls with an edge open. The step SHALL
stripe the region the edges border, and SHALL NOT mark the clue's cell.

#### Scenario: A 2 that cannot afford two more walls

- **WHEN** the plan on `23d2e2c2e232` reaches a 2 with two undecided edges
  into one region, where walls on both would exceed it
- **THEN** the step says "Both edges border the same region, so they share a
  fate; walling both would exceed clue 2, so neither can be a wall."

#### Scenario: The clue that decides the edges is not marked

- **WHEN** an `equivalentEdges` step is displayed
- **THEN** every cell of the region it names is hatched, and the clue cell is
  neither hatched nor outlined

### Requirement: Hint: Palisade's hint runs its deductions in a fixed round

The plan SHALL first take every wall between two clues side by side, once,
and then repeat a round until a round forces nothing: the clues that are full
or need every edge left, then regions too big to join, then regions with one
way to grow, then walls at a corner, then edges that share a fate. Each SHALL
sweep the grid in reading order and record every edge it forces before the
next begins, so the plan's steps are in that order.

#### Scenario: The round on a dealt board

- **WHEN** the hint's plan is read on `23d2e2c2e232`
- **THEN** its first six steps are three clues' edges, each clue two legs,
  and its seventh is a wall at a corner, neither rule about a region's size
  having forced an edge in the first round

### Requirement: Status bar: The Palisade status bar gives the region size

The status bar SHALL read `Region size: {k}` from the first move to the last:
it is the one place the board shows the size every region must have, and the
help sends the player to it.

#### Scenario: A board in fives

- **WHEN** the 5×5 board `23d2e2c2e232`, in regions of 5, is opened
- **THEN** the status bar reads "Region size: 5"

### Requirement: Look: Palisade shades completed correct regions

The render SHALL fill a wall-bounded region with the shared finished-region
role once it is a completed, correct region: exactly `k` cells, every clue in
it equal to its wall count, and no wall interior to it. It SHALL fill the
region whole, its clue cells included. The untouched board (one undivided
region) SHALL NOT be filled. The fill is a local check on the region as drawn,
not a check against the unique solution.

#### Scenario: The solved board shades every region, the untouched board none

- **WHEN** the board carries the unique solution's walls
- **THEN** every region renders with the `COL_CORRECT` background
- **AND** the untouched board (no interior walls) renders none

#### Scenario: Breaking a finished region clears its fill

- **WHEN** the player adds a wall inside a filled region
- **THEN** the next `redraw` draws that region's cells without the fill

#### Scenario: A clue cell in a finished region takes the region's fill

- **WHEN** a region holding a clue is completed correctly
- **THEN** the clue's cell is drawn in the finished-region fill, not on the
  lifted surface

### Requirement: Look: A Palisade clue sits on the lifted surface of a given

A cell that holds a clue SHALL sit on the lifted surface of a given, so the
clues the puzzle fixed are told by the cell under them, with the digit in ink.

#### Scenario: A clue is told by the cell under it

- **WHEN** an untouched board is drawn
- **THEN** every cell holding a clue is the lifted surface
- **AND** every other cell is the plain cell surface
