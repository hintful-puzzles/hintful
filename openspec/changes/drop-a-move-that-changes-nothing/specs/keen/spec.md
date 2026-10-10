## MODIFIED Requirements

### Requirement: Keen interprets digit, pencil, and mark-all input

With a cell highlighted, a digit key `1..w` SHALL enter that digit, or in
pencil mode toggle that pencil mark, and backspace or space, which is the
cursor-select2 key, SHALL clear the cell.

#### Scenario: Placing and penciling digits

- **WHEN** a cell is highlighted and a digit key is pressed
- **THEN** that digit is placed in the cell, or in pencil mode its pencil mark
  is toggled
