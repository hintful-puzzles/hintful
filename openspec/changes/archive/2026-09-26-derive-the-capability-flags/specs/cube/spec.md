## MODIFIED Requirements

### Requirement: Cube game implements the Game interface

The engine SHALL provide a registered `cube` game implementing
`Game<CubeParams, CubeState, CubeMove, CubeUi, CubeDrawState>`: a polyhedron
rolled around a tiled arena to collect paint from blue grid squares onto the
solid's faces. Params SHALL be `solid` (one of tetrahedron/cube/octahedron/
icosahedron), `d1`, `d2`, encoded `<t|c|o|i><d1>x<d2>` with lenient decode (a
missing leading solid letter and a missing `x<d2>` both tolerated, `d2`
defaulting to `d1`). The four upstream presets (Cube `c4x4`, Tetrahedron
`t1x2`, Octahedron `o2x2`, Icosahedron `i3x3`) SHALL be offered. The game SHALL provide `statusbarText`, and SHALL NOT provide `solve` or `textFormat` (Cube is a route puzzle with no solver, hint,
mistake-check, or text format).

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ solid: cube, d1: 4, d2: 4 }` are encoded
- **THEN** the result is `c4x4`
- **AND** decoding `c4x4`, `4x4`, and `4` all yield well-formed params with
  `d2` defaulting to `d1` when the `x<d2>` segment is absent

#### Scenario: A generated board is winnable and starts unsolved

- **WHEN** a new game is created from any preset
- **THEN** the solid is placed on a start square, a non-empty set of blue
  squares is painted, and the initial state reports a not-completed status
