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

### Requirement: A hint hatches the one line its sentence names

A hint step whose sentence names exactly one row or column as the line it reasons
about ("in this row", "this column's run", "Row 3 still needs") SHALL hatch that
line, and the clue slot at its end where the game draws one, and SHALL hatch
nothing when its sentence names no line or several. It SHALL NOT also outline
that line: an outline marks the particular cells a reason rests on. Every step
that carries a line to hatch SHALL draw the hatch, and no other step SHALL draw
one. The row/column candidate preset SHALL hatch a hidden single's line.

#### Scenario: A hidden single hatches its line and outlines nothing

- **WHEN** a row/column candidate game's plan places a hidden single ("In this
  row, 3 can go in only this cell")
- **THEN** the step hatches exactly the cells of that row and its evidence
  outline is empty

#### Scenario: Every hinting game draws exactly the hatches its steps name

- **WHEN** any hinting game's plan is walked and each step drawn on a full
  repaint
- **THEN** a step naming a line draws hatch operations, and a step naming none
  draws no hatch
