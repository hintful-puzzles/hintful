## MODIFIED Requirements

### Requirement: A solved flash drawn as a color takes a shared color

An element the completion flash lights SHALL take a shared color and none of
the game's own. A lit cell takes the lifted surface (`givenSurface`), a step
off the cell that reads in both schemes, and a cell that already rests on the
lifted surface takes the plain one, so every lit cell changes. A lit line
takes the `FLASH` role, maximum contrast against the surface and inverting
with the scheme. A game that lights in another color SHALL say why at the
assignment.

#### Scenario: Two white-flashing games flash the same color

- **WHEN** two games that light their lines in white on completion are resolved
  in either scheme
- **THEN** both flash colors are equal
- **AND** neither is the board's own color in that scheme

#### Scenario: A board that lifts its cells

- **WHEN** a game whose flash lifts its cells also draws givens
- **THEN** a lit cell is the color of the cell under a given, a lit given is
  the color of a plain cell, and the pieces and glyphs on both are drawn as on
  any other frame

#### Scenario: A flash that is not a color

- **WHEN** a lit element swaps two of its own colors (a domino's fill and its
  number) or drops a beveled tile's face to the board under it
- **THEN** it takes neither color and owes no reason

#### Scenario: A flash along content that has spent the role

- **WHEN** a game's flash runs along ink lines over a bed in a hue of the pair,
  where `FLASH` is the lines' opposite in one scheme and close to the bed in
  the other
- **THEN** it takes another shared role, and the assignment says so
