## MODIFIED Requirements

### Requirement: Bridges params are size, bridge limit, density, expansion, loops and difficulty

Params SHALL be `w`, `h`, `maxb`, `islands` (the percentage of squares that are
islands), `expansion` (a percentage), `allowloops` (boolean) and `difficulty`
(Easy, Normal or Tricky). They SHALL be encoded `{w}x{h}`, then `m{maxb}`, then
an `L` when loops are not allowed. The full form SHALL add `i{islands}` and
`e{expansion}` before the `m`, and `d` with the tier's number, from 0, at the
end.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 15, h: 15, maxb: 2, islands: 30, expansion: 10, allowloops: true, difficulty: 2 }`
  are encoded in full
- **THEN** the result is `15x15i30e10m2d2` and decoding it round-trips the
  params
- **AND** the same params with loops not allowed encode in short as `15x15m2L`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given, in full, a board whose island target is
  three at a tier above Easy (e.g. `3×3` Normal at the default density)
- **THEN** it returns a non-null error string
