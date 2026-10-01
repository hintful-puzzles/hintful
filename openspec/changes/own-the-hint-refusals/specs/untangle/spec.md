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
a planar board SHALL therefore end solved, recomputing after every step. A hint
on a solved board SHALL be refused with the collection's already-solved wording,
by the midend before it asks the game, and `hint` SHALL refuse with its
no-move-worth-making wording on a non-planar board once no single move removes a
crossing.

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

- **WHEN** a hint is requested on a board with no crossings
- **THEN** the midend refuses it with the collection's already-solved message,
  without asking the game's `hint`

#### Scenario: Displayed hint is rendered

- **WHEN** a hint step is on display
- **THEN** `redraw` draws a hint-colored line to, and a hint-colored marker at,
  the suggested destination, and one ring for each crossing the move removes
