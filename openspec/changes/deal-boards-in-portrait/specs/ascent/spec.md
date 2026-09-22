## ADDED Requirements

### Requirement: Ascent's square grids turn and its hexagonal grids do not

Ascent's square-grid presets SHALL be upstream's turned to draw taller than wide (6×7 and 8×10), and its Honeycomb presets, which cannot be turned, SHALL be 6×8 and 8×10: the nearest sizes to upstream's 7×6 and 10×8 that draw taller than wide. `transposeParams` SHALL turn the square-grid modes and return `null` for Hexagon and Honeycomb, because a hexagonal grid on its side is another grid. Hexagon mode's board is a regular hexagon, wider across its corners than across its flats at every size, and SHALL be recorded as wide by nature in the portrait guard's ledger.

#### Scenario: A hexagonal board is never turned

- **WHEN** `transposeParams` is asked to turn Honeycomb or Hexagon params
- **THEN** it returns `null`
