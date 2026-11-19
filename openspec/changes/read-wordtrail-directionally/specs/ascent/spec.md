## MODIFIED Requirements

### Requirement: Look: The board's own path stands off both surfaces

The path the board draws between consecutive numbers SHALL be the collection's
strong gray, which stands off the plain and the lifted surface in both
schemes: dark on a light board and light on a dark one. Between two
consecutive numbers it SHALL be the engine's arrowhead, across their shared
side and pointing to the higher, and the first number SHALL wear the engine's
start ring in it. A number on a path SHALL be drawn on a disc of its cell's
surface, and an end's disc over the line into it, so no line runs under a
digit. The path the player draws SHALL keep the entry color.

#### Scenario: The board's own path reads on both surfaces

- **WHEN** a number is typed next to its neighbor in the sequence
- **THEN** the preview of the link joining them is drawn in the color of the
  board's own path, which is neither surface's

#### Scenario: The path says which way it runs

- **WHEN** a board with consecutive numbers placed side by side is drawn
- **THEN** each pair is joined by an arrowhead pointing to the higher, drawn
  over the grid line it sits across, and 1 is ringed
