# untangle Specification

## Purpose
Untangle, the puzzle of dragging the points of a planar graph until none of its
lines cross. This capability specifies its port to the TS engine: exact crossing
detection, pointer and keyboard dragging, Solve through the recorded layout, and
an animated move hint.

## Requirements

### Requirement: Untangle game implements the Game interface

The engine SHALL provide a registered `untangle` game implementing
`Game<UntangleParams, UntangleState, UntangleMove, UntangleUi, UntangleDrawState>`:
a planar graph of `n` vertices joined by edges, drawn tangled, solved when the
player has dragged the vertices so that no two edges cross. Params SHALL be
`{ n }` (vertex count), encoded as the integer; the five upstream presets (6, 10,
15, 20, 25) SHALL be offered with default `n = 10`. `validateParams` SHALL reject
`n < 4` and an unreasonably large `n`. The game SHALL report `wantsStatusbar`
faithfully to upstream, `canSolve = true`, and
`canFormatAsText = false` (the upstream text format exists only in the excluded
editor build). It SHALL provide a `hint` hook (see "Untangle hints move the point
that removes the most crossings") and SHALL NOT provide a `findMistakes` hook
(crossed edges are the built-in mistake feedback).

#### Scenario: Params round-trip

- **WHEN** params `{ n: 10 }` are encoded and decoded
- **THEN** the round-trip yields `{ n: 10 }`, and the five presets (6/10/15/20/25)
  are offered

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` receives `{ n: 3 }` (too few) or an unreasonably large
  `n`
- **THEN** it returns a non-null reason

### Requirement: Generation yields a planar graph drawn tangled

`newDesc` SHALL build a graph that is planar by construction — points scattered on
a grid, edges added greedily lowest-degree-vertex-first and accepted only when they
cross no existing point and no existing edge, with every vertex degree capped at 4 —
then lay the vertices on a circle in a shuffled order **re-rolled until at least one
non-adjacent edge pair crosses**, so the puzzle never starts solved. The desc SHALL
encode the **edges only** (sorted zero-based `a-b` pairs, `a < b`), carrying no
vertex coordinates. The solved layout SHALL be returned as the optional `aux`.

#### Scenario: A generated board is planar, degree-capped, and starts tangled

- **WHEN** a new game is created from any preset
- **THEN** the graph has a crossing-free embedding (it was built planar), every
  vertex has degree ≤ 4, and the initial circle layout has at least one pair of
  crossing edges (not already solved)
- **AND** generation terminates for every preset

#### Scenario: The desc encodes edges only

- **WHEN** a generated desc is decoded
- **THEN** it yields the edge set with no coordinate information, and `validateDesc`
  accepts every `a-b` with `0 ≤ a, b < n` and `a ≠ b` and rejects out-of-range or
  self-loop pairs

### Requirement: Crossing detection is exact and drives solved status

The game SHALL determine whether two edges cross using an exact integer
segment-intersection test over the rational vertex coordinates (no floating-point
epsilon), treating collinear overlap and an endpoint lying on the other segment as
crossings, and considering only **non-adjacent** edge pairs (edges sharing a vertex
do not count). `status` SHALL report `"solved"` exactly when no edge pair crosses.
The crossing set SHALL be recomputed on every state transition and exposed to
`redraw` so crossed edges can be highlighted.

#### Scenario: A board with no crossings is solved

- **WHEN** the vertices are positioned so that no two non-adjacent edges cross
- **THEN** `status` returns `"solved"`

#### Scenario: Adjacent edges meeting at a vertex are not a crossing

- **WHEN** two edges share an endpoint
- **THEN** they are never counted as crossing each other

### Requirement: Vertices are dragged by pointer or keyboard

`interpretMove` SHALL let the player move one vertex at a time: a pointer press near
a vertex begins a drag, motion previews the vertex following the pointer
(`UI_UPDATE`, no history entry), and release commits a move placing that vertex at
its position. The drag target SHALL be **clamped to the playable area** (the vertex
blob kept inside the play-area border): dragging past the edge previews the vertex
pinned at the nearest in-bounds position and a release commits it there. (This is a
deliberate divergence from upstream's drag-off-to-cancel affordance — the owner
chose clamp-and-commit. It also subsumes integer rounding of fractional pointer
input.) Keyboard control SHALL select the nearest vertex in the pressed direction,
begin/end a drag with the select key, nudge a held vertex with the arrows, and cycle
the selection. `executeMove` SHALL apply the placement(s), recompute crossings, and
throw on a malformed move (including a non-integer coordinate — the `RationalPoint`
integer invariant the exact crossing test depends on). The move SHALL be
structured-clone-safe (default serialize/deserialize). The editor-only edge
add/delete moves SHALL NOT be mapped.

#### Scenario: A drag moves one vertex and updates crossings

- **WHEN** the player drags a vertex to a new position and releases in-bounds
- **THEN** a move is committed that repositions only that vertex, the crossing set
  is recomputed, and the displayed crossed-edge highlighting updates

#### Scenario: A drag released outside the play area clamps and commits

- **WHEN** the player drags a vertex past the play-area edge and releases
- **THEN** the vertex is committed at the nearest position inside the play-area
  border (it does not reset to its prior position)

#### Scenario: A saved game reloads to the same layout via the move log

- **WHEN** a game with dragged vertices is serialized and reloaded
- **THEN** the reconstructed positions exactly match (the layout is restored by
  replaying the move log — Untangle requires no `supersede_desc` mechanism)

### Requirement: Rendering frames the play area and colors roles distinctly

`redraw` SHALL draw a visible border around the playable area so the drop zone is
unambiguous (distinguishing it from any surrounding dead space). It SHALL draw edges
as lines — **red** for an edge involved in a crossing (when the show-crossed-edges
preference is on), black otherwise — and vertices as blobs (or index numbers, per
the vertex-style preference) in a fixed z-order so the dragged vertex sits on top.
The colors SHALL keep the "danger" color (red) reserved for crossings: a vertex
adjacent to the one being dragged SHALL be highlighted in a distinct **non-red**
color (light blue), the dragged vertex white, and the keyboard-cursor vertex gray.

#### Scenario: Crossed edges and dragged-vertex neighbors are visually distinct

- **WHEN** the player drags a vertex that has neighbors while crossings exist
- **THEN** crossed edges render red, the dragged vertex renders white, and its
  neighbor vertices render light blue (not red), so neighbors are not mistaken
  for a crossing/error indication

### Requirement: Solve untangles any planar board, with or without aux

`solve` SHALL return a single move repositioning every vertex to a crossing-free
layout, choosing among the eight dihedral symmetries of that layout the one with
the most vertices already in place and then the least motion. The layout SHALL
be the generator's `aux` when the session has it, scaled to fill the play box,
and otherwise a layout computed from the edges alone (a planarity embedding and a
straight-line grid drawing, spread by a relaxation that never lets it tangle).
Every layout SHALL be exact rationals, checked crossing-free with the game's
exact crossing test before use. `solve` SHALL refuse only a graph that is not
planar. The solve SHALL animate and SHALL be marked as solved-with-help.

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

### Requirement: Untangle hints move the point that removes the most crossings

The `untangle` game SHALL implement `hint(state, aux?)`. Each step SHALL move one
vertex, and SHALL be a leg of a journey (see "Untangle hints finish a knot of
crossings as one journey") or, when no journey is found, one of two kinds:

- **Clearing**: the move of a vertex, not already in place, to a spot that
  removes the most crossings among the spots searched (a grid over the whole
  play box, the vertex's place in the solved layout, and its neighbors'
  centroid). A spot SHALL keep, as fractions of the typical spacing between
  points, a gap from every other vertex and from every line the vertex is not
  an end of, and a margin from the frame; only when no spot with the full gaps
  removes a crossing MAY a slightly tighter gap be used. The step's
  explanation SHALL state, in numerals, how many crossings the vertex's lines
  make before and after the move, both counted exactly as the board counts
  them.
- **Placing**, only when no single move removes a crossing: the move of a vertex
  not already in place to its place in the solved layout (as Solve would
  choose it). It SHALL prefer a vertex that is in some crossing, whose move is
  visibly long, and whose place is clear in the same sense, and among those the
  placement whose next move removes the most crossings net of what it adds. Its
  explanation SHALL state what the move does to the vertex's crossings and,
  when the next step removes at least as many crossings as this one adds, how
  many; it SHALL NOT refer to the solved layout, which the player cannot see.

A vertex exactly on its place in the solved layout SHALL NOT be moved by either
kind of step, nor by a journey's first leg. Following hints from any position of
a planar board SHALL therefore end solved, recomputing after every step. `hint`
SHALL refuse with the collection's already-solved wording on a solved board, and
with its no-move-worth-making wording on a non-planar board once no single move
removes a crossing.

Each step SHALL carry a highlight naming the vertex, its destination, where the
crossings the move removes sit, and, on a journey's leg, the marked vertices
still to move after it. `redraw` SHALL draw a hint-colored line from the vertex
to its destination, the vertex and a destination marker in the hint color, an
unfilled hint-colored ring on each crossing the move removes, and an unfilled
hint-colored ring around each marked vertex still to move. Executing a step
SHALL animate the vertex sliding to its destination.

#### Scenario: A clearing step's counts are true

- **WHEN** a clearing step is applied
- **THEN** its explanation names the moved vertex's crossings before and after,
  the vertex makes fewer crossings afterward, and the board loses exactly the
  difference

#### Scenario: Following hints solves the board from anywhere

- **WHEN** hints are requested and applied repeatedly from a freshly generated
  board with `aux`, or from randomly scattered points without `aux`
- **THEN** the board ends with no crossings

#### Scenario: Hint refuses on a solved board

- **WHEN** `hint` is called on a board with no crossings
- **THEN** it returns `{ ok: false }` with the collection's already-solved message

#### Scenario: Displayed hint is rendered

- **WHEN** a hint step is on display
- **THEN** `redraw` draws a hint-colored line to, and a hint-colored marker at,
  the suggested destination, and one ring for each crossing the move removes

### Requirement: Untangle hints finish a knot of crossings as one journey

When at most a few crossings are left, `hint` SHALL first look for a journey:
moves of a few marked vertices after which none of their lines crosses anything,
found by a bounded search whose cost is counted in work, not time, so the same
board gets the same hint on every machine. A journey SHALL be returned as the
whole plan, one leg per vertex, every leg after the first flagged as continuing
the one before. Its first leg SHALL remove at least one crossing and SHALL NOT
move a vertex that is on its place in the solved layout; a journey that leaves
crossings elsewhere on the board SHALL NOT move such a vertex at all. So every
journey removes crossings from the board, and a hint recomputed after any leg
still cannot cycle.

The first leg's explanation SHALL say how many marked vertices the journey moves
and whether it clears every crossing on the board or every crossing those
vertices are in, and every leg's SHALL say, in numerals, what its own move does
to its vertex's crossings, counted exactly on the board as that leg finds it.

#### Scenario: A journey does what it says

- **WHEN** a journey is followed to its end
- **THEN** none of its vertices' lines crosses anything, the board has fewer
  crossings than before it, and the board is solved if the first leg said
  every crossing clears

#### Scenario: The owner's board finishes in about the owner's moves

- **WHEN** hints are followed on the board `20#343769d2db4f418cccd3b79e00c975d0`,
  which the owner finished in 20 moves and the hint without journeys in 31
- **THEN** the board is solved within 22 moves

#### Scenario: A journey that leaves crossings never unplaces a vertex

- **WHEN** a journey leaves crossings elsewhere on the board
- **THEN** none of its legs moves a vertex that was on its place in the solved
  layout
