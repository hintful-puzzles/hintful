# sokoban Specification

## Purpose
Sokoban, the puzzle of pushing, never pulling, every barrel onto a target, where
no barrel can be pushed into a wall or another barrel. This capability specifies
its port to the TS engine: movement and pushing, completion, reproducible
generation that is solvable by construction, and rendering.

## Requirements

### Requirement: Sokoban game implements the Game interface

The engine SHALL provide `src/games/sokoban/` implementing the `Game`
interface for Sokoban, registered so the puzzle is served by the TypeScript engine.

Sokoban SHALL support rectangular boards parameterized by width and height (both at
least 4), with presets 10×12, 12×16 and 16×20 (upstream's sizes, turned to draw taller
than wide). Sokoban SHALL implement `solve` and `hint`, both by searching within a budget.
Because every reachable position is legal and any line of pushes that fills the targets
wins, it SHALL NOT implement `findMistakes`; Check & Save SHALL ask the hint whether the
position is a dead end instead.

#### Scenario: A new game produces a solvable board

- **WHEN** a new game is generated at a legal size
- **THEN** a board is produced with exactly one player and at least one barrel and
  target, and the board is solvable (it is constructed by reversing a solution)

#### Scenario: Parameters round-trip

- **WHEN** a parameter string naming a width and height is encoded and decoded
- **THEN** the same width and height are recovered, and a bare single number is read
  as a square board

### Requirement: Sokoban descriptions use the upstream run-length encoding

A Sokoban description SHALL encode the grid in row-major order as a run-length
sequence: a cell character optionally followed by a decimal repeat count. The
character alphabet SHALL cover space, wall, target, barrel, barrel-on-target, pit,
deep pit, player and player-on-target, and additionally labeled capital-letter
barrels and their on-target forms, so that hand-authored level descriptions are
fully supported even though the random generator emits only a subset.

Validation SHALL reject a description whose decoded cell count does not equal the
board area, distinguishing "too much data" from "too little", SHALL reject a
description with no player or with more than one player, and SHALL reject unknown
characters.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a state and re-encoded
- **THEN** the resulting description is identical

#### Scenario: A description of the wrong length is rejected

- **WHEN** a description whose decoded area differs from the board area is validated
- **THEN** it is rejected with a message distinguishing too much from too little data

#### Scenario: A description with no player is rejected

- **WHEN** a description containing no player cell is validated
- **THEN** it is rejected

### Requirement: Sokoban movement, pushing and completion

Sokoban SHALL be played by moving the player one cell at a time via the cursor keys or
the bare number keys for the eight directions, by a tap or click on a square the player
can reach, which walks there by any way round as one move and never pushes, and by a
drag, which previews the push and on release makes it as one move: held from the player
toward an orthogonally adjacent barrel, or held from a barrel the way it should go, which
walks the player round behind it first and aims only where the player can get there.
The barrel SHALL go one square for each tile the drag reached, no further than a wall,
another barrel or a pit stops it. A drag let go back where it started or off the board
SHALL make no move. Orthogonal key moves into a barrel
SHALL push it when the square beyond can accept a barrel; diagonal input SHALL move the
player only, never push, and only when one of the two cells shared between source and
destination is free (the NetHack rule). An illegal move SHALL produce no state change
and no history entry.

Pushing a barrel onto a target SHALL mark it filled; pushing a barrel into a pit
SHALL consume the barrel and fill the pit to a space; pushing a barrel into a deep
pit SHALL consume the barrel while the deep pit remains. Undo and redo SHALL be
provided by the engine with no game-specific state.

Completion SHALL be reached when the board cannot become any more complete — either
no barrel remains off a target, or no free target remains (no pit, no deep pit and
no empty target square) — so that levels with spare barrels or pits still complete.

#### Scenario: Pushing a barrel onto its target

- **WHEN** the player moves orthogonally into a barrel whose far side is a target
- **THEN** the barrel moves onto the target and is shown as filled, and the player
  advances into the vacated square

#### Scenario: A push blocked by a wall is rejected

- **WHEN** the player moves orthogonally into a barrel whose far side is a wall or
  another barrel
- **THEN** no move is made

#### Scenario: The last barrel onto a target completes the level

- **WHEN** a move places the final off-target barrel onto a target so no free target
  and no free barrel remain
- **THEN** the game is reported solved and flashes

#### Scenario: A tap walks and never pushes

- **WHEN** the player taps a square they can reach
- **THEN** the player walks there as one move
- **AND** a tap on a barrel, a wall or a square out of reach makes no move

#### Scenario: A drag from the player pushes as far as it reaches

- **WHEN** the player drags from their square toward a barrel beside them, two tiles
  out, with room beyond the barrel
- **THEN** an arrow shows the barrel stopping two squares on, and letting go pushes it there

#### Scenario: A drag from a barrel walks round and pushes

- **WHEN** the player drags a barrel they are not beside two squares the way it should go
- **THEN** letting go walks the player behind it and pushes it two squares, as one move
- **AND** a drag of a barrel the player cannot get behind shows no arrow and makes no move

### Requirement: Sokoban rendering

