## ADDED Requirements

### Requirement: Solver: Keen's ladder is its description

Keen's solver SHALL run the ladder of `keen.description.yaml`: the three cage
readings it states and the Latin library's it places, each at the tier the
description gives it, checked sound against the description's rules, a Latin
square whose cages each make their clue by its sign. The search above them
stays the engine's.

#### Scenario: A value no filling of a cage puts in a cell is struck

- **WHEN** no filling of a cage from its cells' candidates, two cells
  sharing a line apart, that makes its clue puts a value in one of its
  cells, at a cap of Normal or above
- **THEN** the solver strikes it from that cell, in one firing for the cage,
  recorded with the cage's clue and cells

## MODIFIED Requirements

### Requirement: Generation: A cage deduction enumerates the cage's layouts

The cage deductions SHALL enumerate, for each cage, the digit layouts
consistent with the current candidate cube and the cage's operation and value,
and SHALL prune the candidate cube accordingly: at Easy, and only at a cap of
Easy, by amalgamating all values, at Normal by per-square value bitmaps, and
at Tricky by the cross-cage "a digit required in this row or column"
intersection.

#### Scenario: A cage needs a digit in one row

- **WHEN** at Tricky every consistent layout of a cage places a 1 somewhere
  along one row
- **THEN** 1 is removed from the candidates of that row's cells outside the cage
