## MODIFIED Requirements

### Requirement: Twiddle params are written WxHnN with trailing flags

Twiddle's params SHALL be `w`, `h`, `n` (the rotating block's size),
`rowsonly`, `orientable` and `movetarget`. They SHALL be encoded as `WxHnN`
followed by `r` when `rowsonly`, `o` when `orientable`, and `mK` when a shuffle
target `K` is set. A bare `W` SHALL decode as a square `W×W` board, and a
missing `nN` as `n = 2`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 4, h: 4, n: 3, rowsonly: false, orientable: false, movetarget: 0 }` are encoded
- **THEN** the result is `4x4n3`
- **AND** decoding `4x4n3`, `4n3` (square shorthand), and `4x4n3o` all round-trip
  to the corresponding params, with `o` setting `orientable`

### Requirement: Twiddle's short params are its full ones

`encodeParams` SHALL write the same string with and without `full`, the shuffle
target included, because the status bar reports progress against it.
`decodeParams` SHALL read `nN` only directly after the size, and `r`, `o` and
`mK` in any order after that. It SHALL refuse a character it does not know,
and SHALL read `n0` as a block of 2.

#### Scenario: A shuffle target survives the short form

- **WHEN** `3x3n3m20` is decoded and encoded again with `full` false
- **THEN** the result is `3x3n3m20`: a 3×3 board turned as one block, shuffled
  by 20 turns

#### Scenario: Both flags

- **WHEN** `4x4n2ro` is decoded
- **THEN** the board is 4×4 with a 2×2 block, one number to a row, and tiles
  that show their turns
