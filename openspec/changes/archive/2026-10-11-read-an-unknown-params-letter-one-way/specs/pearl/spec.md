## MODIFIED Requirements

### Requirement: Pearl's parameters

Params SHALL be `w`, `h` and `difficulty` (Easy or Normal), encoded `{w}x{h}`
with a full-form `d{char}` difficulty suffix. Decoding SHALL read upstream's
trailing `n`, which asks for a board nothing has checked, and SHALL change
nothing for it; encoding SHALL never write it.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, difficulty: DIFF_TRICKY }` (the
  Normal tier) are encoded in full
- **THEN** decoding the result round-trips the params

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `12x8dtn` is decoded
- **THEN** the params are those of `12x8dt`

### Requirement: Pearl's difficulty letters are e and t

The letter after `d` SHALL be `e` for Easy and `t` for Normal, and the short
form SHALL leave both out. Decoding a string with no difficulty letter SHALL
give Easy, whatever the default preset's difficulty, and a `d` followed by a
letter that is neither SHALL be refused.

#### Scenario: A string with no letter

- **WHEN** `6x6` is decoded
- **THEN** the board is Easy and its full encoding is `6x6de`, though the
  default preset, `8x8dt`, is Normal

#### Scenario: The Normal preset

- **WHEN** `6x6dt` is decoded
- **THEN** the board is the 6×6 Normal preset, and its short form is `6x6`
