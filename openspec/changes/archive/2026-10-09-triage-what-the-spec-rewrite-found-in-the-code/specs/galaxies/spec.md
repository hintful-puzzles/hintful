## MODIFIED Requirements

### Requirement: A press that ends far from where it began commits nothing

A press that did not become a drag and ends far from where it began SHALL
commit nothing at all. That is the shape the frontend's pointer cancellation
synthesizes, as a drag off the canvas's top left corner and then a release
there, and it SHALL NOT toggle an edge on the far side of the board, nor lift
the arrow under the press. A drag that has already moved its target off its
source tile is not covered: canceled, it is released off the board.

#### Scenario: A canceled press toggles no edge

- **WHEN** a left press is followed, with no drag between, by a release far
  from the press point
- **THEN** no edge toggles and no history entry is added

#### Scenario: A canceled press leaves the arrow under it

- **WHEN** a tile that carries an arrow is pressed with either button, or by a
  finger held past the touch hold, and the press is canceled before the
  pointer moves
- **THEN** the arrow and its partner's stay, and no history entry is added

### Requirement: A bare right click on an empty cell does nothing

A right click on an empty tile, without a drag, SHALL commit nothing. The
cell-to-dot gesture is a drag, and a click SHALL NOT associate a cell with
whichever dot happens to be nearest. A right press on a dot that sits on an
edge or a corner starts its drag aimed at the tile under the pointer, so a
click there SHALL commit that tile and its partner to the dot, both of them
cells the dot sits on.

#### Scenario: A bare right click on an empty cell

- **WHEN** the player right-clicks an empty tile without dragging
- **THEN** nothing is committed

#### Scenario: A bare right click on a dot on an edge

- **WHEN** the player right-clicks, without dragging, a dot that sits on the
  edge between two cells
- **THEN** both cells gain an arrow to that dot, as one history entry

### Requirement: Only an association some galaxy could contain is offered

A drag SHALL offer a (cell, dot) pair only if the cell is reachable from the dot
by a connected, 180°-symmetric region that avoids every other dot's own tiles.
That test SHALL depend on the dot layout alone, so one mistaken arrow cannot
veto a correct one elsewhere. The player's walls are read for one thing: a tile
inside a locally valid region, or whose partner is, SHALL NOT be offered. The
check SHALL NOT run the deduction chain, which would narrow the offer to an
answer.

#### Scenario: A wrong arrow elsewhere does not change the offer

- **WHEN** the player has associated a neighboring cell with the wrong dot and
  then aims a drag at a (cell, dot) pair
- **THEN** the pair is offered or not exactly as it was before that arrow

### Requirement: A hint step's action is a move the game already has

A step's action SHALL be a move the game already has: the committed
association, or a wall the board forces. A firing that claims a cell SHALL
claim its 180° partner in the same step, because the game commits the pair
atomically and a separate leg for the partner would be a move that changes
nothing. The step's sentence SHALL name the partner, and the hint's legend
SHALL say why the two travel together: the partner is the square opposite the
dot, and the same arrow brings it along.

#### Scenario: The partner comes in the same step

- **WHEN** a hint step settles a tile whose 180° partner is a different tile
- **THEN** the step's one move associates both, and no later step is spent on
  the partner

#### Scenario: A step that brings a partner

- **WHEN** a step's sentence reads "it and its partner"
- **THEN** the sentence does not explain the symmetry, and the legend's entry
  for the ring does
