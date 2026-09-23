## ADDED Requirements

### Requirement: A hint names no row or column by a number the board does not draw

A hint step's sentence SHALL NOT name a row or column by a number ("row 3",
"Column 2"), because no board in the collection draws line numbers. It SHALL
name the line it reasons about as "this row" or "this column" over that line's
hatch, a line it cites beside that one by where it lies or by its mark ("the
striped row", "the column beside it"), and a square it sends a piece to by the
mark on that square ("the outlined square", "the dashed square").

#### Scenario: Every hinting game's narration is free of line numbers

- **WHEN** any hinting game's plan is walked across its tiers and presets
- **THEN** no step's explanation contains a row or column followed by a number

### Requirement: A hint hatches the region its sentence is about

A hint step whose sentence names a region as its subject ("this cage", "this
block", "this area", "the striped region of 5") SHALL hatch that region as it
hatches a named line, and SHALL NOT also outline it; its outline SHALL keep to
the particular cells the reason rests on. A sentence that names a region by its
mark SHALL name it by its stripes.

#### Scenario: A cage deduction hatches its cage

- **WHEN** a Keen step reasons that no way to fill a cage puts a number in a cell
- **THEN** the step hatches exactly that cage's cells and outlines none of them
