## MODIFIED Requirements

### Requirement: Clusters is painted by click, drag and keyboard cursor

Clusters SHALL be played by clicking or dragging to paint cells and by a keyboard
cursor. A left click or drag SHALL cycle a cell toward blue and a right click or
drag toward red, each also able to clear a cell; a drag SHALL paint every cell it
passes. The keyboard cursor SHALL place blue, red or blank via dedicated keys.
Given dot cells SHALL never be overwritten.

#### Scenario: Dragging paints a run of cells

- **WHEN** a drag is started and moved across several blank cells
- **THEN** every non-given cell it passes is painted the drag color on release

#### Scenario: A drag over a given leaves the given alone

- **WHEN** a drag passes over a given dot cell and is released
- **THEN** the given keeps its color and its dot
