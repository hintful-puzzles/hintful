## REMOVED Requirements

### Requirement: Slant computes live errors and completion as upstream

**Reason**: It made the completed flag latch, and its scenario "Completion
latches" states that. A game's status is now judged from the board alone, so a
solved board the player breaks reads unsolved, and no completion flag exists.

**Migration**: Replaced by "Slant computes live errors as upstream and judges
completion from the board", which keeps the error rules and both error
scenarios unchanged.

## ADDED Requirements

### Requirement: Slant computes live errors as upstream and judges completion from the board

`executeMove` SHALL recompute error state exactly as upstream
`check_completion`: every diagonal lying on a loop edge (per the shared
findloop helper over the vertex graph) is a loop error; every clue vertex
whose degree exceeds its clue or whose maximum achievable degree is below
its clue is a vertex error; every diagonal in the border-connected vertex
component is grounded. The board SHALL be reported solved exactly while no
errors exist and no square is blank, judged from the board however it was
reached.

#### Scenario: A closed loop is flagged

- **WHEN** diagonals are placed forming a closed loop
- **THEN** each diagonal on the loop carries the loop-error flag

#### Scenario: An over-committed clue is flagged

- **WHEN** a vertex clue `1` has two incident diagonals
- **THEN** that vertex carries the vertex-error flag

#### Scenario: Completion follows the board

- **WHEN** the last blank square is filled consistently with all clues and
  no loop exists
- **THEN** `status` reports the board solved
- **AND** a later move that leaves a square blank or makes an error reports it
  unsolved again
