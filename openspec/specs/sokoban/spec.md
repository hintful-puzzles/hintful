# sokoban Specification

## Purpose
Sokoban, the puzzle of pushing, never pulling, every barrel onto a target, where
no barrel can be pushed into a wall or another barrel. This capability specifies
the params and description formats, the keys, tap and drag, what a push does and
when the board is complete, what a deal promises of a level, the hint and Solve
with the search beneath them, and how the board looks and moves.

## Requirements

### Requirement: Sokoban's parameters are a width and a height

Sokoban SHALL support rectangular boards parameterized by width and height, both at
least 4. A parameter string SHALL encode the width and the height, and a bare single
number SHALL be read as a square board.

#### Scenario: Parameters round-trip

- **WHEN** a parameter string naming a width and height is encoded and decoded
- **THEN** the same width and height are recovered, and a bare single number is read
  as a square board

### Requirement: Sokoban descriptions use the upstream run-length encoding

A Sokoban description SHALL encode the grid in row-major order as a run-length
sequence: a cell character optionally followed by a decimal repeat count. The character
alphabet SHALL cover space, wall, target, barrel, barrel-on-target, pit, deep pit,
player and player-on-target, and additionally labeled capital-letter barrels, so that
hand-authored level descriptions are supported even though the random generator emits
only a subset.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a state and re-encoded
- **THEN** the resulting description is identical

### Requirement: A Sokoban description is validated against the board

Validation SHALL reject a description whose decoded cell count does not equal the board
area, distinguishing "too much data" from "too little", SHALL reject a description with
no player or with more than one player, and SHALL reject unknown characters.

#### Scenario: A description of the wrong length is rejected

- **WHEN** a description whose decoded area differs from the board area is validated
- **THEN** it is rejected with a message distinguishing too much from too little data

#### Scenario: A description with no player is rejected

- **WHEN** a description containing no player cell is validated
- **THEN** it is rejected

### Requirement: Sokoban's keys step the player one cell at a time

The cursor keys and the bare number keys for the eight directions SHALL move the player
one cell. An orthogonal key move into a barrel SHALL push it when the square beyond can
accept a barrel. Diagonal input SHALL move the player only, never push, and only when
one of the two cells shared between source and destination is free (the NetHack rule).

#### Scenario: Pushing a barrel onto its target

- **WHEN** the player moves orthogonally into a barrel whose far side is a target
- **THEN** the barrel moves onto the target and is shown as filled, and the player
  advances into the vacated square

#### Scenario: A push blocked by a wall is rejected

- **WHEN** the player moves orthogonally into a barrel whose far side is a wall or
  another barrel
- **THEN** no move is made

#### Scenario: A diagonal step into a barrel

- **WHEN** the player presses a diagonal key toward a square a barrel stands on
- **THEN** no move is made

### Requirement: A tap walks the player and never pushes

A tap or click on a square the player can reach SHALL walk the player there, by any way
round, as one move, and SHALL never push.

#### Scenario: A tap walks and never pushes

- **WHEN** the player taps a square they can reach
- **THEN** the player walks there as one move
- **AND** a tap on a barrel, a wall or a square out of reach makes no move

### Requirement: A drag pushes a barrel as far as it reaches

A drag SHALL preview its push and on release make it as one move: held from the player
toward an orthogonally adjacent barrel, or held from a barrel the way it should go,
which walks the player round behind it first and aims only where the player can get
there. The barrel SHALL go one square for each tile the drag reached, no further than a
wall, another barrel or a pit stops it. A drag let go back where it started or off the
board SHALL make no move.

#### Scenario: A drag from the player pushes as far as it reaches

- **WHEN** the player drags from their square toward a barrel beside them, two tiles
  out, with room beyond the barrel
- **THEN** an arrow shows the barrel stopping two squares on, and letting go pushes it there

#### Scenario: A drag from a barrel walks round and pushes

- **WHEN** the player drags a barrel they are not beside two squares the way it should go
- **THEN** letting go walks the player behind it and pushes it two squares, as one move
- **AND** a drag of a barrel the player cannot get behind shows no arrow and makes no move

### Requirement: An illegal Sokoban move leaves no history

An illegal move SHALL produce no state change and no history entry.

#### Scenario: A step into a wall

- **WHEN** the player presses a direction key toward a wall
- **THEN** the board is unchanged and there is nothing new to undo

### Requirement: A pushed barrel fills a target or a pit

Pushing a barrel onto a target SHALL mark it filled. Pushing a barrel into a pit SHALL
consume the barrel and fill the pit to a space. Pushing a barrel into a deep pit SHALL
consume the barrel while the deep pit remains.

