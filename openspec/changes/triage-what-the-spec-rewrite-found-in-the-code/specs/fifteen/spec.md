## MODIFIED Requirements

### Requirement: A Fifteen hint step says whether its slide places a tile home

Each step's narration SHALL say why the move matters, naming the goal tile it
works toward its home: one tile, held until it is home. A step landing the
goal in its solved cell SHALL say it slides into place. A step landing another
tile in its solved cell SHALL say so only when no later slide of the plan
moves that tile; otherwise, like any other setup slide, it SHALL say the tile
slides out of the way.

#### Scenario: Narration distinguishes a home move from a setup move

- **WHEN** a step lands a tile in its solved cell, and no later step of the
  plan slides that tile
- **THEN** its narration states that the tile is being placed home
- **WHEN** a step only maneuvers (it does not land a tile in its solved cell)
- **THEN** its narration states it is a setup move and names the goal tile
  being worked toward its home

#### Scenario: A tile carried through its own home

- **WHEN** the gap's way round carries a tile into its solved cell and a later
  step of the plan slides it out again
- **THEN** the step says that tile slides out of the way

#### Scenario: The goal stays through a restoration

- **WHEN** placing the last tile of a line displaces a tile already home and
  slides it back
- **THEN** every step of that rotation names the same goal tile, and the slide
  back says the displaced tile slides into place

#### Scenario: A placed goal that the next rotation displaces

- **WHEN** a goal tile is home and the rotation placing the next tile of its
  line slides it away and back
- **THEN** the step that first homed it said it slides into place, and the
  slide back says so again
