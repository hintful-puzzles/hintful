# untangle Specification

## Purpose
Untangle, the puzzle of dragging the points of a planar graph until none of its
lines cross: exact crossing detection, pointer and keyboard dragging, a Solve
that needs no recorded layout, and a hint that says what its move does to the
crossings.

## Requirements

### Requirement: Untangle game implements the Game interface

The engine SHALL provide a registered `untangle` game implementing
`Game<UntangleParams, UntangleState, UntangleMove, UntangleUi, UntangleDrawState>`:
a planar graph of `n` vertices joined by edges, drawn tangled, solved when the
player has dragged the vertices so that no two edges cross. It SHALL provide
`solve` and a `hint` hook. It SHALL NOT provide `statusbarText`, `textFormat`
or `findMistakes`: crossed edges are the built-in mistake feedback.

#### Scenario: The hooks Untangle has and lacks

- **WHEN** the registered `untangle` game is read
- **THEN** it has `solve` and `hint`, and has no `statusbarText`, `textFormat`
  or `findMistakes`

### Requirement: Untangle's params are a vertex count

Params SHALL be `{ n }`, the vertex count, encoded as the integer. Presets of
6, 10, 15, 20 and 25 vertices SHALL be offered, and the default SHALL be
`n = 10`. The `n` field SHALL declare a lower bound of 4 and an upper bound, so
that the engine's params check refuses an `n` under 4 and an unreasonably large
`n`.

#### Scenario: Params round-trip

- **WHEN** params `{ n: 10 }` are encoded and decoded
- **THEN** the round-trip yields `{ n: 10 }`, and the five presets (6/10/15/20/25)
  are offered

#### Scenario: Invalid params are rejected

- **WHEN** the engine's params check receives `{ n: 3 }` (too few) or an `n`
  above the declared upper bound
- **THEN** it returns a non-null reason

### Requirement: Generation yields a planar graph drawn tangled

`newDesc` SHALL build a graph that is planar by construction: points scattered
on a grid, edges added greedily lowest-degree-vertex-first, each accepted only
when it crosses no existing point and no existing edge, with every vertex
degree capped at 4. It SHALL then lay the vertices on a circle in a shuffled
order, re-rolled until at least one non-adjacent edge pair crosses, so the
puzzle never starts solved.

#### Scenario: A generated board is planar, degree-capped, and starts tangled

- **WHEN** a new game is created from any preset
- **THEN** the graph has a crossing-free embedding (it was built planar), every
  vertex has degree ≤ 4, and the initial circle layout has at least one pair of
  crossing edges (not already solved)
- **AND** generation terminates for every preset

### Requirement: The Untangle desc encodes the edges only

The desc SHALL encode the edges only, as sorted zero-based `a-b` pairs with
`a < b`, carrying no vertex coordinates. `newDesc` SHALL return the solved
layout as the optional `aux`. A desc SHALL be accepted when every pair has
`0 ≤ a, b < n` and `a ≠ b` and no edge is named twice, and refused for an
out-of-range pair, a self-loop or a repeated edge.

#### Scenario: The desc encodes edges only

- **WHEN** a generated desc is decoded
- **THEN** it yields the edge set with no coordinate information, and
  `validateDesc` accepts it

#### Scenario: A bad pair is refused

- **WHEN** `validateDesc` reads a desc with an out-of-range vertex, a pair
  joining a vertex to itself, or the same edge twice
- **THEN** it returns a reason

### Requirement: Crossing detection is exact and drives solved status

The game SHALL determine whether two edges cross using an exact integer
segment-intersection test over the rational vertex coordinates (no
floating-point epsilon), treating collinear overlap and an endpoint lying on
the other segment as crossings, and considering only non-adjacent edge pairs.
`status` SHALL report `"solved"` exactly when no edge pair crosses. The
crossing set SHALL be recomputed on every state transition and exposed to
`redraw` so crossed edges can be highlighted.

#### Scenario: A board with no crossings is solved

- **WHEN** the vertices are positioned so that no two non-adjacent edges cross
- **THEN** `status` returns `"solved"`

#### Scenario: Adjacent edges meeting at a vertex are not a crossing

- **WHEN** two edges share an endpoint
- **THEN** they are never counted as crossing each other

### Requirement: Vertices are dragged by pointer or keyboard

