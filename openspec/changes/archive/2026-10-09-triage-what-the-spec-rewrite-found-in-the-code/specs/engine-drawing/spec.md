## MODIFIED Requirements

### Requirement: Midend.forceRedraw repaints from a fresh draw state without a canvas clear

The engine SHALL expose `Midend.forceRedraw(dr)` for a replacement that does
not clear the canvas but invalidates the color and font choices baked into
cached tiles. It SHALL discard the draw state, the same effect as
`canvasCleared`, and immediately call `redraw(dr)`, which lays the ground and
lets the game paint a fresh frame over it in the new palette. The worker
adapter SHALL invoke `forceRedraw` when `setDrawingPalette` installs the first
palette or replaces one already installed.

#### Scenario: A palette replacement repaints without clearing the canvas

- **WHEN** the worker adapter receives a `setDrawingPalette` call that
  replaces an already-installed palette (e.g. the user toggles
  light/dark mode)
- **THEN** the adapter calls `engine.forceRedraw(dr)`, which discards
  the drawstate and runs `redraw`
- **AND** the ground and the game's full frame are painted in the new
  palette over the existing canvas content

#### Scenario: The first palette arrives after the game asked for its first frame

- **WHEN** a game is dealt before any palette is installed, so the repaint it
  asked for was dropped
- **AND** `setDrawingPalette` then installs the first palette
- **THEN** the adapter calls `engine.forceRedraw(dr)` and the board is painted,
  with no other event needed
