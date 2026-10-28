## MODIFIED Requirements

### Requirement: A wing outlines its middle cell and its ends, and strikes one cell

A wing SHALL record its middle cell, its ends and the value it strikes, and
strike one cell a firing. Its step SHALL outline the middle cell and the
ends, ring the struck cell, and say that whatever goes in the middle cell, an
outlined cell (or the middle, where it could be the value) sharing a region
with the struck cell must have that value. The outlined cells SHALL be the
step's whole premise, so under the implicit reading the walk writes their
notes first.

#### Scenario: A wing's sentence names its cells

- **WHEN** a row/column game's hint strikes a candidate by a wing
- **THEN** the step outlines the middle cell and the ends and its sentence
  reads "Whatever goes in the middle cell, an outlined cell in line with this
  cell must have …"
- **AND** the ends are named by their mark, with no noun of their own

#### Scenario: A help page says what a wing is

- **WHEN** a game's hint can be a wing
- **THEN** its help page writes `{{wing}}` in its Hints section, and the build
  fails a page that leaves it out or a page of another game that writes it
