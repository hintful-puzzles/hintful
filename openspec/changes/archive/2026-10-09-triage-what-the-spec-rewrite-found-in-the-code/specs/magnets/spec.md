## MODIFIED Requirements

### Requirement: Magnets' parameters

Params SHALL be `w`, `h`, `diff` (Easy or Normal) and `stripclues` (boolean),
encoded `{w}x{h}` with, in the full form, a `d{e|t}` difficulty suffix and an
`S` strip-clues suffix; a bare `{n}` SHALL decode as a square. `w` and `h`
SHALL each be declared bounded from 2 to 61, the largest count one description
character writes. `validateParams` SHALL refuse Easy unless `w ≥ 3` or
`h ≥ 3`, Normal unless `w ≥ 5` or `h ≥ 5`, and, of full params, Normal at
3×6 and 6×3.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 9, diff: DIFF_TRICKY, stripclues: true }` (the
  Normal tier) are encoded in full
- **THEN** the result is `10x9dtS` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 4×4 grid at Normal difficulty
- **THEN** it returns a non-null error string (Normal needs a side ≥ 5)

#### Scenario: A 3×6 Normal board that arrives written still loads

- **WHEN** a game ID carries a 3×6 Normal board with its description
- **THEN** the params are accepted, and the same params are refused when a
  board is to be dealt

### Requirement: Magnets calls its pieces tiles when a player reads about them

Every Magnets hint sentence, the Magnets help page and the refusal of a
description whose layout is inconsistent SHALL call the two-square piece a
tile, and a filled one a magnet or a neutral tile; they SHALL NOT call it a
domino. A tile's halves SHALL be its ends or squares, and a hint sentence
SHALL call a tile marked `?` a marked magnet. The code's names for the layout are not player vocabulary and are
outside this requirement.

#### Scenario: No sentence says domino

- **WHEN** every sentence the Magnets hint can speak is produced, at every value
  that changes its words
- **THEN** none contains "domino"

#### Scenario: The help page says tile

- **WHEN** the Magnets help page is read
- **THEN** it describes filling each tile with a magnet or a neutral tile, and
  never says "domino"

#### Scenario: A game ID whose layout is inconsistent

- **WHEN** a game ID is opened in which one square's letter does not point back
  at its partner
- **THEN** the player reads "This game ID has a tile whose two ends don't point
  at each other."
