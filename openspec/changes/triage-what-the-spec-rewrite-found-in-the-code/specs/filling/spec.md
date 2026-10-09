## MODIFIED Requirements

### Requirement: Filling's frame is as heavy as a border between two regions

The board's edge is always a region's border, and the frame SHALL be as heavy
as a border between two regions and no heavier.

#### Scenario: The edge of the board

- **WHEN** the opening frame is drawn
- **THEN** the line round the board is ink, and with each edge cell's own
  border it is exactly as thick, on all four sides, as the border between two
  differing filled cells

### Requirement: Filling builds a selection of cells

`interpretMove` SHALL support selecting cells: a left-click and a left-drag
SHALL build a selection, the keyboard cursor SHALL select several cells,
`CURSOR_SELECT2` at a shown cursor SHALL toggle the cursor's cell in the
selection unless the cell is a clue, and Escape SHALL clear it. The selection
SHALL be cleared after every committed move.

#### Scenario: Escape clears the selection

- **WHEN** two cells are selected and Escape is pressed
- **THEN** no cell is selected

#### Scenario: The first select press only shows the cursor

- **WHEN** the cursor is hidden and `CURSOR_SELECT2` is pressed
- **THEN** the cursor is shown and no cell joins the selection
