## MODIFIED Requirements

### Requirement: A solved flash drawn as a color takes a shared color

An element the completion flash lights SHALL take one of two roles, the same
in every game and none of a game's own: `FLASH_LEAD` under the highlight's
leading edge and `FLASH` under its body. The ground of a cell, a tile, a
region or a hub SHALL be filled with the role's color and SHALL keep what it
holds, and a line SHALL be drawn in it. No game SHALL light an element any
other way: by lifting or swapping a surface, hiding or recoloring what it
holds, or moving it.

#### Scenario: Two white-flashing games flash the same color

- **WHEN** the two colors two games light their elements in are resolved in
  either scheme
- **THEN** the games' lead colors are equal and their body colors are equal
- **AND** the lead is white and the body is not, in both schemes

#### Scenario: A board that lifts its cells

- **WHEN** a game that draws its givens on the lifted surface is won
- **THEN** a lit given and a lit cell the player filled are the same color
  under the same tone, and the pieces and glyphs on both are drawn as on any
  other frame

#### Scenario: A flash that is not a color

- **WHEN** a game whose pieces are beveled tiles, arrows or dominoes is won
- **THEN** a lit piece's ground is a flash color, and nothing spins, swaps its
  colors or is hidden

#### Scenario: A flash along content that has spent the role

- **WHEN** a game's flash runs along ink lines over a bed in a hue of the pair
- **THEN** the lit lines are the flash colors, which read against the ink and
  the bed in both schemes
