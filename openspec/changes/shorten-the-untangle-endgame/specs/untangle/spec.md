## MODIFIED Requirements

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

## ADDED Requirements

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
