## REMOVED Requirements

### Requirement: A fill that is the player's answer is stronger in the dark scheme

**Reason**: The owner chose one region color in every game (2026-10-15). Map's
four are the region palette's own, in both schemes; only a mark drawn in a
fill's color on a surface that is not the color keeps a stronger dark value.

**Migration**: Replaced by "A region's color is one value a scheme in every
game" and "A mark of a region's color stands off a surface that is not the
color".

## ADDED Requirements

### Requirement: A region's color is one value a scheme in every game

Every game that fills regions SHALL take its fills from the region palette as
themselves, so that one color of the palette is one value in each scheme
wherever it is drawn.

#### Scenario: Map and Star Battle

- **WHEN** Map's four fills and the region palette's first four are resolved
  in either scheme
- **THEN** each of Map's is the same color as its counterpart

### Requirement: A mark of a region's color stands off a surface that is not the color

A dot or a swatch drawn in a fill's color on a surface that is not the color,
as Map's pencil stipples are on a region with no color yet, SHALL take a
value of its own for that color that stands off the surface in both schemes.

#### Scenario: A stipple in the dark scheme

- **WHEN** a stipple of each of Map's four colors is measured on a region
  with no color in the dark scheme
- **THEN** it is lighter than the fill of the same color
