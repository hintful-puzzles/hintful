## MODIFIED Requirements

### Requirement: Mathrax's params are the size, a tier letter and the clue-type letters

The params string SHALL be the size in decimal, then `d` and one of `e`, `n`,
`t`, `r` for the four tiers in order, then a letter for each enabled clue
type in the order `A` (addition), `S` (subtraction), `M` (multiplication),
`D` (division), `E` (equality), `O` (even/odd), and no letter when all six
are enabled. The short form SHALL be the size alone and SHALL decode to Easy
with every clue type. `decodeParams` SHALL read each clue letter once and
refuse one out of that order.

#### Scenario: A restricted clue set

- **WHEN** `7dtAM` is decoded
- **THEN** it is a size-7 Tricky board with only addition and multiplication
  clues, and its short form is `7`

#### Scenario: Clue letters out of order

- **WHEN** `6dnDS` is decoded
- **THEN** it is refused for its `S`, because `S` is looked for before `D`

#### Scenario: The short form

- **WHEN** `5` is decoded and encoded in full
- **THEN** the result is `5de`
