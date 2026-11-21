## MODIFIED Requirements

### Requirement: Params: Dominosa params are the highest number, a tier and the tall flag

Params SHALL be `n` (maximum face number, default 6), `diff` (Easy / Normal /
Tricky / `Unreasonable`) and `tall`, encoded `"{n}"`, then `"t"` when `tall`,
with a full-form `"d{t|b|h|e}"` difficulty suffix. An encoding without the
`"t"` SHALL decode as the wide board, so that an id with no `"t"` in it names
the board its desc was laid out for.

#### Scenario: Params round-trip

- **WHEN** params `{ n: 6, diff: DIFF_TRICKY, tall: false }` are encoded in
  full
- **THEN** the result is `"6dh"` and decoding it round-trips the params

#### Scenario: An id without the tall flag loads as the wide board

- **WHEN** a params string without a `t`, such as `"6db"`, is decoded
- **THEN** `tall` is false and the board is `n+2` wide and `n+1` tall
- **AND** encoding the result in full gives back `"6db"`

#### Scenario: The default board is dealt tall

- **WHEN** the default params are encoded in full
- **THEN** the result is `"6tdb"` and the board is 7 wide and 8 tall
