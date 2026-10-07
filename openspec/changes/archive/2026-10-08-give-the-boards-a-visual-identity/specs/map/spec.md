## ADDED Requirements

### Requirement: Map draws an uncolored region on the collection's quiet surface

`redraw` SHALL fill a region that has no color with the collection's cell
surface, so the map reads as a field apart from the board round it and the
four fills are all the color on it. The four fills and the ink region borders
are the game and SHALL stay as they are. The drag blob that carries "no color"
and a region blanked by the completion flash SHALL take the same surface.

#### Scenario: An uncolored region is the cell surface

- **WHEN** a board with an uncolored region is drawn
- **THEN** that region is filled with the cell surface
- **AND** a colored region beside it keeps its fill, with the ink border
  between them
