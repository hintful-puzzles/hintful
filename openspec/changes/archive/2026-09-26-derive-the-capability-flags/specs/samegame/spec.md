## MODIFIED Requirements

### Requirement: Same Game implements the Game interface

The engine SHALL provide a registered `samegame` game implementing
`Game<SamegameParams, SamegameState, SamegameMove, SamegameUi,
SamegameDrawState>`: a block-clearing puzzle on a `w×h` grid of colored tiles
(colors `1..ncols`, `0` = empty) in which the player removes
orthogonally-connected groups of one color. Params SHALL be `w`, `h`, `ncols`,
`scoresub` (1 or 2), and `soluble`, encoded `{w}x{h}c{ncols}s{scoresub}[r]`
(the trailing `r` present only when `full` and not `soluble`) with lenient
decode. Five presets — `5×5`, `5×10`, `10×15` (all 3 colors), `10×15` and
`15×20` (4 colors), all `scoresub = 2`, soluble — SHALL be offered: upstream's
sizes, turned to draw taller than wide. Tiles fall down and emptied columns
close leftward, so a board of Same Game SHALL NOT declare `transposeParams`: a
tall board is a different game from a wide one, not the same one turned.
`validateParams` SHALL require `w ≥ 1`, `h ≥ 1`, `ncols ≤ 9`, `scoresub ∈ {1,2}`,
and — when soluble — `ncols ≥ 3` and `w·h > 1`, or — when not soluble —
`ncols ≥ 2` and `w·h ≥ 2·ncols`. The game SHALL provide `statusbarText` and `textFormat`, and SHALL NOT provide `solve`, `hint`, or `findMistakes`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 15, h: 10, ncols: 4, scoresub: 2, soluble: true }` are
  encoded with `full = true`
- **THEN** the result is `15x10c4s2`
- **AND** decoding `15x10c4s2` round-trips those params
- **AND** encoding the same params with `soluble: false` and `full = true`
  yields `15x10c4s2r`, which round-trips with `soluble: false`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `{ soluble: true, ncols: 2 }`
- **THEN** it returns a non-null error string
- **AND** `{ soluble: false, w: 2, h: 2, ncols: 3 }` (area `4 < 2·ncols`) also
  returns a non-null error string
