## ADDED Requirements

### Requirement: An aperiodic description builds the same grid in every build

For the aperiodic tilings, a description SHALL build the same grid, numbered
the same, in every build, because a Loopy game ID carries the patch's
description and then a clue per face in face order. Which patch a seed deals
is not held across builds. The weight constants SHALL be integers and SHALL
NOT be recomputed from irrational expressions.

#### Scenario: A recorded description builds its recorded grid

- **WHEN** `grid-aperiodic-numbering.test.ts` builds each description its
  committed fixture records, drawing no randomness
- **THEN** the faces, edges and dots it builds are numbered and linked as the
  fixture records

#### Scenario: A seed deals another patch after a change

- **WHEN** a change makes `gridNewDesc` deal another patch for a seed
- **THEN** no test fails for that alone, since no saved game or shared game ID
  names a seed

## REMOVED Requirements

### Requirement: Aperiodic description generation is stable across builds

**Reason**: It held which patch a seed deals to a recording of upstream's C. No board a player keeps names a seed, so only what a description builds needs to be stable.

**Migration**: "An aperiodic description builds the same grid in every build" holds the description's grid and numbering; determinism within a build is `engine-difficulty`'s "A generator's board depends only on its params and its random state".
