## ADDED Requirements

### Requirement: A wing outlines its middle cell and its ends, and strikes one cell

A wing SHALL be recorded with its middle cell, its ends and the value it
strikes, and SHALL strike one cell per firing. Its step SHALL outline the
middle cell and the ends, ring the struck cell, and say that whatever the
middle cell is, an end, or where the middle could be the value itself the
middle or an end, sharing a region with the struck cell is that value. The
outlined cells SHALL be the step's whole premise, so under the implicit
reading the walk writes their notes before the step.

#### Scenario: A wing's sentence names its cells

- **WHEN** a row/column game's hint strikes a candidate by a wing
- **THEN** the step outlines the middle cell and the ends and its sentence
  reads "Whatever the middle cell is, an end in line with this cell is …"

#### Scenario: A help page says what a wing is

- **WHEN** a game's hint can be a wing
- **THEN** its help page writes `{{wing}}` in its Hints section, and the build
  fails a page that leaves it out or a page of another game that writes it
