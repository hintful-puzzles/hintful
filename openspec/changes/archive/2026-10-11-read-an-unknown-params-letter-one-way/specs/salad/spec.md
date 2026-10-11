## MODIFIED Requirements

### Requirement: Salad params are a size, n, a symbol count and a mode letter

Params SHALL encode as `{order}n{nums}`, then `L` for ABC End View or `B` for
Number Ball, then, in the full form only, `d` and the difficulty's letter: `e`
for Easy or `x` for Normal. A string with no mode letter SHALL decode as ABC
End View, and one with no `d` as Easy. A `d`
followed by any other letter SHALL be refused.

#### Scenario: A Number Ball preset

- **WHEN** `5n4Bdx` is decoded
- **THEN** the board is 5×5 Number Ball with the numbers 1 to 4 at Normal, and
  its short form is `5n4B`

#### Scenario: A string with no difficulty

- **WHEN** `4n3L` is decoded
- **THEN** the board is 4×4 ABC End View with A to C at Easy, and its full
  encoding is `4n3Lde`

#### Scenario: A letter that is no difficulty

- **WHEN** the `x` of `5n4Bdx` is changed to `z`
- **THEN** the params are refused:
  `The parameters 5n4Bdz have a "z" where this puzzle reads none.`