`interpretMove` SHALL let the player move one vertex at a time. A pointer
press near a vertex SHALL begin a drag, motion SHALL preview the vertex
following the pointer as a `UI_UPDATE` with no history entry, and release SHALL
commit a move placing that vertex at its position. The editor-only edge
add and delete moves SHALL NOT be mapped.

#### Scenario: A drag moves one vertex and updates crossings

- **WHEN** the player drags a vertex to a new position and releases in-bounds
- **THEN** a move is committed that repositions only that vertex, the crossing set
  is recomputed, and the displayed crossed-edge highlighting updates

### Requirement: A drag is clamped to the playable area

The drag target SHALL be clamped to the playable area, keeping the vertex blob
inside the play-area border: dragging past the edge SHALL preview the vertex
pinned at the nearest in-bounds position, and a release SHALL commit it there.
A drag off the board SHALL NOT cancel. The clamped position SHALL be rounded to
integers, so fractional pointer input never reaches a move.

#### Scenario: A drag released outside the play area clamps and commits

- **WHEN** the player drags a vertex past the play-area edge and releases
- **THEN** the vertex is committed at the nearest position inside the play-area
  border (it does not reset to its prior position)

### Requirement: The keyboard selects, holds, nudges and cycles a vertex

Keyboard control SHALL select the nearest vertex in the pressed direction,
begin and end a drag with the select key, nudge a held vertex with the arrows,
and cycle the selection.

#### Scenario: A held vertex is nudged and dropped

- **WHEN** the player selects a vertex away from the border, presses the select
  key, presses an arrow, and presses the select key again, with snapping off
- **THEN** a move is committed placing that vertex one nudge away in the
  arrow's direction

### Requirement: executeMove places vertices and refuses a malformed move

`executeMove` SHALL apply the placement or placements and recompute the
crossings. It SHALL throw on a malformed move, a non-integer coordinate
included: the exact crossing test depends on `RationalPoint` holding integers.
The move SHALL be structured-clone-safe, using the default serialize and
deserialize.

#### Scenario: A fractional coordinate is refused

- **WHEN** `executeMove` receives a move whose point has a non-integer `x`
- **THEN** it throws

### Requirement: The layout is restored by replaying the move log

A saved game SHALL reload to the same vertex positions by replaying its move
log. Restoring the layout SHALL require no superseding desc (the
`supersededDesc` hook).

#### Scenario: A saved game reloads to the same layout via the move log

- **WHEN** a game with dragged vertices is serialized and reloaded
- **THEN** the reconstructed positions exactly match

### Requirement: Rendering frames the play area and colors roles distinctly

`redraw` SHALL draw a visible border around the playable area, so the drop zone
is told from any surrounding dead space. It SHALL draw edges as lines, red for
an edge involved in a crossing when the show-crossed-edges preference is on and
ink otherwise, and vertices as blobs, or as index numbers under the
vertex-style preference, in a fixed z-order so the dragged vertex sits on top.
The danger color (red) SHALL be reserved for crossings.

#### Scenario: Crossed edges and dragged-vertex neighbors are visually distinct

- **WHEN** the player drags a vertex that has neighbors while crossings exist
- **THEN** crossed edges render red, the dragged vertex renders in the color of
  a thing picked up, and its neighbor vertices render in the pair's first color
  (not red), so neighbors are not mistaken for a crossing/error indication

### Requirement: A vertex's color says its role

A vertex SHALL be the theme pair's second color, and a vertex adjacent to the
one being dragged the pair's first, so the held vertex's neighbors stand
against the rest. The dragged vertex SHALL be the collection's color for a
thing picked up and the keyboard-cursor vertex the collection's cursor color.
The two SHALL never be shown together, and picking a vertex up SHALL be told by
its neighbors changing color. The hint SHALL be the collection's hint color.

#### Scenario: Picking up the cursor vertex

- **WHEN** the player presses the select key on the keyboard-cursor vertex
- **THEN** that vertex takes the picked-up color, no vertex keeps the cursor
  color, and its neighbors take the pair's first color

### Requirement: Solve untangles any planar board, with or without aux

`solve` SHALL return a single move repositioning every vertex to a
crossing-free layout, choosing among the eight dihedral symmetries of that
layout the one with the most vertices already in place and then the least
motion. `solve` SHALL refuse only a graph that is not planar. The solve SHALL
animate and SHALL be marked as solved-with-help.

#### Scenario: Solve from a fresh game lands crossing-free

