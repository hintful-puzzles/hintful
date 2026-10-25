## MODIFIED Requirements

### Requirement: The engine colors every hint mark

A hint mark's color and edge SHALL be the engine's, the same on the screen
and in an exported image. A game SHALL draw a ring with the engine's ring, an
outline in `HINT_OUTLINE` and stripes with the engine's hatch, and a mark in
no other hint color; the ring's and the stripes' inks SHALL be the engine's,
in no game's palette. The app SHALL find a mark drawn in an ink on content of
any color, and SHALL keep the ink's own coverage when it repaints it.

#### Scenario: Copy image while a hint shows

- **WHEN** a player copies the board's image while a hint is displayed
- **THEN** the image shows each reference's marks in the colors the screen
  shows them in

#### Scenario: A ring on content of its own color

- **WHEN** a step rings a piece drawn in the ring ink's own color
- **THEN** the ring is repainted whole, in its reference's color and edged

#### Scenario: Stripes keep the hatch's weight

- **WHEN** a step stripes a line
- **THEN** its reference's color is laid only as far as the hatch covers, and
  the content drawn over the hatch keeps its own color

#### Scenario: A game draws a mark in a color of its own

- **WHEN** a game draws a hint mark in any color but its role's ink, other
  than a mark that restyles the content in the content's own color
- **THEN** the cross-game ink guard fails and names the game and the role

#### Scenario: A game cannot hold the ring's ink

- **WHEN** a game's palette holds the ring's ink in a slot of its own
- **THEN** resolving the palette throws, naming the game
