## MODIFIED Requirements

### Requirement: Params: Dominosa refuses params outside its bounds

The highest number's `bounds` SHALL stop at the largest `n` whose grid, `n+1`
by `n+2`, is within the engine's `MAX_BOARD_AREA`. `validateParams` SHALL
refuse in full form a tier above Easy at `n = 1` and a tier above Normal at
`n = 2`, which no board of that size reaches.

#### Scenario: The largest set

- **WHEN** params with `n = 98` and with `n = 99` are checked
- **THEN** the first is admitted, its grid 9900 squares, and the second is
  refused with "Maximum number on dominoes must be at most 98."

#### Scenario: A tier the smallest set cannot reach is refused

- **WHEN** params with `n = 1` at Normal are checked in full form
- **THEN** `validateParams` returns a non-null error string
