## MODIFIED Requirements

### Requirement: Solver: Singles deductive solver

Singles' ladder SHALL be compiled from its description, each technique checked sound. Easy SHALL read: a covered square's neighbors are clear; a clear square's number is covered elsewhere in its lines; the sandwich, the touching pair and the corner; and a square with one neighbor not covered has it clear. Normal SHALL add the neighboring-line pairs, and a square without which the uncovered squares would not be one group is clear. A false conclusion SHALL report the marks broken.

#### Scenario: Solver completes a generated board

- **WHEN** a board generated at a given difficulty is solved by the solver from
  its initial numbers
- **THEN** the solver fully determines every cell (black or white) with no errors

#### Scenario: A square the uncovered ones would fall apart without

- **WHEN** the solver at Normal meets an open square without which the squares not covered would be in two groups
- **THEN** it makes the square clear, whether or not a covered square sits diagonally beside it
