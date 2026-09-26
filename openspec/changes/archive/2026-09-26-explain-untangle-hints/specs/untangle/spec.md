## MODIFIED Requirements

### Requirement: Untangle game implements the Game interface

The engine SHALL provide a registered `untangle` game implementing
`Game<UntangleParams, UntangleState, UntangleMove, UntangleUi, UntangleDrawState>`:
a planar graph of `n` vertices joined by edges, drawn tangled, solved when the
player has dragged the vertices so that no two edges cross. Params SHALL be
`{ n }` (vertex count), encoded as the integer; the five upstream presets (6, 10,
15, 20, 25) SHALL be offered with default `n = 10`. `validateParams` SHALL reject
`n < 4` and an unreasonably large `n`. The game SHALL report `wantsStatusbar`
faithfully to upstream, `isTimed = false`, `canSolve = true`, and
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

## REMOVED Requirements

### Requirement: Solve untangles via the recorded solution layout

**Reason**: Solve no longer depends on `aux`: a layout computed from the edges
alone makes a resumed save or a shared game ID solvable, which the scenario "Solve
is unavailable on a loaded game" forbade.
**Migration**: Replaced by "Solve untangles any planar board, with or without
aux".

### Requirement: Untangle provides a move hint with animation

**Reason**: The hint now narrates, its fallback is the solved layout rather than
a local heuristic that could refuse on an unsolved board, and its plan is short
rather than the whole walk.
**Migration**: Replaced by "Untangle hints move the point that removes the most
crossings".

## ADDED Requirements

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
vertex, and SHALL be one of two kinds:

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
kind of step. Following hints from any position of a planar board SHALL
therefore end solved, recomputing after every step. `hint` SHALL refuse with the
collection's already-solved wording on a solved board, and with its
no-move-worth-making wording on a non-planar board once no single move removes a
crossing.

Each step SHALL carry a highlight naming the vertex, its destination, and where
the crossings the move removes sit. `redraw` SHALL draw a hint-colored line from
the vertex to its destination, the vertex and a destination marker in the hint
color, and an unfilled hint-colored ring on each crossing the move removes.
Executing a step SHALL animate the vertex sliding to its destination.

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
