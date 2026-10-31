## ADDED Requirements

### Requirement: A compiled technique may read a grid's corners

A description's `space.corners` SHALL give the points inside the grid where
four cells meet, as elements in reading order, with `cells(k)` a corner's
four cells in reading order, `corners(c)` a cell's corners, and
`across(k, c)` the cell diagonally across a corner from another, and a clue
kind SHALL be able to sit at a corner.

#### Scenario: A clue read across a corner

- **WHEN** a technique binds `k in corners(c)` on a board dealt a sum clue
  at that corner
- **THEN** `clue(sum, k)` is its value, and `across(k, c)` is the cell that
  shares the corner with `c` and neither its row nor its column
