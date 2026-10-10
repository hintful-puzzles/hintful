## ADDED Requirements

### Requirement: The engine deals a search-tier game's Unreasonable board

A game whose difficulty contract is the search's two tiers SHALL deal its
Unreasonable boards through the engine's deal, and SHALL hold no retry loop
for the tier. The engine SHALL keep a candidate only where the game's
deduction stops short of it and the game's search proves it has one answer.
The game SHALL supply how a candidate is drawn, its deduction, its search,
and a strip where it has one.

#### Scenario: A candidate is kept only with one answer that deduction stops short of

- **WHEN** a game's draw hands the engine a candidate its deduction finishes,
  one its search finds two answers for, and one with a single answer that the
  deduction stops short of
- **THEN** the third is the board dealt

#### Scenario: A size with no such board runs the deal's bound out

- **WHEN** no candidate a game draws at some parameters has the tier
- **THEN** the deal gives up at the bound every deal is under, and is
  answered as a generator that ran out of tries is

#### Scenario: Every game with the search's two tiers deals through the engine

- **WHEN** a game whose contract is the search's two tiers deals an
  Unreasonable board at its first preset that allows one
- **THEN** the engine's deal is what dealt it

### Requirement: A strip is asked within the engine's dealing budget

The engine SHALL ask a strip's questions within one budget of positions, the
same in every game and well under any game's own. It SHALL hand a strip only
a candidate the search proves within that budget, and SHALL ask a stripped
candidate once more before keeping it.

#### Scenario: A strip stops where the dealing budget does

- **WHEN** a board the game's own budget would strip bare is stripped by the
  engine's deal
- **THEN** the board dealt shows as much as the search needs to prove one
  answer within the dealing budget

#### Scenario: A candidate the search cannot prove is not stripped

- **WHEN** a candidate needs more positions than the dealing budget
- **THEN** it is thrown away with nothing taken from it

#### Scenario: A strip that leaves a second answer is thrown away

- **WHEN** a game's strip leaves a board with two answers
- **THEN** the engine does not deal it