#### Scenario: A barrel pushed into a pit

- **WHEN** the player pushes a barrel into a pit
- **THEN** the barrel is gone and the pit's square is a space

### Requirement: Sokoban is complete when the board cannot become more complete

Completion SHALL be reached when the board cannot become any more complete: either no
barrel remains off a target, or no free target remains (no pit, no deep pit and no empty
target square), so that levels with spare barrels or pits still complete.

#### Scenario: The last barrel onto a target completes the level

- **WHEN** a move places the final off-target barrel onto a target so no free target
  and no free barrel remain
- **THEN** the game is reported solved and flashes

### Requirement: Sokoban rendering

Sokoban SHALL draw a pit, a deep pit and the player each as a disc, a pit and a deep
pit in colors of their own. The floor SHALL be the cell surface and the grid the
surface's grid line.

#### Scenario: A pit and the player are discs on the floor

- **WHEN** a board with a pit, a deep pit and the player is drawn
- **THEN** each is a disc on a square of the cell surface, and the two pits differ in color

### Requirement: A barrel is a square in the color for a thing the player pushes

A barrel SHALL be the collection's color for a thing the player pushes (the theme pair's
first member) and a square, so that it is told from the player's disc by shape as well
as color. A barrel's letter SHALL be white in both schemes.

#### Scenario: A labeled barrel shows its letter

- **WHEN** the board contains a capital-letter barrel
- **THEN** that barrel is drawn with its letter label

### Requirement: A wall is a flat gray block, and walls that touch are one mass

A wall SHALL have no bevel and SHALL be a gray that stands a clear step off the floor in
both schemes: darker than the floor in the light scheme and lighter than it in the dark
one. Walls that touch SHALL be drawn as one mass, with no grid line between them.

#### Scenario: A wall is a flat block

- **WHEN** a board with a wall is drawn
- **THEN** the wall's square is one rectangle in the wall's color
- **AND** nothing on the board is a bevel

### Requirement: A target is a ring in the color for where the player is going

A target SHALL be a ring in the collection's color for where the player is going (the
theme pair's second member), as wide inside as a barrel, so that an empty target is told
from the floor by color and a barrel or the player standing on one fills the ring and
leaves it showing.

#### Scenario: A barrel on a target is ringed in the target's color

- **WHEN** a barrel stands on a target
- **THEN** the target's ring is drawn under it in the target's color, and
  shows round the barrel

### Requirement: A Sokoban move animates along the route it walks

