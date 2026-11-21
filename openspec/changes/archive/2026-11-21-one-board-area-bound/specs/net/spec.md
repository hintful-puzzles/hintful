## RENAMED Requirements

- FROM: `### Requirement: Params: Net refuses a single square and a grid past a million squares`
- TO: `### Requirement: Params: Net refuses a single square`

## MODIFIED Requirements

### Requirement: Params: Net refuses a single square

`validateParams` SHALL refuse a grid whose width and height are both 1,
whether or not a board is to be dealt. A grid one square wide and longer SHALL
be admitted at Easy.

#### Scenario: The smallest and the largest grids

- **WHEN** a 1×1, a 1×2, a 100×100 and a 101×100 grid are validated at Easy
- **THEN** the 1×1 is refused with "At least one of width and height must be
  greater than one.", the 101×100 by the engine's bound on a board's area,
  and the other two admitted
