## ADDED Requirements

### Requirement: Pearl's hint draws a black pearl's arm whole

A hint step that draws a line leaving a black pearl SHALL also draw that line's run-on through the next square, in the same step and the same move, when that edge is still open, and its sentence SHALL say the line runs through the next square. No other step SHALL draw a run-on its sentence does not name.

#### Scenario: A black pearl's forced edge comes with its run-on

- **WHEN** a hint step decides that the edge beside a black pearl must be a line,
  and the far edge of the square past it is open
- **THEN** the step asks for both lines, and its sentence says the pearl's line
  must run that way through the next square