- **WHEN** the player invokes Solve on a freshly generated game
- **THEN** every vertex moves to a position where no edges cross, the move is marked
  solved-with-help, and it animates

#### Scenario: Solve works on a loaded game

- **WHEN** the player invokes Solve on a game restored from a save (no `aux`)
- **THEN** the board is solved, marked solved-with-help

#### Scenario: Solve refuses a non-planar graph

- **WHEN** Solve is invoked on a hand-typed description of K5
- **THEN** it reports that no solution exists and leaves the board unchanged

### Requirement: The solved layout is exact and checked

The solved layout SHALL be the generator's `aux` when the session has it,
scaled to fill the play box, and otherwise a layout computed from the edges
alone: a planarity embedding and a straight-line grid drawing, spread by a
relaxation that never lets it tangle. Every layout SHALL be exact rationals,
checked crossing-free with the game's exact crossing test before use.

#### Scenario: A layout from the edges alone passes the game's own test

- **WHEN** the solved layout of a generated board is computed without `aux`
- **THEN** its coordinates are integers over their denominators, and the
  game's crossing test finds no crossing in it

### Requirement: Untangle hints move the point that removes the most crossings

The `untangle` game SHALL implement the `hint` hook. Each step SHALL move one
vertex, and SHALL be a leg of a journey (see "Untangle hints finish a knot of
crossings as one journey") or, when no journey is found, a clearing step or a
placing step. A placing step SHALL be given only when no single move removes a
crossing. Executing a step SHALL animate the vertex sliding to its
destination.

#### Scenario: A step moves one vertex

- **WHEN** a hint is requested on a tangled planar board
- **THEN** every step of the plan is a move placing exactly one vertex

### Requirement: A clearing step removes the most crossings a searched spot allows

A clearing step SHALL be the move of a vertex, not already on its place, to a
spot that removes the most crossings among the spots searched: a grid over the
whole play box, the vertex's place in the solved layout, and its neighbors'
centroid. Its explanation SHALL state how many crossings the vertex's lines
make before and after the move, both counted exactly as the board counts them.

#### Scenario: A clearing step's counts are true

- **WHEN** a clearing step is applied
- **THEN** its explanation tells the moved vertex's crossings before and after,
  the vertex makes fewer crossings afterward, and the board loses exactly the
  difference

### Requirement: A hint's count is a numeral

A count in a hint's explanation SHALL be written as a numeral, never as a
number word. The one exception is a move that clears every crossing of its
vertex, which SHALL say "its only crossing", "both of its crossings" or, from
three up, "all" and the numeral.

#### Scenario: A move that leaves crossings counts in numerals

- **WHEN** a clearing step takes a vertex's crossings from five to two
- **THEN** its explanation says "from 5 to 2"

### Requirement: A clearing spot keeps its gaps

A spot a clearing step moves to SHALL keep, as fractions of the typical spacing
between points, a gap from every other vertex and from every line the vertex is
not an end of, and a margin from the frame. A slightly tighter gap SHALL be
used only when no spot with the full gaps removes a crossing. The margin from
the frame SHALL NOT tighten.

#### Scenario: A roomy spot wins over a cramped one

- **WHEN** the search of spots with the full gaps finds a move that removes a
  crossing
- **THEN** that move is the clearing step, and no spot with the tighter gap is
  considered

### Requirement: A placing step moves a vertex to its place in the solved layout

A placing step SHALL move a vertex not already on its place to its place in
the solved layout. It SHALL prefer a vertex that is in some crossing, whose
move is visibly long, and whose place is clear in the sense a clearing spot is,
and among those the placement whose next move removes the most crossings net of
what it adds.

#### Scenario: A vertex in no crossing waits

- **WHEN** a placing step is due and one unplaced vertex is in a crossing while
  another is in none, both with a clear place a long move away that the
  pointer can drop them on
- **THEN** the step moves the vertex that is in a crossing

### Requirement: A vertex's place is one the pointer can drop it on

A vertex's place SHALL be its position in the solved layout, moved to a nearby
spot where a pointer drop can land and the layout stays crossing-free. A vertex
SHALL count as on its place when it lies within the reach of a drop aimed at
that place. The layout SHALL be taken under the symmetry with the most vertices
on their places and then the least motion, the criterion Solve chooses by.

#### Scenario: A vertex the hint placed is on its place

- **WHEN** a placing step is followed by dropping its vertex on the marked
  spot, and a hint is requested again
- **THEN** that vertex counts as on its place

### Requirement: A placing step is explained by what the player can see

A placing step's explanation SHALL state what the move does to the vertex's
crossings. When the next step removes crossings, and at least as many as this
one adds, it SHALL also state how many the next step removes. It SHALL NOT
refer to the solved layout, which the player cannot see.

#### Scenario: A placing step that pays off says so

- **WHEN** a placing step raises its vertex's crossings by one and the next
  step removes three
- **THEN** its explanation says the move frees a move that removes 3

### Requirement: A vertex on its place is not moved, so hints end solved

A vertex on its place in the solved layout SHALL NOT be moved by a clearing
step, a placing step, or a journey's first leg. Following hints from any
position of a planar board SHALL therefore end solved, recomputing after every
step.

#### Scenario: Following hints solves the board from anywhere

- **WHEN** hints are requested and applied repeatedly from a freshly generated
  board with `aux`, or from randomly scattered points without `aux`
- **THEN** the board ends with no crossings

### Requirement: Untangle's hint refusals

A hint on a solved board SHALL be refused with the collection's already-solved
wording, by the midend before it asks the game. `hint` SHALL refuse with its
no-move-worth-making wording on a non-planar board once no single move removes
a crossing.

#### Scenario: Hint refuses on a solved board

- **WHEN** a hint is requested on a board with no crossings
- **THEN** the midend refuses it with the collection's already-solved message,
  without asking the game's `hint`

### Requirement: A hint step marks its vertex, its destination and the crossings it removes

Each step SHALL mark the vertex it moves, its destination, where the crossings
the move removes sit, and, on a journey's leg, the marked vertices still to
move after it.

#### Scenario: A journey's first leg marks the others

- **WHEN** the first leg of a journey of three vertices is on display
- **THEN** it marks its own vertex, its destination, and the two vertices
  still to move

### Requirement: redraw draws a displayed hint in the hint color

For a displayed step, `redraw` SHALL draw a hint-colored line from the vertex
to its destination, the vertex and a destination marker in the hint color, an
unfilled hint-colored ring on each crossing the move removes, and an unfilled
hint-colored ring around each marked vertex still to move.

#### Scenario: Displayed hint is rendered

- **WHEN** a hint step is on display
- **THEN** `redraw` draws a hint-colored line to, and a hint-colored marker at,
  the suggested destination, and one ring for each crossing the move removes

### Requirement: Untangle hints finish a knot of crossings as one journey

When at most a few crossings are left, `hint` SHALL first look for a journey:
moves of a few marked vertices after which none of their lines crosses
anything, found by a bounded search whose cost is counted in work, not time, so
the same board gets the same hint on every machine. A journey SHALL be returned
as the whole plan, one leg per vertex, every leg after the first flagged as
continuing the one before.

#### Scenario: A journey does what it says

- **WHEN** a journey is followed to its end
- **THEN** none of its vertices' lines crosses anything, the board has fewer
  crossings than before it, and the board is solved if the first leg said
  every crossing clears

#### Scenario: The owner's board finishes in about the owner's moves

- **WHEN** hints are followed on the board `20#343769d2db4f418cccd3b79e00c975d0`
- **THEN** the board is solved within 22 moves

### Requirement: A journey removes crossings and unplaces nothing it need not

A journey's first leg SHALL remove at least one crossing and SHALL NOT move a
vertex that is on its place in the solved layout. A journey that leaves
crossings elsewhere on the board SHALL NOT move such a vertex at all. So every
journey removes crossings from the board, and a hint recomputed after any leg
still cannot cycle.

#### Scenario: A journey that leaves crossings never unplaces a vertex

- **WHEN** a journey leaves crossings elsewhere on the board
- **THEN** none of its legs moves a vertex that was on its place in the solved
  layout

### Requirement: A journey's legs say what the journey and each move do

The first leg's explanation SHALL say how many marked vertices the journey
moves and whether it clears every crossing on the board or every crossing those
vertices are in. Every leg's SHALL say what its own move does to its vertex's
crossings, counted exactly on the board as that leg finds it. A journey of one
vertex SHALL be explained as a clearing step.

#### Scenario: A leg's count may rise on the way

- **WHEN** a middle leg's move raises its vertex's crossings while other marked
  vertices are still to move
- **THEN** its explanation says the crossings rise, from the count the board
  has as that leg finds it to the count after its move
