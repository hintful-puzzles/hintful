## MODIFIED Requirements

### Requirement: Params: A params string is the size and the tier, and one with no tier is Easy

A Norinori params string SHALL be the width, `x` and the height, and in the
full form `d` and the tier's letter (`e`, `n`, `t`). A string that leaves the
tier out SHALL decode as Easy. Each side SHALL be at least 4.

#### Scenario: A board's own string

- **WHEN** an 8x8 board at Normal is encoded in full, and again in the form
  a board's ID carries
- **THEN** the strings are `8x8dn` and `8x8`
