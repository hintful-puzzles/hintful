## MODIFIED Requirements

### Requirement: The completion flash sweeps the squares holding digits

The completion flash SHALL sweep the squares holding digits diagonally: a
square's position SHALL be that of its place in the grid, and a lit square
SHALL be filled with the shared flash color under its digit. A wall SHALL
never be lit. The selection SHALL be hidden while the flash runs.

#### Scenario: A wall takes no part in the flash

- **WHEN** the completion flash runs
- **THEN** each square holding a digit is filled with the flash color for one
  stretch of frames and is on the lifted surface otherwise, and each wall keeps
  its fill
