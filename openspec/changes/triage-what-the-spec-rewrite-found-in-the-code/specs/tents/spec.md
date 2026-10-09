## MODIFIED Requirements

### Requirement: Tents' parameters

Params SHALL be `w`, `h` and `diff` (Easy or Normal), encoded
`{w}x{h}d{e|t}`, with the short form `{w}x{h}` and the square shorthand `{n}`.
The width and the height SHALL each be at least 4. Of full params
`validateParams` SHALL refuse a 4×4 above Easy, a size none of whose boards
needs the harder tier.

#### Scenario: Params round-trip

- **WHEN** the params 15×15 at Normal are encoded in full
- **THEN** the result is `15x15dt` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** the engine's check of the params is given a grid narrower or
  shorter than 4
- **THEN** it returns a non-null error string

#### Scenario: A 4×4 Normal board that arrives written still loads

- **WHEN** a game ID carries a 4×4 Normal board with its description
- **THEN** the params are accepted, and the same params are refused when a
  board is to be dealt

### Requirement: Tents' solver is a certified deduction ladder

Tents' solver SHALL run its deductions as a `runDeductionFixpoint` ladder,
each deduction a rung of its own. A firing census SHALL walk boards generated
at every preset, read from `presets`, and at a non-square size, at every cap
the generator uses, and assert that every rung fires on the corpus. The solver
SHALL NOT keep a hand-written loop beside the ladder.

#### Scenario: A Normal rung nothing depends on is still certified

- **WHEN** the tree diagonal-pair rung is silenced
- **THEN** the census reports it as never fired, even though the frozen
  differential still passes, because other rungs reach its conclusions
