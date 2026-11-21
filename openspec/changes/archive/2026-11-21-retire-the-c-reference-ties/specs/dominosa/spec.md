## ADDED Requirements

### Requirement: Generation: A Dominosa board is dealt at the tier that alone finishes it

A board of a tier below Unreasonable SHALL be one the ladder finishes at that
tier and not below it. An `Unreasonable` board SHALL be one the ladder at
Tricky stops on and the search finds one answer for.

#### Scenario: A dealt board is graded at its tier

- **WHEN** a board dealt at a tier is graded
- **THEN** it is graded at that tier and not below it, an Unreasonable board by
  the search

## REMOVED Requirements

### Requirement: Generation: A Dominosa tier deals the boards it alone finishes

**Reason**: Its scenario graded upstream's boards against the tiers upstream dealt them at, a C-graded verdict no test holds any more.

**Migration**: Restated, graded on the boards this generator deals, as "Generation: A Dominosa board is dealt at the tier that alone finishes it", held by the tier gate (`src/guards/difficulty-contract.test.ts`).
