## MODIFIED Requirements

### Requirement: Group's params are a size, a tier letter and an identity flag

The params encoding SHALL be the size in decimal, then in the full form `d`
and the tier's letter (`t` Easy, `n` Normal, `h` Tricky, `x` Hard, `u`
Unreasonable), then `i` when the identity is hidden. The short form SHALL
leave out the tier and keep the `i`. Decoding SHALL read a string with no `d`
as Normal and one with no `i` as showing the identity, and SHALL refuse a
character it does not know and a `d` followed by no tier letter.

#### Scenario: A preset that hides its identity

- **WHEN** `8dni` is decoded
- **THEN** it is an 8×8 board at Normal with the identity hidden, and its
  short form is `8i`

#### Scenario: The tier letters are not the tier's initials

- **WHEN** `8dh` is decoded
- **THEN** it is an 8×8 board at Tricky, not Hard, with the identity shown

#### Scenario: A letter that is no tier

- **WHEN** the `h` of `8dh` is changed to `q`
- **THEN** the params are refused:
  `The parameters 8dq have a "q" where this puzzle reads none.`
