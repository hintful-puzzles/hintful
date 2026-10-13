## ADDED Requirements

### Requirement: Look: A cell's surface is its region's fill

A cell's surface SHALL be the fill the engine assigns its region, from the
collection's set of region fills, so that two regions sharing a side never
have the same color. The fills SHALL be always on, with no preference, and a
board SHALL wear the same ones each time it is opened. The mistake's wash
and the win flash SHALL take the fill's place while they show.

#### Scenario: Two regions share a side

- **WHEN** a board is drawn
- **THEN** the cells of two regions that share a side have different
  surfaces

#### Scenario: A mistake on a region

- **WHEN** Check & Save finds a cell wrong
- **THEN** the cell's surface is the mistake's wash and not its region's
  fill
