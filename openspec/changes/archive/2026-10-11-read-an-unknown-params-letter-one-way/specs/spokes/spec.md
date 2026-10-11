## MODIFIED Requirements

### Requirement: Spokes' params write the difficulty as d and a letter

`encodeParams` SHALL write `{w}x{h}` and, in the full form only, `d` and `e`
for Easy, `t` for Normal or `h` for `Unreasonable`. `decodeParams` SHALL read
a bare number as a square board and a string with no `d` as Easy. A `d`
followed by any other letter, or by nothing, SHALL be refused.

#### Scenario: A Normal preset and its short form

- **WHEN** `4x4dt` is decoded
- **THEN** the board is 4 by 4 at Normal
- **AND** its short form `4x4` decodes to a 4 by 4 board at Easy

#### Scenario: A letter that names no tier

- **WHEN** `4x4dt` is entered with its `t` written `z`
- **THEN** the params are refused:
  `The parameters 4x4dz have a "z" where this puzzle reads none.`
