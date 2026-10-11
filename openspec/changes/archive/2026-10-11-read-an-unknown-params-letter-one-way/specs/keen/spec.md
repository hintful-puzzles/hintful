## MODIFIED Requirements

### Requirement: Keen's params encoding

Params SHALL be encoded `{w}` without `full` and `{w}d{c}{m?}` with `full`,
where `c` is `e`, `n`, `h`, `x` or `u` for the five tiers in order and a
trailing `m` marks a multiplication-only puzzle. A `d` followed by a letter
that is none of the five, or by nothing, SHALL be refused.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 6, diff: "hard", multiplicationOnly: false }` (the Tricky
  tier) are encoded with `full = true`
- **THEN** the result is `6dh`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `6`
- **AND** a multiplication-only puzzle's full encoding ends with `m`

#### Scenario: A difficulty letter that names no tier

- **WHEN** the params string `6dq` is decoded
- **THEN** it is refused:
  `The parameters 6dq have a "q" where this puzzle reads none.`
- **AND** `6d`, which stops at its `d`, is refused too
