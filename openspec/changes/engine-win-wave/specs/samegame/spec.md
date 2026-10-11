## MODIFIED Requirements

### Requirement: Same Game's flash lifts the field and leaves the tiles

A flash SHALL lift the field to the lifted surface and leave the tiles
standing. The completion flash, on a cleared board, SHALL sweep the field's
cells and leave the margin inside the frame at rest. The flash of a board with
no move left is the game's own (`flashLength`): on its lit beats it SHALL lift
the whole field at once, the gaps and the margin included.

#### Scenario: A cleared board

- **WHEN** the last tiles are removed and frames of the flash are drawn
- **THEN** the first lit cell is the bottom-left one, every cell is lit on some
  frame, and the margin is never lit

#### Scenario: A lit beat

- **WHEN** a board with tiles left and no move is drawn on a lit beat
- **THEN** the emptied cells, the gaps and the margin inside the frame are
  drawn in the lifted surface
- **AND** every tile keeps its color
