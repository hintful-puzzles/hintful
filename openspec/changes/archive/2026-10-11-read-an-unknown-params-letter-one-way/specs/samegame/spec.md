## MODIFIED Requirements

### Requirement: Same Game's params are a size, a color count and a scoring system

Params SHALL be `w`, `h`, `ncols` and `scoresub` (1 or 2), encoded
`{w}x{h}c{ncols}s{scoresub}`. Decoding SHALL read a trailing `r`, the letter
that asks for colors scattered at random with no promise the grid can be
cleared, and SHALL change nothing for it; encoding SHALL never write it.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 15, h: 10, ncols: 4, scoresub: 2 }` are
  encoded with `full = true`
- **THEN** the result is `15x10c4s2`
- **AND** decoding `15x10c4s2` round-trips those params
- **AND** decoding `15x10c4s2r` yields the same params
