## MODIFIED Requirements

### Requirement: Unruly's difficulty letters are t, e and n

The difficulty char SHALL be `t` for Easy, `e` for Normal and `n` for Tricky.
A params string with no `d` SHALL decode as Easy. One whose `d` is followed by
any other character, or by nothing, SHALL be refused.

#### Scenario: The unique board of the Type menu

- **WHEN** `8x8ude` is decoded
- **THEN** the board is 8×8 with unique rows and columns, at Normal
- **AND** encoding it without `full` gives `8x8u`

#### Scenario: A letter that names no tier

- **WHEN** `8x8dn`, an 8×8 board at Tricky, has its last letter changed to
  `z` and is decoded
- **THEN** it is refused:
  `The parameters 8x8dz have a "z" where this puzzle reads none.`
