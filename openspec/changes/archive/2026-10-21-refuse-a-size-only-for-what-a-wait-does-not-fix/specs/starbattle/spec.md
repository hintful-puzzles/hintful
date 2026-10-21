## MODIFIED Requirements

### Requirement: Params: A grid too small for its stars is refused

Star Battle SHALL refuse a grid narrower than 4 with one star to a row, 8
with two and 12 with three, because no arrangement of stars exists there:
two rows next to each other hold twice the stars with no two touching. The
refusal SHALL name the least size for the stars asked for. It SHALL refuse a
grid over 26, the regions its text form has letters for, and no size for
the time its deal takes or the tier asked of it.

#### Scenario: Two stars on a 7x7

- **WHEN** a 7x7 grid is asked for with two stars
- **THEN** it is refused with "Grid size must be at least 8 with 2 stars to a
  row."

#### Scenario: A large grid is dealt

- **WHEN** a 20x20 grid is asked for with one star
- **THEN** it is not refused
