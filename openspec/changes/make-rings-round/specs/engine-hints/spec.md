## ADDED Requirements

### Requirement: A ring is round, and only the engine draws one

Every mark in the ring role SHALL be round, as round as the element's content
allows and never rounder than a corner radius of a third of its short side
less, and SHALL NOT cover any of the content's text. The engine SHALL draw it,
and a game SHALL have no way to draw in the ring's ink but the engine's ring,
so "ringed" names a round mark in every game.

#### Scenario: A ring clears the content

- **WHEN** a step rings a cell holding a digit or pencil notes
- **THEN** no stroke of the ring, nor its edge, crosses the cell's text, nor
  the text of a neighbor it reaches past the cell into
- **AND** a cell with nothing at its corners is ringed by a circle

#### Scenario: A placement crosses only the notes it replaces

- **WHEN** a step places a value in a cell that shows notes
- **THEN** the cell's ring may cross that cell's own notes, and no other text

### Requirement: A note a step rules out is struck

The engine SHALL own a fourth mark role, the strike, with the noun "strike"
and the adjective "struck": a candidate note a step rules out SHALL be marked
by a line through it, and SHALL NOT be ringed, nor ring the cell it sits in.

#### Scenario: An elimination strikes its notes

- **WHEN** a candidate game's step rules out 8 and 9 in a cell
- **THEN** each of the two notes has a line through it in the strike's
  reference color, and the cell has no ring
- **AND** the notes keep the size they have without a hint

#### Scenario: An element that cannot be ringed round is not ringed

- **WHEN** a game asks for a ring around an element whose content leaves no
  room for a round one
- **THEN** drawing the ring throws, naming the element, and the game pads
  its content or marks that element with another role

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

### Requirement: The engine SHALL own the hint mark roles and the words for them

The engine SHALL define the roles a hint mark plays, each with one meaning in
every game: a ring marks what the step decides, an outline marks what the step
reasons from, stripes mark the line or region the sentence names, and a strike
marks a note the step rules out. The engine SHALL own each role's noun and
adjective ("ringed", "outlined", "striped", "struck"). A game SHALL add a role
only when none of the four fits, and the change adding it SHALL say why.

#### Scenario: A literal says a mark's word

- **WHEN** a hint sentence is built with a literal "this", "these", a role's
  adjective, or a retired mark word ("hatched", "highlighted") outside a
  reference to a mark
- **THEN** building the sentence throws, naming the word

#### Scenario: A reference uses another role's word

- **WHEN** a reference to a ring says "the striped row"
- **THEN** building the sentence throws, because the words and the mark disagree

#### Scenario: A shading genre says its rules' word

- **WHEN** a hint sentence in a game whose rules shade cells says a cell "must
  be shaded"
- **THEN** the sentence builds, because "shaded" is the cell's state there and
  not a mark's word

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
