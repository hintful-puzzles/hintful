## MODIFIED Requirements

### Requirement: Solo types the numbers past 9 as letters

On a grid of more than 9 numbers the keys `a`, `b` and so on, in either
case, SHALL enter 10, 11 and so on, up to the grid's size. On a grid of 22
numbers or more `M` SHALL enter 22 in a highlighted cell and SHALL never be
Mark-all, which is then the control's alone.

#### Scenario: Twelve on a 12 by 12 grid

- **WHEN** an empty cell of a `3x4` board is highlighted and `c` or `C` is
  pressed
- **THEN** 12 is entered in it
