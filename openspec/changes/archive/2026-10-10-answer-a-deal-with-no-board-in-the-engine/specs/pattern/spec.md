## MODIFIED Requirements

### Requirement: An Unreasonable Pattern board has one answer that the lines do not reach

At Unreasonable the generator SHALL accept a grid only when the per-line
solver leaves some cell of it undecided and the search proves its clues have
exactly one answer.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 4×4 to 10×10
- **THEN** the per-line solver leaves each unfinished
- **AND** exactly one picture fits each board's clues, by a count that has no
  search in it
