## MODIFIED Requirements

### Requirement: Cube roll moves transform orientation and swap paint

A `CubeMove` SHALL be a roll in one direction (the four orthogonal directions
on a square grid; up to eight, including diagonals, on triangular and
hexagonal grids). `executeMove` SHALL be pure (returning a new state),
computing the destination square and the solid's new resting face from the
current orientation key-points, and exchanging paint between the destination
square and the face that lands on it, except that a solid with every face
painted SHALL roll without exchanging paint. The game SHALL be reported solved
exactly while every face of the solid is painted, and the move count SHALL
keep counting every roll.

#### Scenario: Rolling tips the solid onto a new face

- **WHEN** a roll move executes from a given orientation
- **THEN** the new state's resting face differs per the polyhedron's geometry
- **AND** paint is exchanged between the destination square and the landing
  face, leaving the source state unmutated

#### Scenario: Direction set depends on grid topology

- **WHEN** input is interpreted on a square-grid board
- **THEN** only the four orthogonal roll directions are produced
- **AND** on a triangular or hexagonal board the diagonal directions are also
  available
