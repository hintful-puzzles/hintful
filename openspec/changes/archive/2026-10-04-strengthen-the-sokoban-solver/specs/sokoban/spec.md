## MODIFIED Requirements

### Requirement: Sokoban generation is deterministic

Sokoban generation SHALL use a reverse-move generator over the shared seeded RNG,
so that a given seed always produces the same board
and shared game IDs remain reproducible. A level SHALL be generated exactly as upstream
generates it, and the board dealt SHALL be the first such level from the seed's stream that
the hint's search finishes from its opening within a fixed budget, so that the hint does not
refuse a board as dealt. A deal SHALL generate no more than a fixed number of levels, and
where the search finishes none of those before the last, it SHALL deal the last as generated,
which can be solved like every level, so that a deal ends at every size.

#### Scenario: The same seed reproduces the same board

- **WHEN** the same size and seed are used twice to generate a game
- **THEN** both runs produce the identical description

#### Scenario: A level past the deal's budget is passed over

- **WHEN** the first level of a seed's stream is one the search cannot finish within the
  deal's budget
- **THEN** the board dealt is a later level of that stream, which the search finishes within it

#### Scenario: A deal ends where the search finishes no level

- **WHEN** a deal is made with a budget in which the search finishes no level
- **THEN** the board dealt is the eighth level of the seed's stream

## ADDED Requirements

### Requirement: Sokoban's search leaves out only what a finishing line can do without

Sokoban's search SHALL report a position lost only where no line of pushes finishes from it,
and SHALL report a line only where each of its pushes can be made and the last leaves the board
finished. It MAY leave out a position that is lost for good. Where floor the player cannot walk
to is fenced by barrels whose every possible push either goes into that floor and can be made
now, or waits on another of those barrels moving, and one of those barrels is off a target or a
target inside is empty, it MAY search only the pushes into that floor. How far a push is from
the nearest barrel or target still out of place SHALL only order the positions searched, and
SHALL never remove one. The search SHALL count its budget in positions and never in time, so
that a position's verdict is the same on every machine.

#### Scenario: The verdicts agree with trying every push

- **WHEN** the search is asked, with a budget it cannot exhaust, on positions of boards small
  enough for every push to be tried, some of them lost
- **THEN** it reports a line exactly where trying every push finds one, the line plays to a
  finished board, and it reports the position lost everywhere else

#### Scenario: Only the pushes into a corral that has to be opened are searched

- **WHEN** a barrel off its target shuts a corridor the player cannot reach, and can only be
  pushed into it
- **THEN** the pushes searched from that position are the pushes into such a corridor, and no
  push of a barrel elsewhere

#### Scenario: A corral that can be left shut prunes nothing

- **WHEN** the only barrel shutting a corridor stands on its target and no target lies behind it
- **THEN** every push the player can make is searched

#### Scenario: A generated level the search once could not finish is within a deal's budget

- **WHEN** the search is asked on the opening of a generated 16×20 level that it could not
  finish within 300,000 positions before pushes were ordered by their distance from what is
  out of place
- **THEN** it finds a line within the budget a deal allows
