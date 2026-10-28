## MODIFIED Requirements

### Requirement: A note a step rules out is struck

The engine SHALL own a fourth mark role, the strike, with the noun "strike"
and the adjective "struck": a candidate note a step rules out SHALL be marked
by an X the engine draws, one size for every note of a board and inside its
cell, and SHALL NOT be ringed, nor ring the cell it sits in. A cell whose
notes a step strikes, where its words name it, SHALL be outlined, or striped
where an outlined region already holds it.

#### Scenario: An elimination strikes its notes

- **WHEN** a candidate game's step rules out 8 and 9 in a cell
- **THEN** each of the two notes has an X through it in the strike's
  reference color, and the cell has no ring
- **AND** the notes keep the size they have without a hint

#### Scenario: The cell a strike's premise names is outlined

- **WHEN** a Keen step reads "No way to make this cage multiply to 4 puts 4
  in this cell, so the 4 must go"
- **THEN** "this cell" is outlined in a reference color of its own, and "the
  4" is the X on the note
- **AND** pressing "this cell" points its leader at the cell's outline, not
  at the X

#### Scenario: A struck cell on an outlined sightline is striped

- **WHEN** an Undead step reads "This sightline's 1 and 1 leave no room for a
  ghost or vampire in this cell"
- **THEN** "this cell" is striped, since the sightline's outline already
  holds it

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

## ADDED Requirements

### Requirement: A reference's marks are on the thing its words name

A reference SHALL mark the thing its words name, so that pressing it shows
that thing. A deictic ("this cell", "the struck note") SHALL NOT be built
over an element drawn inside another, such as a note in its cell, which is
named by its value. Redrawing a reference SHALL change only its role, never
the elements it marks.

#### Scenario: A deictic over a note is refused

- **WHEN** a sentence is built with `mark.this` or `mark.the` over a note
- **THEN** building it throws, and the note is named by its value ("the 4")

#### Scenario: A remark keeps the elements

- **WHEN** the candidate walk redraws a premise's "this cell" for a strike
- **THEN** the reference is an outline on the same cell, in the same words

### Requirement: A role's word singles its mark out

A reference that says its role's word on a bare noun ("an outlined cell")
SHALL NOT share its sentence with another reference in that role, said with
the same noun, that marks other elements. Another noun, value or modifier
tells them apart ("the outlined tent", "another outlined cell").

#### Scenario: The wing names its ends beside the outlined struck cell

- **WHEN** a wing strikes in a cell with notes
- **THEN** its sentence reads "another outlined cell in line with this cell",
  since "this cell" is outlined too

### Requirement: A reference is measured by the marks it takes away

When the app measures a reference's marks by drawing the board with and
without it, a pixel that the hint inks cover more without the reference
SHALL NOT count as its mark: that is another mark drawn in its absence.

#### Scenario: Two touching outlines

- **WHEN** two outline references mark adjacent cells, joined into one
  contour
- **THEN** each reference's repainted color lies only on its own cell's
  sides, and none is painted where the shared side would be

#### Scenario: A striped reference is pressed

- **WHEN** the player presses "this cage" on a Keen cage step
- **THEN** a leader runs from the pill to the nearest of the cage's stripes,
  although stripes are drawn translucent
