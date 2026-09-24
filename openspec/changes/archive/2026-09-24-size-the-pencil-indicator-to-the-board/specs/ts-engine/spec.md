## ADDED Requirements

### Requirement: The pencil-mode indicator is legible against the canvas and never covers the board

The pencil-mode indicator's glyph SHALL be sized by `pencilIndicatorBox` as half a tile less its insets, clamped between 20 and 48 CSS pixels, so a board of many small tiles still shows a glyph that reads against its canvas and a coarse board on a large screen does not grow it past the size of a toolbar icon. Every game that takes notes SHALL reserve at least `pencilIndicatorReach(tileSize)` at the canvas's top-right corner at every tile size, either with a margin never narrower than the reach or by growing its canvas with `pencilIndicatorCanvas`; a margin of exactly half a tile SHALL NOT be relied on, because the floor makes the glyph wider than that on a small tile. `pencil-indicator-placement.test.ts` asserts both halves.

#### Scenario: A fine-grained board shows a glyph that reads

- **WHEN** a note-taking game's board, at any of its presets, is fitted to a phone-sized or laptop-sized canvas slot
- **THEN** the indicator glyph is at least 3.5% of the canvas's shorter side

#### Scenario: Nothing of the board is under or over the glyph

- **WHEN** a note-taking game draws a frame with pencil mode off, at any tile size from 12 to 96 pixels
- **THEN** the only thing it paints inside the indicator's box is the background the indicator erases to, underneath the indicator
