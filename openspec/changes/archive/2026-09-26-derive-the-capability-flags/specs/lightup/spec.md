## MODIFIED Requirements

### Requirement: Light Up game implements the Game interface

The engine SHALL provide a registered `lightup` game implementing
`Game<LightupParams, LightupState, LightupMove, LightupUi, LightupDrawState>`:
place light bulbs on open squares of a `w × h` grid so that every open square
is lit (bulbs shine along rows and columns until blocked by a black square),
no bulb is lit by another bulb, and every numbered black square has exactly
that many orthogonally-adjacent bulbs. Params SHALL be `w`, `h`, `blackpc`
(percentage of black squares), `symm` (none / 2-way mirror / 2-way rotational /
4-way mirror / 4-way rotational) and `difficulty` (Easy / Normal / Unreasonable),
encoded `{w}x{h}b{blackpc}s{symm}d{difficulty}` (short form `{w}x{h}`). All 9
upstream presets SHALL be offered. Decoding SHALL keep upstream's lenient
quirks: a bare `WxH` id demotes 4-way-rotational symmetry to 2-way-rotational
when `w ≠ h`, and the legacy `r` flag decodes as difficulty 2. `validateParams`
SHALL enforce minimum size 2×2, blackpc 5–100, 4-way symmetry only on
square grids of at least 3×3, and known symmetry/difficulty values. The game SHALL provide `solve` and `textFormat` and SHALL drive a
solve-completion flash.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, blackpc: 20, symm: ROT2, difficulty: 1 }`
  are encoded in full
- **THEN** the result is `10x10b20s2d1` and decoding it round-trips the params

#### Scenario: Lenient decode quirks

- **WHEN** `18x10` is decoded with defaults carrying 4-way-rotational symmetry
- **THEN** the symmetry demotes to 2-way rotational
- **AND** a params string using the legacy `r` suffix decodes as difficulty 2

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 1-wide grid, a blackpc outside 5–100,
  or 4-way symmetry on a non-square grid
- **THEN** it returns a non-null error string
