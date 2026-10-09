# separate Specification

## Purpose
Separate: every cell of a `w × h` grid holds one of `k` letters, each letter
occurring `w·h/k` times, and the player draws walls along the edges to divide
the grid into connected regions of `k` cells that each hold one of each letter.
This capability specifies the game's own part: its params and description, its
three-valued walls and half-grid cursor, what counts as solved and as a
mistake, what its generator promises, its shading of completed regions, and its
deduction hint and that hint's words. The border-marking mechanic is shared
with Palisade, and this spec says what is shared and what stays Separate's.

## Requirements

### Requirement: Separate's parameters are a size and a letter count

Params SHALL be `w`, `h` and `k`, positive integers, encoded `{w}x{h}n{k}`. A
bare `{w}` SHALL decode to a square `w × w` grid with `k = w`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, h: 6, k: 4 }` are encoded
- **THEN** the result is `6x6n4`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `5` yields `{ w: 5, h: 5, k: 5 }`

### Requirement: Separate refuses a letter count the grid cannot be divided by

`validateParams` SHALL refuse a `k` that does not divide `w·h`, and an
unreasonably large `w·h`. Under full validation it SHALL also refuse a `k`
equal to the whole grid.

#### Scenario: Invalid params are rejected

- **WHEN** params are fully validated with a `k` that does not divide `w·h`,
  or with `k = w·h`
- **THEN** the result is a non-null error string

### Requirement: Separate descriptions encode the letters grid

The desc SHALL be the `w·h` letters in row-major order, each an uppercase
letter `A + grid[i]`, so `k` distinct letters from `A`. Validating a desc SHALL
reject one of the wrong length, and one containing a character outside
`A .. A+k-1`.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and its letters are
  re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** a desc of the wrong length, or with a letter outside the alphabet
  `A .. A+k-1`, is validated
- **THEN** the result is a non-null error string

### Requirement: A new Separate board holds its letters and only the rim walls

`newState` SHALL parse the desc into the letters and an all-unknown wall
state, with only the grid-rim walls set.

#### Scenario: A fresh board has no interior wall

- **WHEN** `newState` builds a board from a valid desc
- **THEN** every edge on the grid's rim is a wall
- **AND** every edge between two cells is unknown

### Requirement: Separate uses a three-valued wall model with a half-grid cursor

The player SHALL divide the grid by toggling edges. Each edge SHALL be
three-valued (wall, no-wall mark or unknown) and shared between the two cells
it separates, so every edit records both sides. A half-grid keyboard cursor,
with corner, edge and center coordinates in `[1, 2w-1] × [1, 2h-1]`, SHALL move
with the arrow keys and set the edge it rests on with select and select2.

#### Scenario: Clicking an interior edge toggles a wall on both sides

- **WHEN** the player left-clicks near the shared edge between two adjacent
  cells
- **THEN** the returned move sets the wall bit on that edge of both cells
- **AND** re-applying the same click clears it

### Requirement: Each button toggles the nearest edge toward its own state

A left click SHALL act on the edge nearest the pointer, toggling it between
wall and unknown. A right click SHALL toggle it between no-wall mark and
unknown. An edge holding the other button's state SHALL go straight to the
clicked button's state, without passing through unknown.

#### Scenario: A right click turns a wall into a no-wall mark

- **WHEN** the player right-clicks near an interior edge that is a wall
- **THEN** the returned move clears the wall bit and sets the no-wall bit on
  that edge of both cells

### Requirement: The grid rim cannot be edited

`executeMove` SHALL reject a move that would toggle a grid-rim wall. An input
that changes nothing SHALL return `null`, so it leaves no history entry.

#### Scenario: Rim walls cannot be toggled

- **WHEN** a move would toggle a wall on the outer boundary of the grid
- **THEN** `executeMove` rejects it

### Requirement: Separate is solved when every region is a one-of-each k-omino

A state SHALL be solved iff the walls divide the grid into connected components
each of exactly `k` cells, each component containing each of the `k` letters
exactly once, and no wall lies interior to a component. `status` SHALL report
`solved` in that case and `ongoing` otherwise.

#### Scenario: A correct partition is solved

- **WHEN** the walls partition the grid into `k`-ominoes each holding one of each
  letter
- **THEN** `status` reports `solved`

#### Scenario: A duplicate-letter region is not solved

- **WHEN** a wall-bounded region has size `k` but contains a repeated letter
- **THEN** `status` reports `ongoing`

### Requirement: Every generated Separate board is solved by its own solver

The generator SHALL keep a board only when the solver, run to a fixpoint,
fully solves it, so every generated board has one partition and that solver
reaches it.

#### Scenario: Generated boards are uniquely solvable

- **WHEN** the generator produces a board for given params
- **THEN** the solver run to a fixpoint partitions it into `k`-ominoes each
  holding one of each letter

### Requirement: Separate shades completed correct regions

The render SHALL fill a wall-bounded region with the shared finished-region
role, `REGION_DONE`, a wash of the theme pair's first hue, once it is a
completed, correct region: exactly `k` cells, holding one of each letter with
no duplicate, with no wall interior to it. The untouched board, one undivided
region, SHALL NOT be filled. The fill SHALL be a local check on the region as
drawn, not a check against the unique solution.

#### Scenario: A completed region is shaded, the rest is not

- **WHEN** the player seals one region of the unique solution (its full boundary)
  while the rest of the grid is still undivided
- **THEN** exactly that region's `k` cells render with the finished-region fill
- **AND** the untouched remainder does not

#### Scenario: Breaking a region clears its fill

- **WHEN** the player removes a wall from the boundary of a filled region
- **THEN** the next `redraw` draws that region's cells without the fill

### Requirement: Separate ships findMistakes for Check & Save

Because Separate is uniquely solvable, the game SHALL implement `findMistakes`:
re-solve the fixed letters to the unique partition and return every player edge
whose state contradicts it, a wall where the solution has none or a no-wall
mark where the solution has a wall. A flagged edge SHALL be drawn in the error
color. When the board is not uniquely deducible `findMistakes` SHALL return an
empty list.

#### Scenario: A contradicting wall is flagged

- **WHEN** the player draws a wall that the unique solution does not have and
  Check & Save runs
- **THEN** `findMistakes` includes that edge
- **AND** the next `redraw` draws that edge in the error color

### Requirement: Separate shares its border-marking mechanic rather than owning a copy

Separate SHALL take the grid-edge marking mechanic it shares with Palisade
from the shared engine modules and own no copy: the edge bits and
direction tables, the nearest-edge hit test, the three-state toggle, the paired
edit of an edge's two cells, the half-cell cursor, and its look: the geometry,
the edge rects, the tile skeleton and the live error model (a region over or
under size, a wall separating nothing). A change to what counts as a wrong
wall SHALL take effect in both games at once.

#### Scenario: Both games' edits come from the shared module

- **WHEN** a click and a cursor key address the same interior edge in Separate
- **THEN** both produce the paired edits the shared module computes for that
  edge

#### Scenario: The error model is the shared module's

- **WHEN** the player's no-wall marks join more than `k` cells in Separate
- **THEN** the edges between that region and its neighbors are drawn in the
  error color by the shared module's test, not by one of Separate's own

### Requirement: The games' move formats stay independent

The shared module SHALL report which edge a pointer or cursor action targets
and how its state should cycle, and each game SHALL construct its own `Move`
from that description. The module SHALL NOT define a shared move type, which
would couple two save formats that have no reason to be identical.

#### Scenario: Separate wraps the shared edits in its own move

- **WHEN** the shared module reports the paired edits for an edge
- **THEN** Separate returns them inside its own `edges` move

### Requirement: A game adopting the border-grid input adopts its look

A game that uses the shared border-grid input mechanic SHALL draw through the
shared border-grid renderer, and a guard SHALL fail the build for one that does
not, since nothing else would see a second hand-written renderer of the one
mechanic being written.

#### Scenario: A game adopting the input mechanic adopts its look

- **WHEN** a game uses the shared border-grid input mechanic
- **AND** its sources never reference the shared border-grid renderer
- **THEN** the build fails, naming that game

### Requirement: Separate's clue layer stays its own

Separate's region constraints (required region sizes and the cells that must
be kept apart), its solver, its generator and its clue rendering SHALL remain
entirely its own: the letter, the repeated-letter error inside a completed
region, and the test that decides when a region is finished. The shared
renderer SHALL take Separate's palette indices and a callback for the middle of
a tile, and SHALL NOT branch on which game is drawing.

#### Scenario: A repeated letter in a completed region is Separate's error

- **WHEN** a wall-bounded region of exactly `k` cells holds one letter twice
- **THEN** Separate's own tile callback draws both of those letters in the
  error color

### Requirement: Separate runs its solver as a declared ladder that its hint shares

Separate's solver SHALL run on `runDeductionFixpoint` as three tier-0
techniques, in order: `shared-letter`, `walled-apart` and `only-way`. The
working state SHALL carry the same facts as border-grid bytes, so the generator
and the hint run the same techniques on the same state.

#### Scenario: The hint and the generator run one ladder

- **WHEN** the hint asks for the next firing on a player's board
- **THEN** it comes from the same three techniques, in the same order, that
  the generator's solve attempt runs

### Requirement: The ladder's three techniques disconnect, wall and merge

`shared-letter` SHALL mark two adjacent components that already hold a common
letter disconnected, and wall every edge between them. `walled-apart` SHALL
wall an open edge between two disconnected components. `only-way` SHALL merge
an under-size component that has exactly one legal neighboring square with that
square, marking the edges between them "no wall".

#### Scenario: Two neighbors with the same letter are walled apart

- **WHEN** two adjacent lone squares hold the same letter
- **THEN** `shared-letter` disconnects them and walls the edge between them

### Requirement: Separate offers a deduction-based hint

Separate SHALL provide `hint()`, seeded from the player's own marks (no-wall
marks merge, walls disconnect), returning one multi-leg journey per firing of
its ladder, each leg setting one edge.

#### Scenario: The hint finishes from the player's own positions

- **WHEN** hints are followed one recomputed step at a time from a fresh board or from a board revealing a random share of the solution's edges
- **THEN** the board is solved and no hint refuses

### Requirement: The hint refuses a board its solver cannot finish

`hint()` SHALL refuse on a board its solver cannot finish from empty, since
nothing can vouch for the marks on such a board.

#### Scenario: A board the solver cannot divide gets no hint

- **WHEN** a hint is requested on a board whose letters the solver cannot
  divide from the bare rim
- **THEN** `hint()` refuses and returns no step

### Requirement: A hint sentence rests on the player's own marks

Every hint sentence SHALL rest only on letters, walls and regions joined by the
player's own marks. A step that cites two regions SHALL stripe one and outline
the other, and its sentence SHALL name both marks, except where `shared-letter`
names a lone square by its letter: two lone squares SHALL both be outlined, and
a lone square beside a larger region SHALL be named by its letter in the
firing's first sentence. An `only-way` firing's first sentence SHALL name a
lone square by its letter.

#### Scenario: Two regions are named by their marks

- **WHEN** a displayed step cites two regions of more than one square each
- **THEN** one is striped and the other outlined, and the sentence names both
  marks

#### Scenario: A lone square is named by its letter

- **WHEN** the first step of a `shared-letter` firing cites a region and a lone
  square
- **THEN** the region is striped and the square outlined
- **AND** the sentence names the square by its letter, not as a region

#### Scenario: A lone square a wall separates keeps its mark

- **WHEN** a `walled-apart` step cites a region and a lone square
- **THEN** one is striped and the other outlined, and the sentence names both
  marks

### Requirement: Border-grid games share the hint's notation layer

The border grid's hint highlight, the journey a firing becomes, the keep-track
verdict on a click, the per-tile hint flags, the drawing of a striped region
and outlined squares, and the later-leg sentence SHALL come from the engine,
shared by Separate and Palisade. Each game SHALL keep its deduction, its
sentences and its own `Move`, wrapping the shared edits itself.

#### Scenario: Separate's hint step is drawn by the shared layer

- **WHEN** Separate displays a hint step that stripes one region and outlines
  another
- **THEN** the ringed edges, the stripes and the outline are drawn by the
  shared border-grid renderer from the step's words
- **AND** the sentence and the `edges` move are Separate's own

### Requirement: Separate draws its cells on the collection's quiet surface

`redraw` SHALL draw every cell's body on the collection's cell surface, with
its letter in ink. No cell SHALL be lifted as a given, since every cell holds a
letter the puzzle fixed and the player enters none: the surface is one tone and
the edges carry the board. The edges SHALL keep their own roles and strengths:
a wall in ink, an edge ruled out and an edge undecided each in its own color.

#### Scenario: Every cell is the same surface

- **WHEN** an untouched board is drawn
- **THEN** every cell's body is the plain cell surface

### Requirement: The solved flash lifts every cell

The solved flash SHALL lift every cell to the given's surface on its lit beats,
a step that reads in both schemes.

#### Scenario: The flash lifts the cells

- **WHEN** the solved flash is on a lit beat
- **THEN** every cell's body is the lifted surface