Sokoban SHALL render each cell as its content — walls with a beveled face, targets,
pits, deep pits, the player and barrels as discs, and labeled barrels with their
letter — over grid lines drawn once, on the ground the midend lays. A move SHALL
animate: the player along the route it walks, square by square, and a pushed barrel
with it once the player is behind it, briefly, so that a long walk does not hold up
play; an undo SHALL play the motion backward. A change that moves more than one
barrel (Solve's) SHALL be shown at once. The board SHALL flash on completion.

#### Scenario: A completed board flashes

- **WHEN** a move transitions the board from not-completed to completed
- **THEN** the board flashes for the completion flash duration and then settles

#### Scenario: A labeled barrel shows its letter

- **WHEN** the board contains a capital-letter barrel
- **THEN** that barrel is drawn with its letter label

#### Scenario: A push animates the walk to it, then the push

- **WHEN** a drag pushes a barrel the player first has to walk round to
- **THEN** the player is drawn moving along the walk, then the player and the barrel
  together, and the settled frame leaves nothing of the motion behind

### Requirement: Sokoban generation is deterministic

Sokoban generation SHALL use a reverse-move generator over the shared seeded RNG,
so that a given seed always produces the same board
and shared game IDs remain reproducible. A level SHALL be generated exactly as upstream
generates it, and the board dealt SHALL be the first such level from the seed's stream that
the hint's search finishes from its opening within a fixed budget, so that the hint never
refuses a board as dealt.

#### Scenario: The same seed reproduces the same board

- **WHEN** the same size and seed are used twice to generate a game
- **THEN** both runs produce the identical description

### Requirement: Sokoban's hint offers one push, set against the barrel's other pushes

Sokoban's hint SHALL search for a line of pushes that finishes and offer one push, its step's
move being that push with the walk to it, played by a gesture that drags the barrel the way it
goes.
Walking SHALL keep the step; the push SHALL complete it; any other push SHALL drop it. The
offered push SHALL be one after which the line the search finds is shorter than the plan,
wherever some push is, and the plan SHALL be the search's line from the position, or the
remainder of the line it finds after that line's first push where that line comes straight back
through the position and its remainder is the shorter.

A step SHALL lead with another push of the same barrel that would leave a barrel stuck for good
(in a corner, where no push can bring it to a target, or unable ever to move), striped. Otherwise
it SHALL judge the barrel's other pushes through `judgeRivals` and say only what the judging
settled: that no other push of the barrel can finish, or that it can finish only along the
arrows drawn on it, or along them but not every way. Otherwise it SHALL say what the push does
to the order the barrels go home in, as the requirement on order sets out. Otherwise it SHALL
say whether the push
puts the barrel on a target, or else whether it lets the player out, which it SHALL say only
where the push opens at least four times as many squares to the player as they could walk to. The hint SHALL refuse, outlining the barrel, when a barrel off its
target is already stuck for good, and SHALL refuse with `NO_SOLUTION_FROM_HERE` when the search
proves no line finishes and with `SEARCH_OUT_OF_REACH` past its reach.

#### Scenario: A push that would corner the barrel is striped

- **WHEN** another push of the barrel the hint offers would wedge it in a corner off every target
- **THEN** the step stripes that push, says it would wedge the barrel in a corner it can never
  leave, and offers its push as one way to avoid that

#### Scenario: Following the hint never returns to a position

- **WHEN** the hint is asked, its push made, and the hint asked again, until the board is solved
- **THEN** no position repeats, on a board where offering the plan's first push alone cycles

#### Scenario: A line that comes straight back does not send the barrel back

- **WHEN** the hint is asked on a position where the line the search finds after its own first
  push is longer and opens by undoing that push
- **THEN** following the hint from there reaches the solved board without repeating a position

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

Where no trap leads and the judging settled nothing to say, a step SHALL say one of two things
about order, each only where the hint has checked it, the first before the second:

- that a barrel on another empty target, which the step outlines, would wall off the target this
  push fills: with a barrel standing there, no barrel could be pushed onto this target from any
  square, on a board with no other barrel. It SHALL say so only on a board where every target
  has to be filled.
- that this barrel keeps another, which the step outlines, from reaching a target: pushing only
  that barrel, with every other barrel where it stands, brings it to no empty target; with this
  barrel lifted off the board it would; and after this push it does. It SHALL NOT say so where
  the push lets the player out.

Where a step has nothing else to say of its push and the plan goes on pushing the same barrel
until it stands on a target, in two to five pushes each of which shortens the line the search
finds, the hint SHALL give those pushes as one journey: its first step counting the pushes, the
later steps continuing it, and the last saying that it puts the barrel on a target.

#### Scenario: The far target of a corridor is filled first

- **WHEN** the hint's push fills a target that can only be pushed onto from one side, and the
  square a barrel or the player would need for that is another empty target
- **THEN** the step outlines that other target, says a barrel on it would wall off the ringed
  one, and offers the push as filling that one first

#### Scenario: A barrel in another's way is pushed aside

- **WHEN** the hint's push moves a barrel that alone keeps another barrel from being pushed to
  any empty target
- **THEN** the step outlines the other barrel and says the push opens a way, and pushing only
  the outlined barrel from the board the push leaves can bring it to a target

#### Scenario: A barrel's run to a target is one journey

- **WHEN** the plan opens with two or more pushes of one barrel that end with it on a target,
  and nothing else is said of the first
- **THEN** the hint returns those pushes as one journey whose first step counts them and whose
  last step puts the barrel on a target
