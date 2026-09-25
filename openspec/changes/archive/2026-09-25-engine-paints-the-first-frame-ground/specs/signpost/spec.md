## MODIFIED Requirements

### Requirement: Signpost renders region colors, arrows and a blitter drag sprite

`render.ts` SHALL draw the board with the four 16-entry HSV color ramps for region backgrounds and mid
/ dim arrow colors. The drawstate SHALL key a per-cell packed `Int32Array`
cache (region color group, sequence number, arrow direction, and the
immutable / error / cursor / drag-origin / flash / findMistakes-overlay
bits) diffed against the previous frame, with every overlay rebuilt each
frame so it is in the diff key. The drag sprite SHALL use a blitter
(save-restore under the moving arrow), as the Pegs port does. The win-flash
SHALL spin the arrows, honoring the `flash-type` preference (unidirectional
vs meshing gears). The first-draw branch SHALL paint the grid frame over
the ground the midend lays.

#### Scenario: Region colors repaint after linking

- **WHEN** a render scenario links a sequence of cells
- **THEN** the recorded draw ops show each region's cells drawn with its
  assigned background-ramp color, and a subsequent link that merges regions
  repaints the affected cells with the surviving color

#### Scenario: A wrong link renders red

- **WHEN** the findMistakes overlay is active for a wrong link
- **THEN** that cell is drawn with the `COL_ERROR` styling on the next paint
