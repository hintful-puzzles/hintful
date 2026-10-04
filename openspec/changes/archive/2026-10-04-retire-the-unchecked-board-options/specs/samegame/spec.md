## MODIFIED Requirements

### Requirement: Same Game implements the Game interface

The engine SHALL provide a registered `samegame` game implementing
`Game<SamegameParams, SamegameState, SamegameMove, SamegameUi,
SamegameDrawState>`: a block-clearing puzzle on a `w×h` grid of colored tiles
(colors `1..ncols`, `0` = empty) in which the player removes
orthogonally-connected groups of one color. Params SHALL be `w`, `h`, `ncols`
and `scoresub` (1 or 2), encoded `{w}x{h}c{ncols}s{scoresub}` with lenient
decode. Decoding SHALL leave upstream's trailing `r` unread, which asks for
colors scattered at random with no promise the grid can be cleared, and
encoding SHALL never write it. Five presets — `5×5`, `5×10`, `10×15` (all 3 colors), `10×15` and
`15×20` (4 colors), all `scoresub = 2` — SHALL be offered: upstream's
sizes, turned to draw taller than wide. Tiles fall down and emptied columns
close leftward, so a board of Same Game SHALL NOT declare `transposeParams`: a
tall board is a different game from a wide one, not the same one turned.
`validateParams` SHALL require `w ≥ 1`, `h ≥ 1`, `3 ≤ ncols ≤ 9`,
`scoresub ∈ {1,2}` and `w·h > 1`. The game SHALL provide `statusbarText` and `textFormat`, and SHALL NOT provide `solve`, `hint`, or `findMistakes`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 15, h: 10, ncols: 4, scoresub: 2 }` are
  encoded with `full = true`
- **THEN** the result is `15x10c4s2`
- **AND** decoding `15x10c4s2` round-trips those params
- **AND** decoding `15x10c4s2r` yields the same params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `ncols: 2`
- **THEN** it returns a non-null error string
- **AND** a `1×1` grid also returns a non-null error string

## REMOVED Requirements

### Requirement: Same Game generates soluble and random boards

**Reason**: The random generator dealt grids with no promise they could be
cleared, behind the "Ensure solubility" option, which is retired.

**Migration**: "Same Game generates boards that can be cleared" carries the
surviving scenarios. A `…r` params string deals a clearable board.

## ADDED Requirements

### Requirement: Same Game generates boards that can be cleared

`newDesc` SHALL produce the board as a comma-separated list of `w·h` color
integers in row-major order, using the inverse-move generator (repeatedly
inserting a verified connected blob whose removal reproduces the prior grid, so
the board is clearable). No parameter SHALL deal a grid that may not be
clearable.
`validateDesc` SHALL reject a desc without exactly `w·h` comma-separated
integers, or any integer outside `0..ncols`. `newState` SHALL parse the desc into
the tile grid with score 0 and the complete/impossible flags clear.

#### Scenario: A generated description is well-formed

- **WHEN** `newDesc` runs for a preset with a fixed seed
- **THEN** `validateDesc` accepts it and `newState` parses `w·h` tiles

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with too few numbers, or one
  containing a color greater than `ncols`
- **THEN** it returns a non-null error string