A move SHALL animate: the player along the route it walks, square by square, and a
pushed barrel with it once the player is behind it, briefly, so that a long walk does
not hold up play. An undo SHALL play the motion backward. A change that moves more than
one barrel (Solve's) SHALL be shown at once.

#### Scenario: A push animates the walk to it, then the push

- **WHEN** a drag pushes a barrel the player first has to walk round to
- **THEN** the player is drawn moving along the walk, then the player and the barrel
  together, and the settled frame leaves nothing of the motion behind

### Requirement: Sokoban generation is deterministic

Sokoban generation SHALL use a reverse-move generator over the shared seeded RNG, so
that a given seed always produces the same board and shared game IDs remain
reproducible. A level SHALL be generated exactly as upstream generates it.

#### Scenario: The same seed reproduces the same board

- **WHEN** the same size and seed are used twice to generate a game
- **THEN** both runs produce the identical description

#### Scenario: A new game produces a solvable board

- **WHEN** a new game is generated at a legal size
- **THEN** a board is produced with exactly one player and at least one barrel and
  target, and the board is solvable (it is constructed by reversing a solution)

### Requirement: Sokoban deals the first level its hint's search can finish

The board dealt SHALL be the first level from the seed's stream that the hint's search
finishes from its opening within a fixed budget, so that the hint does not refuse a
board as dealt.

#### Scenario: A level past the deal's budget is passed over

- **WHEN** the first level of a seed's stream is one the search cannot finish within the
  deal's budget
- **THEN** the board dealt is a later level of that stream, which the search finishes within it

### Requirement: A Sokoban deal generates a bounded number of levels

A deal SHALL generate no more than a number of levels fixed by the board's area: eight at
every menu size, and more on a larger board in proportion to how seldom the search
finishes a level there. Where the search finishes none of those before the last, the
deal SHALL deal the last as generated, which can be solved like every level, so that a
deal ends at every size.

#### Scenario: A deal ends where the search finishes no level

- **WHEN** a deal is made at a menu size with a budget in which the search finishes no level
- **THEN** the board dealt is the eighth level of the seed's stream

#### Scenario: A larger board is given more levels

- **WHEN** a deal is made on a board larger than the menu's with a budget in which the
  search finishes no level
- **THEN** the board dealt is a later level of the seed's stream than the eighth

### Requirement: Sokoban deals no level past the area its search can open

Sokoban SHALL refuse to deal a level on a board of more than 1200 squares, with a sentence
that names the limit, since the levels a deal must generate there to find one the hint can
open take longer than a player would wait. The refusal SHALL apply only when a level is to
be dealt: a board that arrives with its description SHALL load at any size.

#### Scenario: A board past the limit is refused when dealing

- **WHEN** the Custom dialog or a type link asks for a board whose width times height is
  more than 1200
- **THEN** no level is dealt and the refusal says the limit

#### Scenario: A board past the limit loads from its description

- **WHEN** a game ID carries a description for a board of more than 1200 squares
- **THEN** its params are accepted

### Requirement: Sokoban's hint offers one push, set against the barrel's other pushes

Sokoban's hint SHALL search for a line of pushes that finishes and offer one push, its
step's move being that push with the walk to it, played by a gesture that drags the
barrel the way it goes. Walking SHALL keep the step; the push SHALL complete it; any
other push SHALL drop it.

#### Scenario: Walking toward the hinted push

- **WHEN** a step is showing and the player taps a square on the way to the barrel
- **THEN** the step stays, and making the push it names completes it

### Requirement: The push Sokoban's hint offers shortens the plan

The plan SHALL be the search's line from the position, or the remainder of the line it
finds after that line's first push where that line comes straight back through the
position and its remainder is the shorter. The offered push SHALL be one after which the
line the search finds is shorter than the plan, wherever the hint finds such a push
within the positions a request is allowed; otherwise it SHALL be the plan's first push.

#### Scenario: Following the hint never returns to a position

- **WHEN** the hint is asked, its push made, and the hint asked again, until the board is solved
- **THEN** no position repeats, on a board where offering the plan's first push alone cycles

#### Scenario: A line that comes straight back does not send the barrel back

- **WHEN** the hint is asked on a position where the line the search finds after its own first
  push is longer and opens by undoing that push
- **THEN** following the hint from there reaches the solved board without repeating a position

### Requirement: A Sokoban hint step leads with a push that would leave a barrel stuck

A step SHALL lead with another push of the same barrel that would leave a barrel stuck
for good (in a corner, where no push can bring it to a target, or unable ever to move),
striped.

#### Scenario: A push that would corner the barrel is striped

- **WHEN** another push of the barrel the hint offers would wedge it in a corner off every target
- **THEN** the step stripes that push, says it would wedge the barrel in a corner it can never
  leave, and offers its push as one way to avoid that

### Requirement: A Sokoban hint step says only what judging the barrel's other pushes settled

Where no other push of the barrel would leave a barrel stuck for good, a step SHALL judge
the barrel's other pushes through `judgeRivals` and say only what the judging settled:
that no other push of the barrel can finish, or that it can finish only along the arrows
drawn on it, or along them but not every way.

#### Scenario: Every other push of the barrel is lost

- **WHEN** the judging settles every other push of the offered barrel and none can finish
- **THEN** the step says no other push of the barrel can still finish

### Requirement: A Sokoban hint step with nothing judged says what its push does

Where no trap leads and the judging settled nothing to say, a step SHALL say what the
push does to the order the barrels go home in, as the requirement on order sets out.
Otherwise it SHALL say whether the push puts the barrel on a target, or else whether it
lets the player out, which it SHALL say only where the push opens at least four times as
many squares to the player as they could walk to.

#### Scenario: A push onto a target with nothing else to say

- **WHEN** the offered push puts its barrel on a target, and no trap, judging or order
  gives the step anything to say
- **THEN** the step says the push puts the barrel on a target

### Requirement: Sokoban's hint refuses a position it cannot finish

The hint SHALL refuse, outlining the barrel, when a barrel off its target is already
stuck for good, and SHALL refuse with `NO_SOLUTION_FROM_HERE` when the search proves no
line finishes and with `SEARCH_OUT_OF_REACH` past its reach.

#### Scenario: A stuck barrel is outlined as the reason to undo

- **WHEN** the hint is asked with a barrel off its target in a corner
- **THEN** it refuses as a dead end, outlining that barrel

### Requirement: Sokoban's Solve finishes from the player's position, or else from the dealt board

Sokoban's Solve SHALL search for a line from the player's position and, failing that, from the
board as dealt, and SHALL leave the finished board that line reaches. Its move SHALL carry the
finished board as a game ID writes it, and SHALL be refused on a board whose walls differ.

#### Scenario: A lost position is solved from the dealt board

- **WHEN** Solve is asked on a position a pushed-in barrel has lost
- **THEN** it leaves a solved board, found from the board as dealt

### Requirement: Sokoban's hint says what a push does to the order the barrels go home in

Where no trap leads and the judging settled nothing to say, a step SHALL say one of two
things about order, each only where the hint has checked it, the first before the second:
that a barrel on another empty target would wall off the target this push fills, or that
this barrel keeps another from reaching a target. The two requirements that follow say
what each has checked.

#### Scenario: Filling first is said before clearing a way

- **WHEN** the offered push both fills a target another empty target would wall off and
  moves a barrel that keeps another from a target
- **THEN** the step says the first

### Requirement: The hint says a target must be filled first only where another would wall it off

A step SHALL say that a barrel on another empty target, which the step outlines, would
wall off the target this push fills only where it has checked that, with a barrel
standing there, no barrel could be pushed onto this target from any square, on a board
with no other barrel. It SHALL say so only on a board where every target has to be
filled.

#### Scenario: The far target of a corridor is filled first

- **WHEN** the hint's push fills a target that can only be pushed onto from one side, and the
  square a barrel or the player would need for that is another empty target
- **THEN** the step outlines that other target, says a barrel on it would wall off the ringed
  one, and offers the push as filling that one first

### Requirement: The hint says a barrel is in another's way only where moving it alone opens the way

A step SHALL say that this barrel keeps another, which the step outlines, from reaching
a target only where it has checked that pushing only that barrel, with every other
barrel where it stands, brings it to no empty target; that with this barrel lifted off
the board it would; and that after this push it does. It SHALL NOT say so where the push
lets the player out.

#### Scenario: A barrel in another's way is pushed aside

- **WHEN** the hint's push moves a barrel that alone keeps another barrel from being pushed to
  any empty target
- **THEN** the step outlines the other barrel and says the push opens a way, and pushing only
  the outlined barrel from the board the push leaves can bring it to a target

### Requirement: A barrel's run of pushes onto a target is one journey

Where a step has nothing else to say of its push and the plan goes on pushing the same
barrel until it stands on a target, in two to five pushes each of which shortens the
line the search finds, the hint SHALL give those pushes as one journey: its first step
counting the pushes, the later steps continuing it, and the last saying that it puts the
barrel on a target.

#### Scenario: A barrel's run to a target is one journey

- **WHEN** the plan opens with two or more pushes of one barrel that end with it on a target,
  and nothing else is said of the first
- **THEN** the hint returns those pushes as one journey whose first step counts them and whose
  last step puts the barrel on a target

### Requirement: Sokoban's search leaves out only what a finishing line can do without

Sokoban's search SHALL report a position lost only where no line of pushes finishes from
it, and SHALL report a line only where each of its pushes can be made and the last
leaves the board finished. What it leaves out SHALL be only what a finishing line can do
without, as a position that is lost for good is, and as the pushes are that the
requirement on a fenced floor names.

#### Scenario: The verdicts agree with trying every push

- **WHEN** the search is asked, with a budget it cannot exhaust, on positions of boards small
  enough for every push to be tried, some of them lost
- **THEN** it reports a line exactly where trying every push finds one, the line plays to a
  finished board, and it reports the position lost everywhere else

### Requirement: Sokoban's search keeps to the pushes into a fenced floor only where it has to be opened

The search SHALL keep to the pushes into floor the player cannot walk to, searching no
other push from the position, only where that floor is fenced by barrels whose every
possible push either goes into that floor and can be made now, or waits on another of
those barrels moving, and one of those barrels is off a target or a target inside is
empty.

#### Scenario: Only the pushes into a corral that has to be opened are searched

- **WHEN** a barrel off its target shuts a corridor the player cannot reach, and can only be
  pushed into it
- **THEN** the pushes searched from that position are the pushes into such a corridor, and no
  push of a barrel elsewhere

#### Scenario: A corral that can be left shut prunes nothing

- **WHEN** the only barrel shutting a corridor stands on its target and no target lies behind it
- **THEN** every push the player can make is searched

### Requirement: Sokoban's search orders by distance and counts its budget in positions

How far a push is from the nearest barrel or target still out of place SHALL only order
the positions searched, and SHALL never remove one. The search SHALL count its budget in
positions and never in time, so that a position's verdict is the same on every machine.

#### Scenario: A generated level of the largest menu size is within a deal's budget

- **WHEN** the search is asked on the opening of a generated level of the largest menu
  size that, without pushes ordered by their distance from what is out of place, it does
  not finish within many times the budget a deal allows
- **THEN** it finds a line within the budget a deal allows
