## ADDED Requirements

### Requirement: A hint reference's color is the palette's, held to a mark's bars

Every color a hint's reference can take SHALL be a palette color with a value
per scheme, and SHALL meet the bars every mark on a cell is held to, in both
schemes: it reads on the cell surface and on every member of the region
palette, keeps off the two-state pair's hues, and stands apart from every
other such color. A game SHALL NOT choose colors of its own for its
references.

#### Scenario: An outline on a pale fill

- **WHEN** a hint outlines a region filled in the region palette's yellow in
  the light scheme
- **THEN** every outline color reads on it at least as well as on the plain
  cell surface

#### Scenario: A Map hint names a region

- **WHEN** a Map hint is shown over regions of all four colors
- **THEN** every reference's color stands clear of every region fill, in
  light and in dark, and no fill has moved
