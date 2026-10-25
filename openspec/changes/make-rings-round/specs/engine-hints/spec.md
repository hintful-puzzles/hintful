## ADDED Requirements

### Requirement: A ring is round, and only the engine draws one

Every mark in the ring role SHALL be round: a circle around a square element,
a pill around an elongated one. The engine SHALL draw it, and a game SHALL
have no way to draw in the ring's ink but the engine's ring, so the word
"ringed" names a round mark in every game.

#### Scenario: A game asks for a ring

- **WHEN** a hint step rings a cell, a note, an edge, a span or a piece
- **THEN** the mark on the board is a circle or a pill around that element
- **AND** nothing else in the frame is drawn in the ring's ink

#### Scenario: Ring and outline differ in shape

- **WHEN** a step rings one square and outlines another of the same size
- **THEN** the ring is round and the outline has square corners, so the two
  are told apart without their colors

### Requirement: A move's shape is shown inside its ring

Where a game shows the shape its move will take (a line or a cross on an
edge, a bridge across a span), that shape SHALL be drawn inside the element's
ring and within it, and SHALL NOT stand in for the ring.

#### Scenario: An edge step echoes its line

- **WHEN** a Tracks or Path step asks for a line on an edge
- **THEN** the edge is ringed by a pill, and the line is drawn inside the pill

## MODIFIED Requirements

### Requirement: A hint mark is drawn on the cell's border

The outline SHALL be drawn on the space the cell's border already occupies,
the gutter between cells or the cell's own outermost pixels according to the
game's layout, so it costs the content no room. Where the border belongs to a
game object in its own right, a wall in Galaxies or Palisade, the outline
SHALL be inset inside the cell instead, so it cannot be read as that object.

#### Scenario: A mark never impersonates a game object

- **WHEN** a game draws its own objects on the cell border, a wall between two
  cells, say
- **THEN** the hint's outline is inset inside the cell instead, and its ring
  is round, so that neither mark can be read as one of those objects

### Requirement: A piece a hint acts on is ringed as one shape

Where a hint step acts on a piece spanning several squares (a domino it places,
a domino it decides whole), the target mark SHALL be one round ring around the
whole piece, and not a ring per square.

#### Scenario: A domino placement is one ring

- **WHEN** a Dominosa hint step asks the player to place a domino
- **THEN** the target mark is one pill around its two squares
- **AND** a barrier step's two squares are still ringed one each, with the wall
  between them marked

#### Scenario: A domino decided whole is one ring

- **WHEN** a Magnets hint step decides a whole domino (neutral, or marked `?`)
- **THEN** the target mark is one pill around both ends, drawn by the engine
  and not by a pass of the game's own

### Requirement: The shared painter joins a piece from the game's relation

The shared hint-mark painter SHALL own the drawing, and a game SHALL supply
only which squares belong together: a relation for the targets, and optionally
one for the evidence when the evidence is whole pieces, so that two pieces side
by side stay two shapes and not one that is not on the board. Without a
relation, each target square SHALL be ringed alone and evidence SHALL be
outlined as one contour per connected region, exactly as for a game with no
pieces.

#### Scenario: A game with no pieces is unchanged

- **WHEN** a game supplies no piece relation
- **THEN** each target square has a round ring of its own and a contiguous
  evidence region is one contour
