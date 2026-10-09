# inertia Specification

## Purpose
Inertia, the puzzle of steering a ball that slides until a wall or stop halts
it, collecting every gem without running onto a mine. This capability specifies
what is the game's own: its rules and description format, eight-direction
keyboard and swipe control, how the board looks, gems placed only where the
ball can go and come back from, and a hint that heads for the nearest gem it
can safely take and explains each move by it. What every game shares is in the
engine capabilities.

## Requirements

### Requirement: Inertia's board and what solves it

The board SHALL be a `w × h` grid whose cells are blank, a gem, a mine, a
stop-square or a wall, with a single ball starting on a stop-square. The game
is won when every gem has been collected.

#### Scenario: Collecting the last gem wins

- **WHEN** a slide collects the last gem on the board
- **THEN** the game's status is solved

### Requirement: Inertia's parameters

Params SHALL be `w` and `h`, encoded `WxH`. Each dimension SHALL be 2 or more,
and a grid whose area is below 6 squares SHALL be refused: the generator places
one gem for every five squares and needs at least one.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 15, h: 12 }` are encoded in full and decoded
- **THEN** the decoded params equal the original

#### Scenario: Degenerate params are rejected

- **WHEN** params have a dimension below 2, or an area below 6 squares
- **THEN** they are refused

### Requirement: Inertia has no mistake check

The game SHALL NOT implement `findMistakes`: every reachable position is legal,
since a death is undone, not corrected, so there is no wrong-but-legal state to
flag.

#### Scenario: A death is not a mistake

- **WHEN** the ball has run onto a mine
- **THEN** no square is flagged as a mistake, and the player undoes to play on

### Requirement: The ball slides until it is stopped

A move slides the ball in one of eight directions. `executeMove` SHALL move the
ball one square at a time in the move's direction, and for each square entered:
collect a gem there (decrementing the gem count and clearing the square), die on
a mine there, and stop when the square is a stop-square or when the next square
in the direction is a wall.

#### Scenario: The ball collects gems on the way past

- **WHEN** the ball slides through a line of squares containing gems and lands
  against a wall
- **THEN** every gem in the traversed squares is collected and the gem count drops
  by that number

#### Scenario: The ball dies on a mine

- **WHEN** the ball's slide takes it onto a mine
- **THEN** the resulting state is dead and the slide stops there

### Requirement: A move into a wall, or by a dead ball, is refused

`interpretMove` SHALL reject a direction whose adjacent square is a wall, and
SHALL reject every move while the ball is dead.

#### Scenario: A move into a wall is refused

- **WHEN** the player presses a direction whose adjacent square is a wall
- **THEN** no move is produced and the game state is unchanged

#### Scenario: A dead ball does not move

- **WHEN** the ball is dead and the player presses a direction
- **THEN** no further move is accepted until the player undoes

### Requirement: All eight directions are reachable from the keyboard

The game SHALL accept the arrow keys for the four orthogonal directions and the
digits `1`–`4` and `6`–`9`, laid out as the number pad, which is itself a
compass, for all eight, **with or without** the `MOD_NUM_KEYPAD` modifier.
Without the unmodified digits a keyboard with no number pad, or with Num Lock
off, could not make the four diagonal moves. Inertia binds no other digit, so
no other input is shadowed.

#### Scenario: A diagonal is reachable from the keyboard

- **WHEN** the player presses `3`
- **THEN** the ball sets off to the south-east

### Requirement: The ball can be swiped in a direction

Pressing the pointer **on the ball** SHALL begin a swipe rather than making a
move: while the pointer is held, the game SHALL draw an arrow on the ball
pointing at the direction the pointer is aimed at (the octant it lies in, seen
from the ball), and SHALL play that direction when the pointer is released.
Clicking a square away from the ball SHALL stay supported, and moves the ball
toward the octant the click falls in.

#### Scenario: Holding and dragging aims, and releasing launches

- **WHEN** the player presses on the ball, drags out to the east and releases
- **THEN** an arrow points east while the pointer is held, and the ball sets off
  east on release

### Requirement: A swipe aimed at nothing makes no move

Aiming a swipe SHALL yield no direction, and so draw no aim arrow and make no
move on release, when the pointer is back on the ball (which is how the player
calls the swipe off) or when it is aimed at a wall (which is not a move the ball
can make).

#### Scenario: Dragging back to the ball calls the swipe off

- **WHEN** the player presses on the ball, drags out, drags back onto the ball
  and releases
- **THEN** no move is made

### Requirement: The aim arrow has its own color

The arrow of a swipe being aimed SHALL be drawn in its own color, distinct from
the hint's arrow, since the two mean different things ("you are about to go this
way" versus "the hint says go this way").

#### Scenario: An aimed swipe is not mistaken for the hint

- **WHEN** a swipe is aimed east while no hint is displayed
- **THEN** the arrow on the ball is in the aim color, not the hint's

### Requirement: The swipe works on the secondary button

The whole swipe gesture SHALL also work on the **secondary** button, because on
touch a press that stays put for the long-press interval is delivered as one,
and a press that stays put is exactly what holding the ball to aim looks like.
Inertia binds nothing else to the secondary button.

#### Scenario: A held finger still aims

- **WHEN** a press on the ball arrives as the secondary button, is dragged out
  to the east and released
- **THEN** the ball sets off east

### Requirement: Descriptions encode the grid, and the start square becomes a stop

The desc SHALL be exactly `w · h` characters from `{b, g, m, s, w, S}` (blank,
gem, mine, stop, wall, start), row-major. `newState` SHALL place the ball on the
single `S` square and treat that square as a stop-square thereafter.
`validateDesc` SHALL reject a desc of the wrong length, containing an unrecognized
character, without exactly one start square, or without at least one gem.

#### Scenario: Start square is a stop square

- **WHEN** a game is created from a desc whose start square is at (x, y)
- **THEN** the ball is at (x, y) and that square behaves as a stop-square for
  subsequent slides

#### Scenario: A desc with no gems is rejected

- **WHEN** `validateDesc` is given a desc containing no `g`
- **THEN** it returns a non-null error string

### Requirement: Inertia's floor and walls

The game SHALL render the floor as the cell surface, ruled with the surface's
grid line, and a wall as a flat block with no bevel, in a gray that stands a
clear step off the floor in both schemes: darker than the floor in the light
scheme and lighter than it in the dark one. Walls that touch SHALL be drawn as
one mass, with no grid line between them.

#### Scenario: A wall is a flat block

- **WHEN** a board with a wall is drawn
- **THEN** the wall's square is one rectangle in the wall's color
- **AND** nothing on the board is a bevel

### Requirement: Inertia's pieces and ball

The game SHALL render mines as spiked balls, black in both schemes with a rim
in ink, so that a mine stands off the dark scheme's floor; stop-squares as
rings; gems as diamonds in the collection's color for what the player is after
(the theme pair's second member); and the ball as a circle in the color of
where the player is, or a jagged red splat when dead.

#### Scenario: A mine keeps its rim in the dark scheme

- **WHEN** a board with a mine is drawn in the dark scheme
- **THEN** the mine is black, inside a rim in ink

### Requirement: A move animates the slide, and death and the win flash

A move SHALL animate the ball sliding along its path, in a time proportional to
the square root of the distance traveled, with each gem disappearing as the ball
reaches it. Death SHALL flash the board red, and the winning move SHALL flash
it light.

#### Scenario: A gem stays until the ball reaches it

- **WHEN** a slide that collects a gem is partway through its animation and the
  ball has not yet reached the gem's square
- **THEN** the gem is still drawn

### Requirement: Inertia's status bar

The status bar SHALL show the remaining gem count, or `DEAD!` when dead, and a
running deaths tally. The deaths tally SHALL be incremented only for a death
caused by a move the player just made on an unfinished board, so that undoing
and redoing a fatal move does not re-count it.

#### Scenario: Undo and redo do not re-count a death

- **WHEN** the player dies, undoes the fatal move, and redoes it
- **THEN** the deaths tally still reads 1

### Requirement: The hint plans for the nearest gem the ball can safely take

The game SHALL implement `hint`, planning in **legs**: a leg is the shortest walk
to a gem, ending with the move that collects it. Each leg SHALL go for the
**nearest** gem, fewest moves to collect, that the ball can take **without
stranding itself**: a candidate leg SHALL be rejected when the position it
leaves behind can no longer be solved, and the next-nearest tried instead.

#### Scenario: A stranding grab is not suggested

- **WHEN** the nearest gem can be collected in one slide, but that slide leaves the
  ball where some other gem can never be reached again
- **THEN** the hint does not suggest that slide

### Requirement: The route solver's tour is the hint's fallback, never its plan

Where the near gems all strand the ball, the route solver's own tour SHALL
supply the leg, its remaining route being the witness that the leg is safe. The
plan SHALL NOT otherwise follow the tour: a hint is recomputed from scratch
whenever the player goes their own way, and two tours grown from adjacent
positions can disagree about which gem to fetch first, sending the ball back
and forth for ever.

#### Scenario: The hint always makes progress, however the player got here

- **WHEN** a hint is asked for, its first step played, and a fresh hint asked for
  again, repeatedly, from any position the board reaches
- **THEN** the board is solved in a finite number of moves; the hint never sends
  the ball back and forth between two positions without collecting a gem

### Requirement: The hint explains each move by the gem it is going for

The hint SHALL narrate every move it suggests against the gem its leg is going
for, and SHALL claim no more than it has verified. Each leg's **subgoal** is the
gem it ends by collecting: the last one along its final move's path, where that
move sweeps up several. Because Inertia's gems are anonymous, the subgoal gem
SHALL be marked on the board, so the narration can refer to it.

#### Scenario: A move that collects nothing is explained by what it sets up

- **WHEN** the hint suggests a move that collects no gem
- **THEN** its narration names the subgoal gem it is positioning for, rather than
  merely stating the direction

### Requirement: The subgoal is held stable across its leg

The subgoal SHALL be held **stable** across every step of its leg: derived
once, from the plan, and carried. It SHALL NOT be re-derived per step from the
ball's position, because the nearest gem to the ball changes as the ball moves
while the gem the plan is going for does not, and a re-derived goal makes the
narration flip-flop between goals.

#### Scenario: The subgoal does not change under the player's feet

- **WHEN** a leg takes several moves to reach its gem
- **THEN** every step of that leg names the same subgoal gem

### Requirement: A forced move is called forced, by what forces it

When every other direction the ball can set off in would run it onto a mine,
the narration SHALL say so; this is a genuine necessity claim. Where it is
instead walls that block every other direction, the narration SHALL say that,
and SHALL NOT speak of mines.

#### Scenario: A forced move is called forced

- **WHEN** every direction the ball could otherwise set off in runs it onto a mine
- **THEN** the narration says so

#### Scenario: A ball hemmed in by walls is not told of mines

- **WHEN** walls block every direction but the one the hint suggests
- **THEN** the narration says walls block every other direction, and names no mine

### Requirement: A collecting move names what it sweeps up and what stops the ball

When the suggested slide collects at least one gem, the narration SHALL name
what it sweeps up. Unless the slide is also the ball's only move, in which case
the narration gives that reason instead, it SHALL also name what brings the
ball to a halt, a stop square or the wall at the end: the rule the game turns
on is that the player does not choose where the ball stops.

#### Scenario: A sweep names its stop

- **WHEN** the hint suggests a slide that collects two gems and ends on a stop
  square, with other safe directions open
- **THEN** the narration says it sweeps up a gem and then the subgoal gem, and
  that the stop square catches the ball

### Requirement: A stranding grab is called out

When the suggested slide collects nothing, and the subgoal gem could be swept
up by a single slide from here that would leave some gem unreachable for ever,
the narration SHALL say so; this is Inertia's one provable verdict about a
position.

#### Scenario: The tempting grab is named

- **WHEN** one slide from here would take the subgoal gem and strand another,
  and the hint suggests a different slide that collects nothing
- **THEN** the narration names the grabbing slide and says it strands a gem

### Requirement: A positioning move's premise is checked

When the suggested slide collects nothing, the narration SHALL say what the
move is for. Where it is not the ball's only move and a **check** finds no slide
from here that takes the subgoal gem, it SHALL say that none reaches it: a plan
may decline a grab, so the claim is not true by construction. Where a slide
would take the gem and no stranding is proven, it SHALL say only that the route
comes at it from another side. It SHALL NOT claim to be the
*only* such move unless that has been verified.

#### Scenario: The hint never says a gem is out of reach when a slide would take it

- **WHEN** a step's narration says no slide from here reaches the subgoal gem
- **THEN** no legal, non-fatal slide from that position collects it

### Requirement: One more slide is promised only when the plan makes it

A narration SHALL NOT promise that one more slide finishes the leg unless the
plan's **own next move** is that slide. A slide merely existing is not the
claim, because a gem can be reached from a side no single slide from here can
reach.

#### Scenario: The promise is the plan's next move

- **WHEN** a step's narration says one more slide sweeps up the subgoal gem
- **THEN** the plan's next step is the slide that collects it

### Requirement: A hint is a nudge, and only Solve is a commitment

`hint` SHALL NOT mark the game as solved-with-help. Solve plays the whole route,
and the engine records that the solver was used; a player asking for one nudge
does not pay that price.

#### Scenario: Asking for a hint does not brand the game auto-solved

- **WHEN** the player asks for a hint
- **THEN** the status bar does not report that the auto-solver was used

### Requirement: Following the hint keeps the plan

The game SHALL implement `hintKeepTrack`, so that a move in the displayed step's
direction **completes** that step and the plan is kept. Without it the plan is
dropped on every player move, including one that faithfully follows the hint,
and the next hint replans from scratch, which is what a stable subgoal exists
to prevent.

#### Scenario: Following the hint keeps the plan

- **WHEN** the player plays the move the displayed hint step suggests
- **THEN** the plan advances to its next step rather than being recomputed

### Requirement: The hint refuses honestly when the move to make is undo

`hint` SHALL refuse when the ball is dead, and when some gem can no longer be
reached by any sequence of moves, and each refusal SHALL say that the move to
make is to undo.

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
and SHALL draw the step's direction as an arrow on the ball. While a swipe is
aimed in a direction, its aim arrow SHALL replace the hint's arrow, being what
the ball will actually do next.

#### Scenario: The marked gem is ringed and the direction shown

- **WHEN** a hint step is displayed
- **THEN** the board rings its subgoal gem, and an arrow on the ball points the way
  the step suggests

### Requirement: Generated boards place gems only where the ball can go and come back

The generator SHALL fill the grid with one fifth walls, one fifth stop-squares
and one fifth mines plus one start square, the remainder blank, and shuffle it.
It SHALL then find the **gem candidates**, the squares the ball can reach from
the start and return to the start from, reject the grid if there are fewer
candidates than the required gem count, and place `⌊w·h/5⌋` gems on a shuffled
subset of the candidates.

#### Scenario: Every generated board is completable

- **WHEN** a board is generated for any preset
- **THEN** the route solver finds a route from the start that collects every gem

### Requirement: Gem candidates are searched as square-plus-direction pairs

A gem candidate SHALL be a square for which some one direction of travel is
reachable both *from* the start and *back to* the start. Judging pairs of
square and direction, not squares, is required for correctness: a square may
only be enterable heading one way and only leavable heading another, so a gem
there could be collected but never returned from.

#### Scenario: A square entered one way and left another is no candidate

- **WHEN** a square can be reached from the start only heading in directions
  from which the ball cannot get back to the start
- **THEN** no gem is placed there

### Requirement: Generated boards keep their gem candidates spread

The generator SHALL reject a grid in which some square is geometrically further
than a threshold from the nearest gem candidate, the threshold starting at 2
and relaxing by one every 50 rejections, so that reachable squares stay spread
over the board. This test SHALL run before the gems are placed.

#### Scenario: A board with a dead region is rejected

- **WHEN** a shuffled grid has enough gem candidates, but one square lies three
  squares from the nearest of them, on the generator's first attempt
- **THEN** the grid is rejected and another is shuffled

### Requirement: Solve plays a computed route to the finished board

`solve` SHALL compute a route, a sequence of directions from the ball's current
position that collects every remaining gem without the ball dying, and SHALL
return an error when some remaining gem is unreachable. The route is a tour
found by approximation and need not be the shortest. The solve move SHALL play
the whole route, and the ball SHALL jump to its end rather than animating,
since one interpolated slide over a route of many would cross walls.

#### Scenario: Solve finishes the game

- **WHEN** the player invokes Solve on a board with gems remaining
- **THEN** every gem is collected and the game reports itself solved with help
