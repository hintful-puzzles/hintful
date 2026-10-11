## MODIFIED Requirements

### Requirement: Cube params are a solid and two dimensions

Params SHALL be `solid` (one of tetrahedron, cube, octahedron, icosahedron),
`d1` and `d2`, encoded `<t|c|o|i><d1>x<d2>`. Decoding SHALL accept a string
with no leading solid letter, which keeps the default solid, and one with no
`x<d2>`, where `d2` SHALL default to `d1`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ solid: cube, d1: 4, d2: 4 }` are encoded
- **THEN** the result is `c4x4`
- **AND** decoding `c4x4`, `4x4`, and `4` all yield well-formed params with
  `d2` defaulting to `d1` when the `x<d2>` segment is absent
