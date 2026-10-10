## ADDED Requirements

### Requirement: A Tracks press outside the grid, or a no-track drag over track, makes no move

An interaction outside the grid SHALL produce no history move. A right-drag
SHALL set no no-track mark on a square that holds track.

#### Scenario: A no-track drag over squares that hold track

- **WHEN** a right-drag (no-track) covers only cells that already hold track,
  so no flag can change
- **THEN** `interpretMove` returns no history move

## REMOVED Requirements

### Requirement: A Tracks interaction that changes nothing makes no move

**Reason**: Restated as "A Tracks press outside the grid, or a no-track drag over track, makes no move", which keeps what is Tracks' own: the press outside the grid, which Tracks' own press arm refuses, and the case of the one scenario, a square holding track that takes no no-track mark, with the scenario's words under a name that says so. That a move which would change nothing produces no history move is `ts-engine`, "A move that leaves the board as it was is no step of the history", and the title said only that.
