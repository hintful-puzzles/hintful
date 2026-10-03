## MODIFIED Requirements

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

### Requirement: Sokoban's hint offers one push, set against the barrel's other pushes

Sokoban's hint SHALL search for a line of pushes that finishes and offer one push, its step's
move being that push with the walk to it, played by a gesture that drags the barrel the way it
goes.
Walking SHALL keep the step; the push SHALL complete it; any other push SHALL drop it. The
offered push SHALL be one after which the line the search finds is shorter than the one it finds
before it, so following the hint cannot return to a position.

A step SHALL lead with another push of the same barrel that would leave a barrel stuck for good
(in a corner, where no push can bring it to a target, or unable ever to move), striped. Otherwise
it SHALL judge the barrel's other pushes through `judgeRivals` and say only what the judging
settled: that no other push of the barrel can finish, or that it can finish only along the
arrows drawn on it, or along them but not every way. Otherwise it SHALL say whether the push
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

#### Scenario: A stuck barrel is outlined as the reason to undo

- **WHEN** the hint is asked with a barrel off its target in a corner
- **THEN** it refuses as a dead end, outlining that barrel

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
