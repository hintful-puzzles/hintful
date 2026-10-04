## MODIFIED Requirements

### Requirement: Mines game implements the Game interface

The engine SHALL provide a registered `mines` game implementing `Game<MinesParams,
MinesState, MinesMove, MinesUi, MinesDrawState>`: a `w × h` grid concealing `n` mines, in
which the player uncovers squares, deduces from the revealed neighbor-counts where the
mines are, and flags them.

Params SHALL be `w`, `h` and `n`, encoded `{w}x{h}n{n}`,
with a custom `n%` form meaning "percentage of area". Decoding SHALL skip upstream's `a`,
which asks for a board that may need a guess, and encoding SHALL never write it; a
preliminary description SHALL be read whether it says `u` or `a`. Six presets (9×9/10,
9×9/35, 16×16/40, 16×16/99, 16×30/99, 16×30/170), upstream's with the expert
board turned to draw taller than wide, SHALL be offered. `validateParams` SHALL
require `n ≥ 1`, `n ≤ w·h − 9`, and `w > 2 && h > 2` for a board about to be generated.

The game SHALL provide `solve`, `textFormat` and `statusbarText`. It SHALL implement
`finishesByDeduction` as its hint's plan, played from the first click, opening every safe
square; a layout with no square opened SHALL pass.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 16, h: 16, n: 99 }` are encoded in full
- **THEN** the result is `16x16n99` and decoding it round-trips the params

#### Scenario: Upstream's may-need-a-guess letter

- **WHEN** `16x16n40aX3Y4` is decoded
- **THEN** the params are those of `16x16n40X3Y4`

### Requirement: Generated boards are solvable without guessing

The generator SHALL perturb every board until its own solver can complete it by pure
deduction. No parameter SHALL lay out a board that requires a guess.

#### Scenario: Every preset board is deducible

- **WHEN** a board is generated from any preset
- **THEN** the solver completes it with no guessing and no perturbation left outstanding
