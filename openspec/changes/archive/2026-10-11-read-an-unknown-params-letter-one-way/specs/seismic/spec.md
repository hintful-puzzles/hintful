## MODIFIED Requirements

### Requirement: Seismic's game ID writes Tectonic as T and the difficulty as de or dh

After `{w}x{h}` the params SHALL write `T` in Tectonic mode and nothing in
Seismic mode, and then the difficulty, `de` for Easy or `dh` for Normal, in the
full encoding only. A string with no `T` SHALL decode as Seismic mode, and one
with no `d` as Easy. A `d` followed by any other letter, or by none, SHALL be
refused.

#### Scenario: A Tectonic preset

- **WHEN** `4x4Tde` is decoded
- **THEN** it is a 4×4 Tectonic board at Easy, and its short encoding is `4x4T`

#### Scenario: A Seismic preset

- **WHEN** `4x4dh` is decoded
- **THEN** it is a 4×4 Seismic board at Normal, and its short encoding is `4x4`,
  which decodes as a 4×4 Seismic board at Easy

#### Scenario: A letter that names no difficulty

- **WHEN** the `h` of `4x4dh` is changed to `x`
- **THEN** the params are refused:
  `The parameters 4x4dx have a "x" where this puzzle reads none.`
