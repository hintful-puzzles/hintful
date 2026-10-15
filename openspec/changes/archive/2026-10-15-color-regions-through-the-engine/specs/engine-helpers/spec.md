## ADDED Requirements

### Requirement: The engine colors the regions of a division with one walk

`src/engine/region-fill.ts` SHALL give each region a fill number below the
count asked for, such that two regions sharing a side never take the same
one, or report that there is none. The walk SHALL ask its caller which of
the regions tied for fewest fills left goes next and in what order its fills
are tried, once each at every step, so that a caller's random draws fall in
a fixed order.

#### Scenario: Two regions share a side

- **WHEN** a division is colored from four or more fills
- **THEN** no two regions that share a side have the same fill

#### Scenario: Map's generator draws through the walk

- **WHEN** Map's generator colors a map with upstream's draws as the choice
- **THEN** its descriptions match the frozen reference byte for byte

#### Scenario: No coloring exists

- **WHEN** three regions each share a side with the other two and two fills
  are asked for
- **THEN** the walk reports that there is none

### Requirement: A board's regions take fills that are the division's alone

The engine SHALL assign fills to the regions a puzzle gives without a random
draw, so that the same division takes the same fills each time, and SHALL
spread the fills over the regions.

#### Scenario: A board is opened again

- **WHEN** the same division is assigned fills twice
- **THEN** each region takes the same fill both times
