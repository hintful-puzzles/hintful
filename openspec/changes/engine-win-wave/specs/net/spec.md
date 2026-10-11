## MODIFIED Requirements

### Requirement: The completion flash ripples through the lifted surface

The completion flash SHALL spread from the source along the wires: a tile's
position SHALL be its distance from the source in tiles along the connections,
through the wrap of a wrapping board and never through a barrier. A lit tile
SHALL swap between the cell surface and the lifted surface, the same surface a
lock gives. The keyboard cursor, the note pin and a hint's ring SHALL stay
rings inside the tile's edge, over whichever surface the tile has.

#### Scenario: The ripple reaches an unlocked tile

- **WHEN** the board is solved and the flash's highlight is on an unlocked tile
- **THEN** that tile is drawn on the lifted surface, and on the cell surface
  again once the highlight has left it

#### Scenario: The ripple reaches a locked tile

- **WHEN** the highlight is on a tile the player locked
- **THEN** that tile is drawn on the cell surface, and on the lifted surface
  again once the highlight has left it

#### Scenario: A neighbor the wires do not join

- **WHEN** a tile beside the source has no wire into it
- **THEN** it lights when the highlight has traveled the wires that do reach
  it, later than the tiles the source is wired to
