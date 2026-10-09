# sixteen Specification

## Purpose
Sixteen, the puzzle of shifting whole rows and columns cyclically until the
numbers read in order from the top left: the game, its direct row and column
dragging, and a hint that plans by searching, finishes the swapped-pair
endgames, counts the tangles its distance measure cannot see, and refuses only
by saying its search ran out. Why the hint's searches are arranged as they are
is in `docs/games/hints.md` § "Sliding-permutation games".

## Requirements

### Requirement: Sixteen slides whole rows and columns until the tiles read in order

Sixteen SHALL be the toroidal sliding-tile puzzle, in which a move slides a
whole row or column and the board is solved when the tiles read in order. The
game SHALL provide a keyboard cursor with Unlocked, LockTile and LockPosition
modes, and SHALL animate a slide.

#### Scenario: The solved board is complete

- **WHEN** the tiles read in order from the top left
- **THEN** the state reports completed status

### Requirement: Sixteen's params choose how the board is scrambled

Sixteen's params SHALL be written `WxH[mM]`. A movetarget `M` greater than 0
SHALL select generation by shuffling with random moves; otherwise the board
SHALL be a random permutation with parity correction.

#### Scenario: Random-permutation generation is solvable

- **WHEN** a new game is created with movetarget 0
- **THEN** the generated permutation is parity-corrected so the board is
  reachable from the solved state

### Requirement: A slide is one move whatever its distance

A slide of a whole row or column SHALL be expressed as
`{ type: "slide", axis, index, delta }`, and SHALL shift every tile of that
line by `delta` cells with toroidal wraparound. The move counter SHALL
increment by one for a slide regardless of its distance.

#### Scenario: Slide move semantics

- **WHEN** a slide move `{ type: "slide", axis: "row", index: 1, delta: +1 }`
  executes
- **THEN** every tile in row 1 shifts right by one cell with toroidal wraparound
- **AND** the move counter increments by one regardless of slide distance

### Requirement: The Sixteen hint plans in full-slide moves

The Sixteen hint planner SHALL search in full-slide moves: a slide by any
distance is one move, matching a player's drag and the move counter. The
planner SHALL return the whole path as a plan of narrated steps.

#### Scenario: Sixteen generates a hint plan

- **WHEN** a user asks for a hint on an unsolved Sixteen board
- **THEN** the planner returns a plan of one or more slide moves

### Requirement: A step narrates what its move does

Each step's narration SHALL describe what its move actually does. The
highlighted tile SHALL be the lowest-numbered out-of-place tile on the moved
line, or the lowest-numbered tile on it when every tile of the line is home,
except on the second leg of a previewed journey. The target SHALL be the
narrated tile's landing cell under the step's move, and the returned delta
SHALL be normalized to the in-grid direction of travel.

#### Scenario: Each step lands its tile on its target

- **WHEN** a user asks for a hint on an unsolved Sixteen board
- **THEN** each step of the plan lands the highlighted tile exactly on that
  step's highlighted target

#### Scenario: A move along a line that is all home

- **WHEN** a step slides a line whose every tile is in its solved cell, to
  serve another line's journey
- **THEN** the step highlights the lowest-numbered tile on that line

### Requirement: A journey's second leg keeps its tile

When the previous step previewed this move as the continuation of a tile's
journey, the same journey tile SHALL carry the narration through its second
leg, and the step SHALL be flagged `continuesPrevious` so the midend keeps the
hint displayed across the legs. A step SHALL carry a second-leg preview when
the next step continues the same tile's journey perpendicular to the first.

#### Scenario: A tile moved along a row and then a column

- **WHEN** one step slides its narrated tile along a row and the next step
  slides the column that tile landed in
- **THEN** the first step previews the cell the second leg takes the tile to,
  and the second step narrates the same tile and is flagged
  `continuesPrevious`

### Requirement: A step says whether its tile arrives or is staged

A step's narration SHALL explain why the move matters: a journey that ends
with the narrated tile in its solved cell SHALL be narrated as moving it to
its final spot, and one that leaves it out of its solved cell as a setup move.
The why SHALL attach to the journey's end state and SHALL be spoken on the
journey's first leg; a `continuesPrevious` leg SHALL NOT repeat it.

#### Scenario: Narration distinguishes a final placement from a staging move

- **WHEN** a single-move step lands the narrated tile in its solved cell
- **THEN** its narration states the tile is being moved into its final place
- **WHEN** a step leaves the narrated tile out of its solved cell and no later
  leg takes it there
- **THEN** its narration states it is a setup move

#### Scenario: A journey whose later leg homes the tile

- **WHEN** a step's own move leaves the tile out of its solved cell and its
  previewed second leg lands the tile there
- **THEN** the first step reads as a home move

### Requirement: The hint gives the move home even when it undoes the player's slide

A hint SHALL give the move that gets the board home even when that move undoes
the slide the player just made. The don't-undo veto SHALL NOT be applied to
the exact search's shortest plan, because it would destroy the property that
makes the plan converge. The veto SHALL remain available to the heuristic
search, which carries no such property.

#### Scenario: One slide off a finished board

- **WHEN** a player slides a row of the solved board and asks for a hint
- **THEN** the hint is the one move that slides it back

### Requirement: Sixteen draws the hinted tile, its landing cell and its arrow

