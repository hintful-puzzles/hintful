## MODIFIED Requirements

### Requirement: Separate descriptions encode the letters grid

The desc SHALL be the `w·h` letters in row-major order, each an uppercase letter
`A + grid[i]` (so `k` distinct letters `A..`), exactly as upstream's
`new_game_desc` emits. `validateDesc` SHALL reject a desc of the wrong length or
containing a character outside `A .. A+k-1`. `newState` SHALL parse the desc into
the immutable letters array and an all-unknown wall state (only the grid rim
walls set).

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and its letters are
  re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc of the wrong length or with a letter
  outside the alphabet `A .. A+k-1`
- **THEN** it returns a non-null error string
