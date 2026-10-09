## MODIFIED Requirements

### Requirement: Keen's params encoding

Params SHALL be encoded `{w}` without `full` and `{w}d{c}{m?}` with `full`,
where `c` is `e`, `n`, `h`, `x` or `u` for the five tiers in order and a
trailing `m` marks a multiplication-only puzzle. A difficulty letter the
encoding does not know SHALL decode as the default tier.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, diff: "hard", multiplicationOnly: false }` (the Tricky
  tier) are encoded with `full = true`
- **THEN** the result is `6dh`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`
- **AND** a multiplication-only puzzle's full encoding ends with `m`

#### Scenario: A difficulty letter that names no tier

- **WHEN** the params string `6dq` is decoded
- **THEN** the grid size is 6 and the difficulty is the default tier, Normal
- **AND** the params are not refused
