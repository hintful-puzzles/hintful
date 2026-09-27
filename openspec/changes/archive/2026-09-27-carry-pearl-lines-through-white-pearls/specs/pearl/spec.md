## MODIFIED Requirements

### Requirement: Pearl's hint draws a black pearl's arm whole

A hint step SHALL also draw, in the same step and the same move, every open edge the pearls' rules carry on from the lines it draws, and from those in turn: a line leaving a black pearl runs on through the next square, and a line entering a white pearl leaves by the opposite edge. The black pearl's own sentence SHALL say its line runs through the next square, and a step that carries a line through a white pearl SHALL say so in a second sentence. No step SHALL draw a carried line its sentence does not name.

#### Scenario: A black pearl's forced edge comes with its run-on

- **WHEN** a hint step decides that the edge beside a black pearl must be a line,
  and the far edge of the square past it is open
- **THEN** the step asks for both lines, and its sentence says the pearl's line
  must run that way through the next square

#### Scenario: A line into a white pearl comes out the other side

- **WHEN** a hint step draws a line into a white pearl whose opposite edge is open
- **THEN** the step also asks for that opposite edge, and its explanation ends
  "It runs straight on through the next white pearl too."
