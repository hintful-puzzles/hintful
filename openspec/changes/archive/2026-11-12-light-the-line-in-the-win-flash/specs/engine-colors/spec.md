## ADDED Requirements

### Requirement: A route drawn as a line lights the line

Where the route the win flash travels runs along lines across the cells, a
track, a path or a network's wires, the lines SHALL be what the flash lights,
drawn in the role's color, and the ground of the cells SHALL stay as at rest.
A line that rests in the body's color SHALL be drawn wider while lit.

#### Scenario: A path won

- **WHEN** a game whose route is a line the player drew through the cells,
  as Tracks' track or Path's line, is won
- **THEN** the line takes the tone where the highlight is on it, and the
  squares it crosses keep their color

#### Scenario: A network won

- **WHEN** a Net board is won, its powered wires resting in the body's yellow
- **THEN** the wires the highlight is on are drawn wider in its tone, and
  the tiles keep their color
