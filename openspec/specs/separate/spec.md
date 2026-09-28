# separate Specification

## Purpose
Separate, the puzzle of dividing a lettered grid along its edges into regions
that each contain exactly one of each letter. This capability specifies its port
to the TS engine, with a three-valued wall model and half-grid cursor, shading
of completed regions, and mistake-checking, on a border-marking mechanic it
shares rather than owns.

## Requirements

### Requirement: Separate game implements the Game interface

The engine SHALL provide a registered `separate` game implementing
`Game<SeparateParams, SeparateState, SeparateMove, SeparateUi, SeparateDrawState>`:
the grid-partition puzzle ("Block Puzzle") on a `w × h` grid in which every cell
holds one of `k` letters, each letter occurring `w·h/k` times, and the player
divides the grid into disjoint connected `k`-ominoes such that each region
contains exactly one of each letter. Params SHALL be `w`, `h`, and `k`
(positive integers), encoded `{w}x{h}n{k}` with a bare `{w}` decoding to a
square `w × w` grid with `k = w`. `validateParams` SHALL reject a non-positive
dimension, a `k` that does not divide `w·h`, an unreasonably large `w·h`, and (on
a full validation) `k` equal to the whole grid. The game SHALL offer a menu of
presets, provide `solve` and `textFormat`, and drive a
solve-completion flash.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, h: 6, k: 4 }` are encoded
- **THEN** the result is `6x6n4`
- **AND** decoding it round-trips the params
- **AND** decoding a bare `5` yields `{ w: 5, h: 5, k: 5 }`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with a non-positive dimension, or a `k`
  that does not divide `w·h`
- **THEN** it returns a non-null error string

### Requirement: Separate descriptions encode the letters grid

The desc SHALL be the `w·h` letters in row-major order, each an uppercase letter
`A + grid[i]` (so `k` distinct letters `A..`), exactly as upstream's
`new_game_desc` emits. `validateDesc` SHALL reject a desc of the wrong length or
containing a character outside `A .. A+k-1`. `newState` SHALL parse the desc into
the immutable letters array and an all-unknown wall state (only the grid rim
walls set), `completed` and `cheated` both false.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and its letters are
  re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc of the wrong length or with a letter
  outside the alphabet `A .. A+k-1`
- **THEN** it returns a non-null error string

### Requirement: Separate uses a three-valued wall model with a half-grid cursor

The player SHALL divide the grid by toggling edges, each three-valued (wall /
no-wall mark / unknown) and shared between the two cells it separates so every
edit records both sides, exactly as Palisade. A left click SHALL cycle the edge
nearest the pointer through wall ↔ unknown; a right click through no-wall-mark ↔
unknown. A half-grid keyboard cursor (corner/edge/center coordinates in
`[1, 2w-1] × [1, 2h-1]`) SHALL move with the arrow keys and set the adjacent edge
with select/select2. Toggling a grid-rim wall SHALL be rejected. A move that
changes nothing SHALL return `null` (no history entry).

#### Scenario: Clicking an interior edge toggles a wall on both sides

- **WHEN** the player left-clicks near the shared edge between two adjacent cells
- **THEN** the returned move sets the wall bit on that edge of both cells
- **AND** re-applying the same click clears it

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

### Requirement: Separate ports the DSF solver and gates generation on it

The port SHALL implement the upstream `solver_attempt` deductions over a
disjoint-set forest of squares — (1) mark two components disconnected when
adjacent squares belong to distinct components that already share a letter, and
(2) connect an under-size component that has exactly one legal way to extend —
run to a fixpoint, reporting solved / progressed / stuck. `solve()` SHALL run the
solver to the unique partition and return a move that draws a wall on every edge
between two different components (reporting failure if the board is not uniquely
deducible). The generator SHALL build a random `k`-omino partition with
`divvyRectangle`, then repeatedly fill each omino with a shuffled set of the `k`
letters (respecting the squares the solver has already depended on) and re-solve,
keeping a board only when the solver fully solves it — so every generated board
is uniquely solvable by the ported solver. All RNG draws SHALL go through the
bit-identical `random.ts`.

#### Scenario: Generated boards are uniquely solvable

- **WHEN** the generator produces a board for given params
- **THEN** the ported solver run to a fixpoint partitions it into `k`-ominoes
  each holding one of each letter

#### Scenario: Solve draws the unique partition's walls

- **WHEN** `solve()` is invoked on a generated board
- **THEN** the returned move yields a solved state

### Requirement: Separate shades completed correct regions

The render SHALL shade a wall-bounded region with the shared completed-region color (a neutral `COL_CORRECT` gray, matching Rectangles) once
it is a completed, correct region — exactly `k` cells, holding one of each letter
(no duplicate), with no wall interior to it — giving the player the same
local-correctness feedback Galaxies and Rectangles give. The untouched board
(one undivided region) SHALL NOT be shaded. The shading is a local check on the
region as drawn, not a check against the unique solution. The valid overlay SHALL
be part of the render cache diff key so it appears and clears as regions are
completed and broken.

#### Scenario: A completed region is shaded, the rest is not

- **WHEN** the player seals one region of the unique solution (its full boundary)
  while the rest of the grid is still undivided
- **THEN** exactly that region's `k` cells render with the `COL_CORRECT` background
- **AND** the untouched remainder does not

### Requirement: Separate ships findMistakes for Check & Save

Because Separate is uniquely solvable, the game SHALL implement `findMistakes`:
re-solve the fixed letters to the unique partition and return every player edge
whose state contradicts it — a wall where the solution has none, or a no-wall
mark where the solution has a wall. The flagged edges SHALL render with a
distinct error overlay, and the overlay SHALL be part of the render cache diff
key so it repaints on the frame Check & Save runs (playbook §3.2). When the board
is not uniquely deducible `findMistakes` SHALL return an empty list.

#### Scenario: A contradicting wall is flagged

- **WHEN** the player draws a wall that the unique solution does not have and
  Check & Save runs
- **THEN** `findMistakes` includes that edge and it renders in the error color

### Requirement: Separate shares its border-marking mechanic rather than owning a copy

Separate SHALL obtain the grid-edge marking mechanic it shares with Palisade from
a shared engine module rather than from its own copy: the border/disabled bit
vocabulary and direction tables, the closest-edge hit test from a pointer
coordinate, the undecided→wall→no-wall tri-state cycle under left and right
button, the paired edit of the two cells adjacent to a marked edge, and the
half-cell keyboard cursor coordinate scheme.

**The mechanic's *look* is shared on the same terms**, and for the same reason:
the board geometry, the four three-valued edge rects, the tile skeleton around
them, the half-cell cursor the module already moves, and the live error model —
a region larger than the target size, one smaller, or a wall that separates
nothing. Those are properties of the marking mechanic, not of Separate, and a
change to what counts as a wrong wall SHALL take effect in both games at once.

Separate's region constraints (required region sizes and the cells that must be
kept apart), its solver, its generator and its **clue** rendering SHALL remain
entirely its own — the letter, the repeated-letter error inside a completed
region, and the test that decides when a region is finished. The shared renderer
SHALL take Separate's palette indices and a callback for the middle of a tile,
and SHALL NOT branch on which game is drawing.

Adopting the shared module SHALL NOT change any board Separate generates or any
frame it draws: the boards it generates for a given seed and its render snapshots
SHALL be unchanged. **The same standard binds the rendering extraction, and binds it
harder**, because a tier-2.5 snapshot records every draw call with its
coordinates and its resolved color: sharing the look either changes no draw call
or it is wrong.

#### Scenario: The shared mechanic is adopted without moving a board

- **WHEN** Separate is changed to consume the shared border-grid module
- **THEN** every board Separate generates for a given seed is unchanged
- **AND** every Separate render snapshot passes without `vitest -u`

#### Scenario: The games' move formats stay independent

- **WHEN** the shared module reports which edge a pointer or cursor action
  targets and how its state should cycle
- **THEN** each game constructs its own `Move` from that description
- **BECAUSE** a shared move type would couple two save formats that have no
  reason to be identical

#### Scenario: A game adopting the input mechanic adopts its look

- **WHEN** a game uses the shared border-grid input mechanic
- **AND** its sources never reference the shared border-grid renderer
- **THEN** the build fails, naming that game
- **BECAUSE** two hand-written renderers of one mechanic is the state this
  module exists to end, and nothing else can see a third being written

### Requirement: Separate runs its solver as a declared ladder that its hint shares

Separate's solver SHALL run on `runDeductionFixpoint` as three tier-0 techniques,
in order: `shared-letter` (two adjacent components already holding a common letter
are disconnected, and every edge between them walled), `walled-apart` (an open
edge between two disconnected components is walled), and `only-way` (an under-size
component with exactly one legal neighboring square merges with it, marking the
edges between them "no wall"). The working state SHALL carry the same facts as
border-grid bytes, so the generator and the hint run the same techniques on the
same state. The ladder SHALL generate exactly the boards upstream's loop did, and
the hand-written loop SHALL be kept as the oracle a ladder-equivalence test proves
it against.

#### Scenario: The ladder moves no board

- **WHEN** the generator runs on the ladder
- **THEN** the frozen differential's descs are unchanged
- **AND** over generator runs the ladder and the legacy loop agree on partition, sizes, disconnects, locked letters and verdict, with every rung fired

### Requirement: Separate offers a deduction-based hint

Separate SHALL provide `hint()`, seeded from the player's own marks (no-wall marks
merge, walls disconnect), returning one multi-leg journey per firing of its ladder,
each leg setting one edge. It SHALL refuse on a solved board, on a board carrying a
mistake, and on a board its solver cannot finish from empty. Every sentence SHALL
rest only on letters, walls and regions joined by the player's own marks; a
sentence about two regions SHALL tell them apart by mark shape (one hatched, one
outlined), and a lone square SHALL be named by its letter.

#### Scenario: The hint finishes from the player's own positions

- **WHEN** hints are followed one recomputed step at a time from a fresh board or from a board revealing a random share of the solution's edges
- **THEN** the board is solved and no hint refuses

#### Scenario: Two regions are named by their marks

- **WHEN** a displayed step cites two regions
- **THEN** one is hatched and the other outlined, and the sentence names both marks

### Requirement: Border-grid games share the hint's notation layer

The border grid's hint highlight, the journey a firing becomes, the keep-track
verdict on a click, the per-tile hint flags, the drawing of a hatched region and
outlined squares, and the later-leg sentence SHALL come from the engine, shared by
Separate and Palisade. Each game SHALL keep its deduction, its sentences and its
own `Move`, wrapping the shared edits itself. Moving Palisade onto the shared layer
SHALL change no Palisade frame.

#### Scenario: Palisade's hint frames survive the extraction

- **WHEN** Palisade draws its hint through the shared layer
- **THEN** its render snapshots pass without `vitest -u`
