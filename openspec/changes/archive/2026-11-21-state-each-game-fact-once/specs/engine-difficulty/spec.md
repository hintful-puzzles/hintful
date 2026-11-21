## MODIFIED Requirements

### Requirement: A game's tiers are read from its difficulty item

The tier names SHALL be read from the game's difficulty item, the list a player
picks from, through `difficultyTiers(game)`. `tierOf` and `withTier` SHALL read
and set a tier through the same item. The list SHALL NOT be derived from the
game's `DIFF_*` constants, which also hold values past the tiers, and SHALL NOT
be derived from its deduction techniques.

#### Scenario: A game's constants outnumber its tiers

- **WHEN** a game declares more `DIFF_*` constants than it offers tiers, as Solo
  does with two that are solver verdicts
- **THEN** its tier list is the one its form offers

#### Scenario: A change proposes deriving tiers from techniques

- **WHEN** a change proposes projecting the tier list from the technique ladder
- **THEN** it is refused without surveying the games again
- **AND** the refusal is reconsidered only when a technique carries a tier
  name, a ladder can be declared without a board, and every tier a game offers
  is a rung: all three, since any one left standing defeats the projection

## ADDED Requirements

### Requirement: Code names a tier by its description's name

A described game's compiled module SHALL export `TIER`, each tier's index by
its name in lower case, and `SCALE` the same for each of its other scales. A
game's code SHALL read a tier's index from it: a `DIFF_*` constant holding one
SHALL be named for the tier it holds, and none SHALL write the index as a
number. A source scan SHALL fail a constant that does either.

#### Scenario: A constant holds one tier under another's name

- **WHEN** a game declares `DIFF_TRICKY = TIER.normal`
- **THEN** the scan fails, naming the constant and the tier it holds

#### Scenario: A tier is removed from a description

- **WHEN** a description drops a tier that a game's code still names
- **THEN** the game no longer typechecks
