## ADDED Requirements

### Requirement: Inertia's hint refuses in Solve's words where no route is found

Where the ball is alive, no gem is out of reach, and the route solver still
finds no route that collects every gem, `hint` SHALL refuse with the sentence
Solve gives there, `No solution can be found from this position. Undo, and try
from an earlier one.`, and SHALL outline no gem. The refusal is a dead end, so
Check & save does not save the position.

#### Scenario: Two gems, each where the ball cannot come back from

- **WHEN** a hand-entered board has two gems, each collected only by a slide
  that ends where every way out is a wall or a mine, and a hint is asked
- **THEN** the hint refuses with that sentence and outlines neither gem, since
  the ball can still reach each of them
- **AND** once one is collected, the hint outlines the other as a gem the ball
  can no longer reach
