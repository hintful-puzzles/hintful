## ADDED Requirements

### Requirement: Solo refuses a killer cage with no sum or with two

`newState` SHALL refuse a killer description whose sums section gives some
cage no sum, or more than one, with a sentence that says each cage takes
exactly one. No generator writes one: upstream's and this one write one sum a
cage.

#### Scenario: Two sums in one cage

- **WHEN** a `3x3ka` description's sums section opens `15_14_8_8_8_5`, the
  fifth cell being the second cell of the fourth's cage
- **THEN** it is refused as not giving each cage exactly one sum

#### Scenario: A cage with no sum

- **WHEN** a `3x3ka` description's sums section opens `a14` where the first
  cell begins a cage
- **THEN** it is refused with the same sentence
