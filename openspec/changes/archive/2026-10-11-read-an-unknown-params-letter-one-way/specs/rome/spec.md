## MODIFIED Requirements

### Requirement: A Rome params string with no difficulty letter is Easy

Decoding a string with no `d` SHALL give Easy. A `d` followed by anything but
`e`, `n` or `t` SHALL be refused.

#### Scenario: A string with no letter

- **WHEN** `4x4` is decoded
- **THEN** the board is Easy, and its full encoding is `4x4de`

#### Scenario: A letter that is no difficulty

- **WHEN** the `n` of `4x4dn` is changed to `z`
- **THEN** the params are refused:
  `The parameters 4x4dz have a "z" where this puzzle reads none.`
