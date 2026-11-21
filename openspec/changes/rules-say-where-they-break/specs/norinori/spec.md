## MODIFIED Requirements

### Requirement: Look: A region's border and surface are drawn as Star Battle's

A shaded square SHALL be drawn as the collection's shaded piece, and a cross
as the collection's ruled-out cross. A region's border SHALL be a heavy line
of which each square paints the half inside its own box
(`engine/render/region-walls.ts`), and a square's surface SHALL be its
region's fill, as Star Battle's are. A hint's ring and outline SHALL sit
inside the square's surface, never on the border.

#### Scenario: Three shaded in a row

- **WHEN** three squares in a row are shaded
- **THEN** the middle one is drawn in the error color

## ADDED Requirements

### Requirement: Look: A shaded square or cross is red where the board breaks a rule

`redraw` SHALL draw in the error color each shaded square or cross where the
board breaks a rule (`Game.rules`): a shaded square beside two others, or
with no square left beside it to pair with; every shaded square of a region
holding more than two; every cross of a region its crosses leave no room for
two.

#### Scenario: A region with three shaded

- **WHEN** a region holds three shaded squares
- **THEN** all three are drawn in the error color

#### Scenario: A shaded square boxed in alone

- **WHEN** a shaded square has a cross or the edge on every side
- **THEN** it is drawn in the error color
