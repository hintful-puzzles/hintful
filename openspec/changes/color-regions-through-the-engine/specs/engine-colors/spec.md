## ADDED Requirements

### Requirement: The palette holds a quiet set of fills for the regions a puzzle gives

The palette SHALL hold one set of fills for the surface of regions a puzzle
gives: the hues of Map's four fills, member for member, at a strength that
recedes. Any two members SHALL stand at least the floor two neighbors are
held to apart, in both schemes.

#### Scenario: Two regions side by side take any two members

- **WHEN** any two members of the set are measured in either scheme
- **THEN** they stand at least the neighbor floor apart

### Requirement: A region's fill stays under everything drawn on it

Every mark the collection draws on a cell SHALL read on every member of the
set of region fills, in both schemes: ink, a piece, an error, the hint's
ring, outline and stripes, and the cursor. A surface that replaces a fill,
the mistake's wash or the win flash, SHALL be told from every member.

#### Scenario: A mark on a fill in the light scheme

- **WHEN** a mark is measured on a member in the light scheme
- **THEN** it reads no worse than on the plain cell surface the fill replaces

#### Scenario: A mark on a fill in the dark scheme

- **WHEN** a mark is measured on a member in the dark scheme
- **THEN** it clears the floor the palette's test holds that mark to
