## REMOVED Requirements

### Requirement: Tracks computes live errors and completion as upstream

**Reason**: It made the completed flag latch, and its scenario "Completion
latches" states that (the code had in fact recomputed it, as upstream does). A
game's status is now judged from the board alone, and no completion flag exists.

**Migration**: Replaced by "Tracks computes live errors as upstream and judges
completion from the board", which keeps the error rules and both error
scenarios unchanged.

## ADDED Requirements

### Requirement: Tracks computes live errors as upstream and judges completion from the board

`executeMove` SHALL recompute error state exactly as upstream
`check_completion` with marking: a cell with more than two track edges is an
error; every cell on a track loop (via the shared `findLoops` over the track
graph) is an error; once a continuous entrance→exit path exists, any track cell
not on that path is an error; and a row or column whose track cells exceed its
clue, whose no-track cells exceed the complement, or whose completed track
count fails to match the clue once a path exists, is a clue error. The board
SHALL be reported solved exactly while no errors exist and every clue's
completed track count matches, judged from the board however it was reached.

#### Scenario: A loop is flagged

- **WHEN** track edges are placed forming a closed loop
- **THEN** every cell on the loop carries the error flag

#### Scenario: An over-filled clue is flagged

- **WHEN** a row has more track cells than its clue number
- **THEN** that row's clue is marked in error

#### Scenario: Completion follows the board

- **WHEN** a continuous entrance→exit track is laid meeting every clue with no
  loop
- **THEN** `status` reports the board solved
- **AND** a later move that breaks the track or a clue reports it unsolved again
