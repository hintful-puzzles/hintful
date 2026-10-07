## MODIFIED Requirements

### Requirement: Sokoban rendering

Sokoban SHALL render each cell as its content — walls as flat blocks, targets,
pits, deep pits, the player and barrels as discs, and labeled barrels with their
letter — over grid lines drawn once, on the ground the midend lays. The floor
SHALL be the cell surface and the grid the surface's grid line. A wall SHALL
have no bevel and SHALL be a gray that stands a clear step off the floor in
both schemes: darker than the floor in the light scheme and lighter than it in
the dark one. Walls that touch SHALL be drawn as one mass, with no grid line
between them. A target SHALL be a ring in a hue of its own, as wide inside as
a barrel, so that an empty target is told from the floor by color and a barrel
or the player standing on one fills the ring and leaves it showing. A
barrel's letter SHALL be white in both schemes. A move SHALL
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

#### Scenario: A wall is a flat block

- **WHEN** a board with a wall is drawn
- **THEN** the wall's square is one rectangle in the wall's color
- **AND** nothing on the board is a bevel

#### Scenario: A barrel on a target is ringed in the target's color

- **WHEN** a barrel stands on a target
- **THEN** the target's ring is drawn under it in the target's color, and
  shows round the barrel
