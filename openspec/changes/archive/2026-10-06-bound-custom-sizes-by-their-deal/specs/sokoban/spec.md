## MODIFIED Requirements

### Requirement: Sokoban generation is deterministic

Sokoban generation SHALL use a reverse-move generator over the shared seeded RNG,
so that a given seed always produces the same board
and shared game IDs remain reproducible. A level SHALL be generated exactly as upstream
generates it, and the board dealt SHALL be the first such level from the seed's stream that
the hint's search finishes from its opening within a fixed budget, so that the hint does not
refuse a board as dealt. A deal SHALL generate no more than a number of levels fixed by the
board's area, eight at every menu size and more on a larger board in proportion to how
seldom the search finishes a level there, and
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

- **WHEN** a deal is made at a menu size with a budget in which the search finishes no level
- **THEN** the board dealt is the eighth level of the seed's stream

#### Scenario: A larger board is given more levels

- **WHEN** a deal is made on a board larger than the menu's with a budget in which the
  search finishes no level
- **THEN** the board dealt is a later level of the seed's stream than the eighth

## ADDED Requirements

### Requirement: Sokoban deals no level past the area its search can open

Sokoban SHALL refuse to deal a level on a board of more than 1200 squares, with a sentence
that names the limit, since the levels a deal must generate there to find one the hint can
open take longer than a player would wait. The refusal SHALL apply only when a level is to
be dealt: a board that arrives with its description SHALL load at any size.

#### Scenario: A board past the limit is refused when dealing

- **WHEN** the Custom dialog or a type link asks for a board whose width times height is
  more than 1200
- **THEN** no level is dealt and the refusal says the limit

#### Scenario: A board past the limit loads from its description

- **WHEN** a game ID carries a description for a board of more than 1200 squares
- **THEN** its params are accepted
