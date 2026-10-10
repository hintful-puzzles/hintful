## ADDED Requirements

### Requirement: Tracks generates solver-gated boards

`newDesc` SHALL strip every clue the board solves at its tier without. It
SHALL lay the track by construction and not by throwing tracks away: a walk
that does not leave the board while a row or column holds no track, and that
never steps where the squares still free no longer reach every such row and
column and the bottom edge. Every clue of a dealt board SHALL therefore be at
least 1, at any size the params allow.

#### Scenario: A long thin board deals

- **WHEN** `newDesc` runs at 60x8, 8x60 or 40x12 at Easy
- **THEN** it returns a board that solves at Easy, with every clue at least 1,
  and does not throw `RetryLimitExceeded`

## REMOVED Requirements

### Requirement: Tracks generates solver-gated boards reproducibly

**Reason**: Restated as "Tracks generates solver-gated boards". Retitled without "reproducibly", and the first clause and its scenario go:
both are `engine-difficulty`, "A generator's board depends only on its params
and its random state". Nothing cites the title. The rest is unchanged.