The Sixteen `redraw` method SHALL render the current step by highlighting the
tile to move with a filled overlay, its landing cell with a border, and the
corresponding slide arrow, in the hint's color.

#### Scenario: The current step is drawn

- **WHEN** a hint step is displayed
- **THEN** the tile, the target and the slide arrow are drawn in the hint
  color

### Requirement: hintKeepTrack follows slides of the hinted line

Sixteen's `hintKeepTrack` SHALL report `"completed"` when a slide of the
hinted line lands the tile on the step's target, `"onTrack"` for other slides
of that line, adjusting the step's remaining delta in place, and `"off"`
otherwise.

#### Scenario: A slide that stops short

- **WHEN** the step slides a row by two and the player slides that row by one
- **THEN** the verdict is `"onTrack"` and the step's delta becomes one

#### Scenario: A slide of another line

- **WHEN** the player slides a line other than the hinted one
- **THEN** the verdict is `"off"`

### Requirement: The Sixteen port supports direct row and column dragging

Sixteen SHALL support direct touch and mouse row/column dragging. When a user drags on a tile in the grid, the game SHALL track the horizontal or vertical drag vector and visually offset the dragged row/column in real-time. When released, the line SHALL slide by the drag's distance rounded to a whole number of tiles, and a drag that rounds to none SHALL make no move.

#### Scenario: Dragging a row to slide it right
- **WHEN** a user pointerdowns on tile (0, 1), pointermoves right by 1.2 tiles, and pointerups
- **THEN** the game executes a slide move on row 1 with a delta of +1 (shifting right by 1)

#### Scenario: A short drag makes no move
- **WHEN** a user drags a row right by a third of a tile and releases
- **THEN** no slide is executed and the row settles where it was

### Requirement: Sixteen's hint SHALL finish the swapped-pair endgames

Sixteen's hint SHALL return a plan from a board whose only fault is one or two
pairs of tiles sitting in each other's cells, and SHALL NOT refuse on it.
Sixteen SHALL therefore configure the planner's depth-bounded deep search, and
its reach SHALL cover nine moves at its largest preset. Such a board is a
strict local minimum of the distance measure, and lies one move past what a
search that stores every board it visits can afford at this size.

#### Scenario: A single swapped pair

- **WHEN** a hint is asked on a 5×4 board that is solved except for two tiles in
  each other's cells
- **THEN** it returns a plan of more than eight moves that finishes the board

#### Scenario: Two swapped pairs

- **WHEN** a hint is asked on a 5×5 board that is solved except for two such
  pairs
- **THEN** it returns a plan of more than eight moves that finishes the board

### Requirement: Sixteen's hint SHALL count the tangles its distance measure cannot see

Sixteen's hint SHALL measure a board by the distance its tiles must travel
plus a cost for the tangles it is tied in, a tangle being a non-trivial cycle
of the tile permutation, and SHALL return a plan from a tangled board rather
than refusing. Travel alone is blind to a tangle: every slide from a tangled
board makes it worse, so the board is a strict local minimum that no forward
budget escapes.

#### Scenario: The board the hint refused on

- **WHEN** recomputed hints are followed from the 5×5 board whose only fault is
  four pairs of tiles in each other's cells
- **THEN** each one returns a plan, and the board reaches solved

#### Scenario: Tangles beyond a pair count

- **WHEN** the same is asked of a board of three tangles, and of one of five
- **THEN** both reach solved, rather than stopping partway

### Requirement: A tangled board is not answered by searching further

Reaching further SHALL NOT be attempted with the planner's search machinery to
answer a tangled board: each further ply multiplies the cost of the one before
it. Counting the tangles, in one pass over the board, is what escapes.

#### Scenario: A board past both exact searches

- **WHEN** a hint is asked on a board of four tangles, which neither exact
  search reaches
- **THEN** the plan comes from the heuristic search steered by the tangle
  measure, not from a search of greater reach

### Requirement: The tangle count is priced only past what the exact searches unwind

The tangle count SHALL be priced only past the number of tangles the exact
searches can unwind on their own, which is two. On any board at or under that
the measure SHALL be plain travel. The deep search is gated on the fallback
finding nothing better than standing still, so a measure sharpened everywhere
would stop that gate opening and replace a complete plan with a partial one.

#### Scenario: A one- or two-tangle endgame is untouched

- **WHEN** a hint is asked on a board whose only fault is one or two swapped
  pairs
- **THEN** the deep search still answers it with a plan of more than eight moves
  that finishes the board

### Requirement: A Sixteen tile stands off the board

`redraw` SHALL draw a tile's face as the collection's lifted surface inside its
bevel, so a tile is told from the board by more than its bevel in both schemes.
The tile SHALL keep its bevel: it is an object the player moves. Color 0 SHALL
stay the board.

#### Scenario: A tile is not the board's gray

- **WHEN** a board is drawn at rest in either scheme
- **THEN** every tile's face is the lifted surface

### Requirement: Sixteen's slide arrows are Netslide's

A slide arrow SHALL be filled as Netslide fills its own in both schemes: a
gray a step off the board, outlined in ink, which the bevel's dark-scheme swap
does not reach. The arrow the keyboard cursor is on SHALL be filled in the
collection's cursor color, and the arrow a hint names in the hint's.

#### Scenario: The arrows match Netslide's in the dark scheme

- **WHEN** Sixteen and Netslide are drawn in the dark scheme
- **THEN** a plain slide arrow has the same fill in both
