## MODIFIED Requirements

### Requirement: Solo game implements the Game interface

The engine SHALL provide a registered `solo` game implementing
`Game<SoloParams, SoloState, SoloMove, SoloUi, SoloDrawState, SoloMistake>`: a
Latin-square puzzle on a `cr × cr` grid (`cr = c·r`) in which the player places a
digit `1..cr` in every cell so each row, each column, and each sub-block contains
every digit exactly once, with a subset of cells given. The game SHALL support
four composable variants: **standard** (rectangular `c × r` sub-blocks),
**jigsaw** (`r === 1`, irregular sub-blocks), **X** (`xtype` — the two main
diagonals must also contain every digit), and **killer** (`killer` — a second
cage partition with digit-sum clues). Params SHALL be
`{ c, r, symm, diff, kdiff, xtype, killer }` with two difficulty axes (the
standard solver difficulty and the killer-cage difficulty). The game SHALL provide `solve` and `findMistakes`, and SHALL report `canMarkAll = true`.

#### Scenario: Variants are served from one registered game

- **WHEN** a standard, jigsaw, X, or killer Solo puzzle is requested
- **THEN** the same registered `solo` game produces a playable board for it
- **AND** a jigsaw board (`r === 1`) has irregular sub-blocks while a standard
  board has rectangular `c × r` sub-blocks
- **AND** an X board additionally constrains the two main diagonals, and a killer
  board additionally carries digit-sum cages
