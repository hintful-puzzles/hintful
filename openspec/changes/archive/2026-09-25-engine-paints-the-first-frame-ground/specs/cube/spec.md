## MODIFIED Requirements

### Requirement: Cube renders the solid, grid, and rolling animation

The Cube `redraw` SHALL draw the arena's grid squares (blue squares
distinguished from background), the solid projected to two dimensions with its
isometric shear and back-face culling, and a roll animation interpolating the
solid's orientation from the previous square to the current one over the roll
duration. Cube fully repaints every frame (its scene is a handful of polygons)
— there is no per-tile cache and **no win flash** (upstream's `flash_length`
is 0; completion is reported only in the status bar). Cube SHALL fill its
background rect on every frame, which erases the previous one.

#### Scenario: Draw output contains grid squares and the solid

- **WHEN** `redraw` runs against a recording `GameDrawing` double for a fresh
  board
- **THEN** the recorded operations include the grid squares (with blue squares
  drawn in the blue color) and the solid's projected polygons

#### Scenario: A roll animates between squares

- **WHEN** a roll move has just executed and `redraw` runs mid-animation
- **THEN** the solid is drawn at an interpolated orientation between its
  previous and current squares, settling exactly on the destination square at
  animation end
- **AND** the grid squares and face paint drawn during the animation are the
  pre-move (old) state's, since the roll visibly happens before the paint
  swap settles
