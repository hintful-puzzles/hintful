## ADDED Requirements

### Requirement: The engine divides a grid into regions of unequal size

`src/engine/divide.ts` SHALL divide a rectangular grid into connected regions
whose sizes differ, the game supplying only its rule: what two neighboring
regions hold as one or that they may not join, where the regions start, or
the size a region grows to. A game whose regions differ in size SHALL take
its division from there, or SHALL say at its own division what that does
which the engine's walks cannot.

#### Scenario: A game forbids a merge

- **WHEN** a game's rule refuses to join two neighboring regions
- **THEN** no region of the division holds cells from both

#### Scenario: A game asks for a number of regions

- **WHEN** a game asks for regions joined until a number of them is left
- **THEN** the division has that number of regions, each join having been of
  the region with the fewest neighbors its rule let it join

#### Scenario: A rule that cannot be met

- **WHEN** a game's rule refuses every join before the number asked for is
  reached
- **THEN** the division reports that it failed, and does not loop

#### Scenario: A game places the seeds

- **WHEN** a game gives the cells its regions grow from
- **THEN** there are as many regions as cells given, each holds the one it
  grew from, and none encloses another

#### Scenario: A game draws a size

- **WHEN** a game gives the size each region grows to
- **THEN** no region is larger than the size drawn for it, and a region with
  nowhere left to grow ends smaller
