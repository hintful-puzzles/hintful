## MODIFIED Requirements

### Requirement: The solved flash lifts every cell

The completion flash SHALL sweep the board's cells, and a lit cell's body SHALL
be drawn in the given's surface, over the finished-region color it rests in.

#### Scenario: The flash lifts the cells

- **WHEN** a board is won and frames of its flash are drawn from start to end
- **THEN** every cell's body is the lifted surface on some frame, and the walls
  and letters are drawn as on any other frame
