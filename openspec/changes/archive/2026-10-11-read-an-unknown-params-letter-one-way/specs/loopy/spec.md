## MODIFIED Requirements

### Requirement: Loopy's params are a size, t with a grid index, and d with a tier letter

`encodeParams` SHALL write the width, `x`, the height, `t` and the tiling's
index in `LOOPY_GRIDS`, then in the full form `d` and the tier's letter: `e`
Easy, `n` Normal, `t` Tricky, `h` Hard. The short form SHALL leave the tier
out. `decodeParams` SHALL read a lone size as both sides, SHALL keep Squares
where `t` is absent and Easy where `d` is absent, and SHALL refuse a `d` whose
letter is none of the four.

#### Scenario: The Hats preset

- **WHEN** `9x11t16dh` is decoded
- **THEN** the board is 9 wide and 11 tall on row 16 of `LOOPY_GRIDS`, Hats,
  at Hard, and its short form is `9x11t16`

#### Scenario: Hard is h, and Tricky is t

- **WHEN** `7x7t0dt` and `7x7t0dh` are decoded
- **THEN** the first is the 7x7 Squares Tricky preset and the second the 7x7
  Squares Hard one

#### Scenario: A part left out keeps its default

- **WHEN** `7x7t0dh` is given with its `t0` removed, as `7x7dh`, or `7` is
  given alone
- **THEN** the first decodes to Squares at Hard and encodes in full as
  `7x7t0dh`, and the second to 7 by 7 Squares at Easy, `7x7t0de`
