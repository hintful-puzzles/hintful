## MODIFIED Requirements

### Requirement: Grid parameter validation

The grid module SHALL provide `gridValidateParams(type, width, height)`
returning an error message for a rejected size and null otherwise, for every
tiling in `ALL_GRID_TYPES`. It SHALL reject non-positive dimensions, sizes
that overflow the coordinate arithmetic for the given tiling, and sizes whose
count of cells, times what the tiling builds per cell, overflows. Per-type
minimum sizes are not part of this requirement: they are a property of the
consuming game, not of the geometry.

#### Scenario: An unreasonably large grid is rejected

- **WHEN** `gridValidateParams` is given a size whose extent would overflow
- **THEN** it returns an error message rather than attempting construction

#### Scenario: A grid of too many objects is rejected

- **WHEN** `gridValidateParams` is given a width and a height that each fit the
  coordinate arithmetic, and whose product does not fit the count of objects
  the tiling builds
- **THEN** it returns the same error message

#### Scenario: A legal size is accepted

- **WHEN** `gridValidateParams` is given a legal size for any tiling
- **THEN** it returns null
