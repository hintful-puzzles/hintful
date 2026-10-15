## ADDED Requirements

### Requirement: The palette holds one set of fills for regions

The palette SHALL hold one region palette of eight faint fills, with no red
and no gray, of which a board takes the first four, six or eight. Any two
members SHALL stand at least the floor two neighbors are held to apart, in
both schemes.

#### Scenario: Two regions side by side take any two members

- **WHEN** any two members of the set are measured in either scheme
- **THEN** they stand at least the neighbor floor apart

### Requirement: A fill that is the player's answer is stronger in the dark scheme

Where a region's fill is the player's answer and is named to them, as in Map,
the game SHALL take the region palette's first four at their answer step:
the same values in the light scheme, and in the dark scheme a lighter and
stronger value, at which the color's name is true and a filled region stands
off one with no color.

#### Scenario: Map's four in the two schemes

- **WHEN** Map's four fills and the region palette's first four are resolved
- **THEN** they are the same colors in the light scheme
- **AND** in the dark scheme each of Map's is lighter than its counterpart

### Requirement: A region's fill stays under everything drawn on it

Every mark the collection draws on a cell SHALL read on every member of the
region palette, in both schemes: ink, a piece, an error, the hint's ring,
outline and stripes, and the cursor. A surface that replaces a fill, the
mistake's wash or the win flash, SHALL be told from every member.

#### Scenario: A mark on a fill in the light scheme

- **WHEN** a mark is measured on a member in the light scheme
- **THEN** it reads no worse than on the plain cell surface the fill replaces

#### Scenario: A mark on a fill in the dark scheme

- **WHEN** a mark is measured on a member in the dark scheme
- **THEN** it clears the floor the palette's test holds that mark to
