## MODIFIED Requirements

### Requirement: Params: Same Game refuses params it cannot deal

The colors field's bounds SHALL refuse fewer than three colors, and
`validateParams` SHALL refuse a grid of a single square.

#### Scenario: Two colors, and one square

- **WHEN** the engine's params check is given two colors, or a `1×1` grid
- **THEN** it answers "No. of colors must be at least 3." for the first, in
  the words the bounds generate for the field the Custom dialog shows, and
  "Grid area must be greater than one." for the second
