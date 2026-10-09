## MODIFIED Requirements

### Requirement: The pencil-mode indicator is legible against the canvas

The pencil-mode indicator's glyph SHALL be sized by `pencilIndicatorBox` as half
a tile less its insets, clamped between a floor and a ceiling in CSS pixels, so a board of many
small tiles still shows a glyph that reads against its canvas and a coarse board
on a large screen does not grow it past the size of a toolbar icon.

#### Scenario: A fine-grained board shows a glyph that reads

- **WHEN** a note-taking game's board, at any of its presets, is fitted to a phone-sized or laptop-sized canvas slot
- **THEN** the indicator glyph is at least 3.5% of the canvas's shorter side
