## MODIFIED Requirements

### Requirement: Guess's parameters

Params SHALL be `ncolors`, `npegs`, `nguesses`, `allowBlank` and
`allowMultiple`, encoded `c{ncolors}p{npegs}g{nguesses}{b|B}{m|M}`. Decoding
SHALL read the fields in any order and SHALL refuse any other character.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ ncolors: 8, npegs: 5, nguesses: 12, allowBlank: false, allowMultiple: true }`
  are encoded
- **THEN** the result is `c8p5g12Bm`
- **AND** decoding `c8p5g12Bm` round-trips those params
