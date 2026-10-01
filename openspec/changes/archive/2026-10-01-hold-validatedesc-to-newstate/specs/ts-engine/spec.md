## ADDED Requirements

### Requirement: A pasted game ID is refused or played, never thrown

Every game SHALL answer a description a player enters with a refusal from
`validateDesc` or a board that builds and draws; neither `validateDesc`,
`newState` nor the first `redraw` SHALL throw. This is held by a cross-game
test over two populations: descriptions no generator writes, and near misses
made by breaking each game's real descriptions with one edit (truncated, a
character dropped, doubled, or replaced by a neighbor). The near misses come
from one board per value of each preset axis, generated from a fixed seed, so
a failure names the same game ID every run.

The test can see a disagreement between `validateDesc` and `newState` only
where `newState` throws on what it cannot read. It SHALL say so where it is
defined, with the measured split of games for which that holds, so that a
green run is not read as agreement in a game whose parser skips what it does
not recognize.

#### Scenario: A validator looser than its parser

- **WHEN** a game's `validateDesc` accepts a near miss that its `newState`
  throws on
- **THEN** the test fails, naming the game ID that threw

#### Scenario: A mutator that stopped producing near misses

- **WHEN** the mutants reaching `newState` across the collection fall below
  the floor the test states
- **THEN** the test fails rather than passing over nothing

#### Scenario: Junk is refused by every game

- **WHEN** a game is given each of the malformed descriptions
- **THEN** it refuses at least one of them and throws on none
