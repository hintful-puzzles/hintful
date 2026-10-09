## MODIFIED Requirements

### Requirement: Mines' parameters leave room for a safe first click

Params SHALL be refused unless `1 ≤ n ≤ w·h − 9`, and, for a board about to be
generated, unless `w > 2 && h > 2`.

#### Scenario: Too many mines for a safe first click

- **WHEN** a 9×9 board with 73 mines is validated
- **THEN** it is refused, since fewer than nine squares would hold no mine

### Requirement: What Mines draws on its two surfaces

A square held down by the pointer SHALL take the opened surface until it is
released. The count digits SHALL keep their own colors, and the flag, the mine
and the tint on a number with more flags beside it than it counts SHALL be drawn on the two flat surfaces.

#### Scenario: A pressed square previews the opened surface

- **WHEN** the pointer is held down on a covered square
- **THEN** the square is drawn in the opened surface
- **AND** it returns to the covered surface when the press is released without
  opening it
