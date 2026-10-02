## ADDED Requirements

### Requirement: Solve plays a computed route to the finished board

`solve` SHALL compute a route — a sequence of directions from the ball's current
position that collects every remaining gem — by building the move graph (a vertex
at every square the ball can come to rest, plus a *directed* vertex at every gem
the ball can slide through, since a gem passed through in one direction cannot be
left in another), growing a tour that splices in a detour to one as-yet-uncollected
gem after another until none remain, and then repeatedly replacing redundant
sections of the tour with shortest paths until it stops shrinking. It SHALL return
an error when some remaining gem is unreachable.

The tour is an approximate solution to a traveling-salesman problem, not a
deduction. Two tours SHALL be grown — one reaching for the nearest uncollected
gem, one for the farthest — and the shorter kept.

The solve move SHALL play the whole route, so the board is finished, as Solve
finishes every game's board. The ball SHALL jump to the route's end rather than
animating, since the route is many slides and one interpolated slide would cross
walls. The step-by-step aid is the hint's.

#### Scenario: A computed route collects every gem

- **WHEN** a route is computed for a board whose gems are all reachable
- **THEN** following it collects every gem without the ball dying

#### Scenario: Solve finishes the game

- **WHEN** the player invokes Solve on a board with gems remaining
- **THEN** every gem is collected and the game reports itself solved with help

## MODIFIED Requirements

### Requirement: The ball can be swiped in a direction

Pressing the pointer **on the ball** SHALL begin a swipe rather than making a
move: while the pointer is held, the game SHALL draw an arrow on the ball
pointing at the direction the pointer is aimed at (the octant it lies in, seen
from the ball), and SHALL play that direction when the pointer is released.

Aiming SHALL yield no direction — and so draw no arrow, and make no move on
release — when the pointer is back on the ball (which is how the player calls the
swipe off) or when it is aimed at a wall (which is not a move the ball can make).
The arrow SHALL be drawn in its own color, distinct from the hint's arrow, since
the two mean different things ("you are about to go this way" versus "the hint
says go this way").

The whole gesture SHALL also work on the **secondary** button, because on touch a
press that stays put for the long-press interval is delivered as one — and a
press that stays put is exactly what holding the ball to aim looks like. Inertia
binds nothing else to the secondary button.

This is a deliberate divergence: upstream offers only the click-an-octant input,
which stays supported, but is fiddly with a finger and gives no feedback before
committing.

#### Scenario: Holding and dragging aims, and releasing launches

- **WHEN** the player presses on the ball, drags out to the east and releases
- **THEN** an arrow points east while the pointer is held, and the ball sets off
  east on release

#### Scenario: Dragging back to the ball calls the swipe off

- **WHEN** the player presses on the ball, drags out, drags back onto the ball
  and releases
- **THEN** no move is made

### Requirement: Rendering, animation and the status bar

The game SHALL render walls with a bevel, mines, stop-squares as rings, gems as
diamonds, and the ball as a circle (a jagged red splat when dead) drawn over a
blitter-saved background. A move
SHALL animate the ball sliding along its path, in a time proportional to the
square root of the distance traveled, with each gem disappearing as the ball
reaches it. Death SHALL flash the board red and the winning move SHALL flash it
light. The status bar SHALL show the remaining gem count, `DEAD!` when dead,
`COMPLETED!` when finished, and a running deaths tally.

The deaths tally SHALL be incremented only for a death caused by a move the player
just made on an unfinished board, so that undoing and redoing a fatal move does
not re-count it.

#### Scenario: Undo and redo do not re-count a death

- **WHEN** the player dies, undoes the fatal move, and redoes it
- **THEN** the deaths tally still reads 1

### Requirement: A hint is a nudge; only Solve is a commitment

`hint` SHALL NOT mark the game as solved-with-help. Solve plays the whole route,
and the engine records that the solver was used.

This separation is the reason the hint exists: Solve shows the finished board,
but only at the price of recording the game as auto-solved, which is precisely
the price a player asking for one nudge is trying not to pay.

The game SHALL implement `hintKeepTrack`, so that a move in the displayed step's
direction **completes** that step and the plan is kept. Without it the midend drops
the plan on every player move — including one that faithfully follows the hint —
and the next hint replans from scratch, which is what a stable subgoal exists to
prevent.

#### Scenario: Asking for a hint does not brand the game auto-solved

- **WHEN** the player asks for a hint
- **THEN** the status bar does not report that the auto-solver was used

#### Scenario: Following the hint keeps the plan

- **WHEN** the player plays the move the displayed hint step suggests
- **THEN** the plan advances to its next step rather than being recomputed

#### Scenario: The hint refuses honestly when the ball is dead

- **WHEN** the player asks for a hint with the ball dead
- **THEN** the hint refuses, and says that the move to make is to undo

#### Scenario: The hint refuses honestly when a gem is out of reach for ever

- **WHEN** the player asks for a hint from a position where some gem can no longer
  be reached by any sequence of moves
- **THEN** the hint refuses, says that a gem can no longer be reached, and says
  that the move to make is to undo

### Requirement: The hint is drawn as a marked gem and an arrow

`redraw` SHALL mark the displayed step's subgoal gem with a ring in its own color,
and SHALL draw the step's direction as an arrow on the ball. The aim arrow
of a swipe in progress SHALL take precedence over both, being what the ball will
actually do next.

The ring SHALL be part of the tile's cache key, because it is drawn on a tile
rather than on the ball sprite — an overlay outside the diff key is never painted
and never erased.

#### Scenario: The marked gem is ringed and the direction shown

- **WHEN** a hint step is displayed
- **THEN** the board rings its subgoal gem, and an arrow on the ball points the way
  the step suggests

## REMOVED Requirements

### Requirement: Solve installs a computed route the player follows

**Reason**: Solve shows the finished board in every game, and the engine holds
it to that (`ts-engine` § "Solve leaves a solved board"); a route installed for
the player to walk was one of three meanings Solve had.
**Migration**: "Solve plays a computed route to the finished board" keeps the
route computation and plays it; the hint is the step-by-step aid.
