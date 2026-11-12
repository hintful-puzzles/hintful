## ADDED Requirements

### Requirement: A route drawn as a line lights the line

Where the route the win flash travels is a line the player draws through the
cells, the line SHALL be the element the flash lights, drawn in the role's
color, and the ground of the cells it crosses SHALL stay as at rest.

#### Scenario: A path won

- **WHEN** a game whose route is a line the player drew through the cells,
  as Tracks' track or Path's line, is won
- **THEN** the line takes the tone where the highlight is on it, and the
  squares it crosses keep their color
