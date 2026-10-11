## MODIFIED Requirements

### Requirement: A solved flash drawn as a color takes a shared color

An element the completion flash lights SHALL take the `FLASH` role, which is
one color in every game and none of a game's own. The ground of a cell, a
tile, a region or a hub SHALL be filled with it and SHALL keep what it holds,
and a line SHALL be drawn in it. No game SHALL light an element any other way:
by lifting or swapping a surface, hiding or recoloring what it holds, or
moving it.

#### Scenario: Two white-flashing games flash the same color

- **WHEN** the color two games light their elements in is resolved in either
  scheme
- **THEN** both colors are equal
- **AND** neither is the board's own color in that scheme

#### Scenario: A board that lifts its cells

- **WHEN** a game that draws its givens on the lifted surface is won
- **THEN** a lit given and a lit cell the player filled are the same color, and
  the pieces and glyphs on both are drawn as on any other frame

#### Scenario: A flash that is not a color

- **WHEN** a game whose pieces are beveled tiles, arrows or dominoes is won
- **THEN** a lit piece's ground is the flash color, and nothing spins, swaps
  its colors or is hidden

#### Scenario: A flash along content that has spent the role

- **WHEN** a game's flash runs along ink lines over a bed in a hue of the pair
- **THEN** the lit lines are the flash color, which reads against the ink and
  the bed in both schemes
