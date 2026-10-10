## ADDED Requirements

### Requirement: A generator's board depends only on its params and its random state

The board `newDesc` returns SHALL depend on nothing but its params and the
random state it is handed: called again with the same params and a state at
the same point of its stream, it SHALL return the same description and the
same aux. A generator SHALL take every random choice from that state, and
no clock, no other source of randomness and nothing an earlier deal left
behind SHALL choose its board. The promise is of one build: a change to a
generator may change the board a seed deals.

#### Scenario: A game ID carrying a seed opens one board

- **WHEN** a `<params>#<seed>` game ID is loaded twice in one build, and each
  load finds a board
- **THEN** both loads show the same board
- **AND** Solve is handed the same aux on each

#### Scenario: A generator that draws again draws on

- **WHEN** a generator throws a candidate away and draws another, or one of
  its stages runs out and the stage before it is drawn again
- **THEN** the next draw continues the stream it was handed, so the board it
  ends on is still the seed's

#### Scenario: A generator keeps what it computed between deals

- **WHEN** a generator memoizes a value across calls, and the same params and
  seed are dealt before and after a deal of another board
- **THEN** both deals return the same description

#### Scenario: A change moves the board a seed deals

- **WHEN** a change to a generator makes a seed deal a different board
- **THEN** nothing a player holds is broken, since a saved game and a shared
  game ID carry the description
