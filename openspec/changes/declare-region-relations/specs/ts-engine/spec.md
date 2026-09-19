## MODIFIED Requirements

### Requirement: A cell's regions are one definition per relation

A candidate-elimination game SHALL declare "the regions of a cell" once, as the regions a placed value may not repeat in, each flagged with whether it also holds every value once (`CellRegion.holdsEvery`), and every consumer SHALL derive its relation from that one declaration:

1. the regions that must hold every value once are read by the placement
   classifier (`classifyPlacementInRegions`), which itself skips a region flagged
   `holdsEvery: false`, since a value with one home left in a region must go there
   only if the region has to hold it;
2. every declared region is read by every notes cull: the placement's duplicate
   strike (`regionDuplicateMarks`), the obvious-candidate clean, Mark-all's clean
   and the player's auto-pencil.

Holding every value implies forbidding repeats, so these are the only two kinds of
declared region. A region with only the second property, such as a Solo Killer
cage, SHALL be declared with `holdsEvery: false`. A region with neither, such as a
Keen cage, SHALL NOT be declared, since no consumer reads it. A game whose regions
carry a tag for naming a hidden single SHALL tag only the regions that hold every
value, so that the type refuses a partial region declared as whole.

#### Scenario: The consumers of a relation agree on a cell's regions

- **WHEN** a candidate-elimination game's hint culls a placement's duplicates, cleans
  the obvious candidates, and the player places a value with auto-pencil on
- **THEN** all three strike the value from the same regions, and the hint's culls leave
  no note standing that the solver has struck

#### Scenario: A cage is not a uniqueness region

- **WHEN** the game is Keen (digits may repeat within an arithmetic cage)
- **THEN** `regionsOf` returns only the row and column, so neither the cleanup nor the
  basic-strike removes a candidate that is legal under the cage constraint

#### Scenario: A Killer cage forbids repeats without holding every digit

- **WHEN** the game is Solo with Killer cages and a value is placed in a cage
- **THEN** the culls strike that value from the rest of the cage, and the classifier
  never calls a placement a hidden single in its cage

#### Scenario: The classifier skips a region that need not hold every value

- **WHEN** a placement's value is noted by no other cell of a region declared
  `holdsEvery: false`, and by another cell of each of its whole regions
- **THEN** the classifier does not call it a hidden single in that region
