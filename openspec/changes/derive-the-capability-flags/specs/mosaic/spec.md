## MODIFIED Requirements

### Requirement: Mosaic game implements the Game interface

The engine SHALL provide a registered `mosaic` game implementing
`Game<MosaicParams, MosaicState, MosaicMove, MosaicUi, MosaicDrawState>`: a
grid-fill puzzle in which numeric clues state how many cells in the clue's
3×3 neighborhood (including itself) are black, and the player marks every
cell black or white. Params SHALL be `width`, `height`, and `aggressive`
(harder generation via clue minimization), encoded `{w}x{h}` with an
`h{0|1}` suffix when `aggressive` differs from the default (true). The 6
upstream presets — 3×3, 5×5, 10×10, 15×15, 25×25 (aggressive) and 50×50
(non-aggressive) — SHALL be offered, and the type summary SHALL render via
the `width`/`height`/`aggressive-generation` config keys with `aggressive`
surfaced as a boolean. `validateParams` SHALL reject boards smaller than 3×3
or larger than 10000 tiles. The game SHALL provide `statusbarText`, `solve` and `textFormat`.

#### Scenario: Params round-trip

- **WHEN** params `{ width: 10, height: 8, aggressive: true }` are encoded in
  full
- **THEN** the result is `10x8` (default aggressiveness elided)
- **AND** `{ width: 50, height: 50, aggressive: false }` encodes to `50x50h0`
- **AND** decoding each string round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with a 2×3 board, or with 101×100 cells
  (> 10000 tiles)
- **THEN** it returns a non-null error string
