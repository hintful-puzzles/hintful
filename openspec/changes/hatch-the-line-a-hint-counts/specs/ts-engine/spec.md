## ADDED Requirements

### Requirement: GameDrawing draws the hint's line hatch

`GameDrawing` SHALL expose `drawHatch(rect, color, period)`: translucent diagonal
bands of `color`, half of `period` wide, clipped to `rect` and laid on the lines
`x + y = k · period` of the whole canvas, so that neighboring rects hatched
separately form one unbroken pattern. Every `GameDrawing` implementation SHALL
take the band geometry from the engine's one definition (`hatchBands`) and the
opacity from its one constant, and a hatching game's stripes SHALL be visible
against its board in both color schemes.

#### Scenario: Two tiles hatched separately join up

- **WHEN** a game hatches two adjacent tiles in separate calls
- **THEN** whether any point is striped depends on its canvas coordinates alone,
  so the stripes run on across the shared edge

#### Scenario: A hatching game's stripes show in both schemes

- **WHEN** a game whose code calls `drawHatch` shows a hint that hatches a line
- **THEN** the hatch color blended over its board background at the hatch
  opacity differs from the background by more than the stripe-visibility bar, in
  the light and the dark palette the app paints
