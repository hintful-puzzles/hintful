## ADDED Requirements

### Requirement: A per-cell overlay reaches the render cache through the shared sidecar

Any per-cell overlay a game paints on top of its tiles, the hint overlay and
the mistake overlay alike, SHALL reach the render cache through the shared
overlay sidecar (`engine/overlay-sidecar.ts`) and not through a per-game
re-derivation of the repack, stale and commit steps. The one exception is a
game whose overlay does not fit the per-cell shape, which SHALL be recorded as
a no-go with its reason.

#### Scenario: A mistake overlay reaches the cache the same way the hint overlay does

- **WHEN** a game paints a per-cell mistake overlay (the `findMistakes`
  highlight) over tiles whose values are otherwise unchanged
- **THEN** the overlay is carried by the shared overlay sidecar (packed per
  frame, stale-compared in the cache-miss test, committed after draw), so a
  Check & Save on an already-drawn board repaints the flagged cells

### Requirement: GameDrawing draws the hint's line hatch

`GameDrawing` SHALL expose `drawHatch(rect, color, period)`: translucent
diagonal bands of `color`, half of `period` wide, clipped to `rect` and laid on
the lines `x + y = k · period` of the whole canvas, so neighboring rects
hatched separately form one unbroken pattern. Every `GameDrawing`
implementation SHALL take the band geometry from the engine's `hatchBands` and
the opacity from its one constant, and a hatching game's stripes SHALL be
visible against its board in both color schemes.

#### Scenario: Two tiles hatched separately join up

- **WHEN** a game hatches two adjacent tiles in separate calls
- **THEN** whether any point is striped depends on its canvas coordinates alone,
  so the stripes run on across the shared edge

#### Scenario: A hatching game's stripes show in both schemes

- **WHEN** a game whose code calls `drawHatch` shows a hint that hatches a line
- **THEN** the hatch color blended over its board background at the hatch
  opacity differs from the background by more than the stripe-visibility bar, in
  the light and the dark palette the app paints

## REMOVED Requirements

### Requirement: A game's render test records through the shared recording drawing

**Reason**: Moved to `testing`, with its words.

### Requirement: The capability snapshot records a draw state's field names and judges none

**Reason**: Moved to `testing`, with its words.
