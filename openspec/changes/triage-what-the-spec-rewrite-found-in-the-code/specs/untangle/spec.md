## MODIFIED Requirements

### Requirement: The solved layout is exact and checked

The solved layout SHALL be the generator's `aux` when the session has it,
scaled to fill the play box, and otherwise a layout computed from the edges
alone. Every layout SHALL be exact rationals, checked crossing-free with the
game's exact crossing test before use. Where rounding the scaled `aux` layout
fails that test, the layout SHALL be the `aux` as the generator gave it.

#### Scenario: A layout from the edges alone passes the game's own test

- **WHEN** the solved layout of a generated board is computed without `aux`
- **THEN** its coordinates are integers over their denominators, and the
  game's crossing test finds no crossing in it

#### Scenario: A planar graph's drawing that crosses is not an answer

- **WHEN** every layout computed from the edges of a planar graph fails the
  crossing test
- **THEN** `solve` and `hint` throw, and no layout is given: only a graph
  proved non-planar is answered with no solution

### Requirement: A clearing spot keeps its gaps

A spot a clearing step is chosen at SHALL keep, as fractions of the typical
spacing between points, a gap from every other vertex and from every line the
vertex is not an end of, and a margin from the frame. A slightly tighter gap
SHALL be used only when no spot with the full gaps removes a crossing. The
margin from the frame SHALL NOT tighten.

#### Scenario: A roomy spot wins over a cramped one

- **WHEN** the search of spots with the full gaps finds a move that removes a
  crossing
- **THEN** that move is the clearing step, and no spot with the tighter gap is
  considered

## ADDED Requirements

### Requirement: A clearing step lands where the pointer can drop

A clearing step SHALL move its vertex to the spot nearest the chosen one where
a pointer drop can land with the crossings the step counts. With snap-to-grid
off it SHALL lie at most an eighth of a board unit from the chosen spot on
each axis. With it on it SHALL be a snap cell at most two cells away, and the
gaps SHALL NOT be asked of it again. Either way it SHALL keep `FRAME_MARGIN`
from the frame, inside which a drop is clamped.

#### Scenario: A clearing step with snap-to-grid on

- **WHEN** a clearing step is given with the snap-to-grid preference on
- **THEN** the spot it marks is a snap cell, which may lie nearer another
  vertex than the gap a spot is chosen with, since the cells lie closer
  together than that gap on all but the smallest boards

#### Scenario: The chosen spot is a snap cell against the frame

- **WHEN** snap-to-grid is on and the nearest snap cell to the chosen spot
  lies within `FRAME_MARGIN` of the frame
- **THEN** that cell is passed over for the next nearest
