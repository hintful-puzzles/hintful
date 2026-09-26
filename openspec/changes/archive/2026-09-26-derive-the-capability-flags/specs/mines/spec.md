## MODIFIED Requirements

### Requirement: Mines game implements the Game interface

The engine SHALL provide a registered `mines` game implementing `Game<MinesParams,
MinesState, MinesMove, MinesUi, MinesDrawState>`: a `w × h` grid concealing `n` mines, in
which the player uncovers squares, deduces from the revealed neighbor-counts where the
mines are, and flags them.

Params SHALL be `w`, `h`, `n` and `unique`, encoded `{w}x{h}n{n}[a]` (`a` = not unique),
with a custom `n%` form meaning "percentage of area". Six presets (9×9/10,
9×9/35, 16×16/40, 16×16/99, 16×30/99, 16×30/170), upstream's with the expert
board turned to draw taller than wide, SHALL be offered. `validateParams` SHALL
require `n ≥ 1` and `n ≤ w·h − 9`, and additionally `w > 2 && h > 2` when `unique`.

The game SHALL provide `solve`, `textFormat` and `statusbarText`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 16, h: 16, n: 99, unique: true }` are encoded in full
- **THEN** the result is `16x16n99` and decoding it round-trips the params
