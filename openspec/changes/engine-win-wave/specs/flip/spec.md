## RENAMED Requirements

- FROM: `### Requirement: A flip shows one piece at a time, and the win flash is a ring`
- TO: `### Requirement: A flip shows one piece at a time, and the win flash sweeps the squares`

## MODIFIED Requirements

### Requirement: A flip shows one piece at a time, and the win flash sweeps the squares

A move SHALL animate each square it flips as the old piece shrinking away and
the new one growing in its place, never both at once. The win flash SHALL
sweep the squares along the diagonal, and a lit square's ground SHALL be
filled with the flash color, with its piece and the diagram on it unchanged.

#### Scenario: Halfway through a flip

- **WHEN** a square is drawn before the midpoint of its flip, and again after
  it
- **THEN** the first frame holds only the old piece, smaller than whole, and
  the second only the new one

#### Scenario: A move that does not solve the board

- **WHEN** a press flips squares and leaves a light on
- **THEN** no square's ground is the flash color in any frame of the flip
