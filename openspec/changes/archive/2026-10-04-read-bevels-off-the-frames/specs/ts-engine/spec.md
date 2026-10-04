## ADDED Requirements

### Requirement: A bevel a game draws is lit from one side in both schemes

For every bevel on a game's frames, the lighter of its two colors in the light scheme SHALL be the lighter of the two in the dark scheme, as the app paints them.

The bevels SHALL be read off the game's own draw record by shape, two polygons drawn one after the other that split one box along its diagonal, so that a game is covered by drawing a bevel and not by declaring one. Two shapes drawn one over the other SHALL NOT be read as a bevel.

A bevel whose two colors are also used as tints SHALL take palette slots of its own, since exchanging a slot's dark value changes every use of it.

#### Scenario: A bevel with no declared swap fails

- **WHEN** a game draws a raised bevel in two colors derived from the board
- **AND** it declares no exchange for them
- **THEN** the cross-game guard fails and names the game and the pair

#### Scenario: A new game is covered without being listed

- **WHEN** a game that draws a bevel is added to the catalog
- **THEN** its bevel is checked by the same guard with no edit to the guard

#### Scenario: The guard reads something

- **WHEN** the guard runs
- **THEN** it finds a bevel in a game that draws through each shared helper and in a game that draws its own, and fails if it finds none
