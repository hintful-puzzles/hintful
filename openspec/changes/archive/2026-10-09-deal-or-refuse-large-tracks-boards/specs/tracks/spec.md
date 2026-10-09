## MODIFIED Requirements

### Requirement: Tracks generates solver-gated boards reproducibly

`newDesc` SHALL generate the same board for the same seed, and SHALL strip
every clue the board solves at its tier without. It SHALL lay the track by
construction and not by throwing tracks away: a walk that does not leave the
board while a row or column holds no track, and that never steps where the
squares still free no longer reach every such row and column and the bottom
edge. Every clue of a dealt board SHALL therefore be at least 1, at any size
the params allow.

#### Scenario: Generation is reproducible from a seed

- **WHEN** `newDesc` runs twice with the same params and seed
- **THEN** both runs emit the identical Tracks description

#### Scenario: A long thin board deals

- **WHEN** `newDesc` runs at 60x8, 8x60 or 40x12 at Easy
- **THEN** it returns a board that solves at Easy, with every clue at least 1,
  and does not throw `RetryLimitExceeded`

## REMOVED Requirements

### Requirement: Tracks rejects a bare board as too easy only when it solves

**Reason**: Two of its three scenarios can no longer be met or no longer
measure anything. "Easy boards are unchanged" asked for upstream's desc
byte-for-byte from a recorded seed, and the track is now laid another way, so
every seed deals another board. "15x15 deals at the top tier" pinned seven
seeds on which upstream's walk ran the retry bound out; with the stalled-board
rejection planted back, those seeds deal under the new walk all the same
(measured 2026-10-09: 276 ms a board against 146), so the scenario would pass
with the defect in place.

**Migration**: The rule itself is kept as "A stalled bare Tracks board goes on
to clue-laying". That every preset deals at exactly its tier is the
`engine-difficulty` requirement "A cross-game guard asserts that tiers bind".

## ADDED Requirements

### Requirement: Tracks meets singleOnes by bending the track

Under `singleOnes` a dealt board SHALL have no 1 as the clue of the entrance's
column or of the exit's row, and no two 1 clues next to each other in the list
of column clues then row clues. The generator SHALL reach that by bending the
laid track, taking the one step that crosses two such lines round three sides
of a square, and SHALL lay another track only where a bend has no room.

#### Scenario: A long thin board has no forbidden 1

- **WHEN** `newDesc` runs at 60x8, 8x60 or 40x12 at Easy with `singleOnes`
- **THEN** it returns a board with no 1 clue where `singleOnes` forbids one,
  and does not throw `RetryLimitExceeded`

### Requirement: A stalled bare Tracks board goes on to clue-laying

The generator SHALL reject a laid track as too easy only when its bare board
(the row and column counts, the entrance and the exit) solves completely
without reaching the target tier. A bare board that stalls SHALL go on to
clue-laying whatever rungs fired before it stalled, since the clue-laying loop
already refuses any clue that finishes the board below the target tier.

#### Scenario: A stalled bare board is not too easy

- **WHEN** the bare board of a laid track stalls at the target tier without any
  of that tier's rungs having fired
- **THEN** the generator lays clues on it and does not ask for a new track
