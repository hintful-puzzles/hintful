## MODIFIED Requirements

### Requirement: Params: Same Game refuses params it cannot deal

The colors field's bounds SHALL refuse fewer than three colors, and
`validateParams` SHALL refuse a grid of a single square.

#### Scenario: Two colors, and one square

- **WHEN** the engine's params check is given two colors, or a `1×1` grid
- **THEN** it answers "No. of colors must be at least 3." for the first, in
  the words the bounds generate for the field the Custom dialog shows, and
  "Grid area must be greater than one." for the second

### Requirement: Controls: Same Game's keyboard cursor acts where it stands

Same Game SHALL take its presses, its cursor and its select keys from its
`targetVerbs` declaration (`engine-input`, "The engine owns a declaring game's
press and select keys"), whose square grid wraps the cursor at the board's
edges. A select key on a shown cursor SHALL act on the tile there as a click
there does.

#### Scenario: Select at the cursor picks the group, then removes it

- **WHEN** the cursor shows on a removable tile and `CURSOR_SELECT` is pressed
- **THEN** the tile's connected same-color region is selected
- **WHEN** `CURSOR_SELECT` is pressed again
- **THEN** `interpretMove` returns the `remove` move for that region
