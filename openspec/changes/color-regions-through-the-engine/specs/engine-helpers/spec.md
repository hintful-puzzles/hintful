## ADDED Requirements

### Requirement: The engine assigns a fill to each region of a division

`src/engine/region-fill.ts` SHALL give each region of a division a fill
number below the count it is asked for, such that two regions sharing a side
never take the same one. The assignment SHALL be a function of the division
alone, SHALL spread the fills over the regions, and SHALL throw where the
count is too small for the division.

#### Scenario: Two regions share a side

- **WHEN** a division is assigned fills from four or more
- **THEN** no two regions that share a side have the same fill

#### Scenario: A board is opened again

- **WHEN** the same division is assigned fills twice
- **THEN** each region takes the same fill both times

#### Scenario: Too few fills

- **WHEN** three regions each share a side with the other two and two fills
  are asked for
- **THEN** the assignment throws
