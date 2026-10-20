## ADDED Requirements

### Requirement: Hint: The forced cell is banded as a ring, and every premise as an outline

The forced cell(s) (the move) SHALL be banded `COL_HINT`. A premise, an
undecided matching number, a decided cell whose state is the reason, or the
corner a corner deduction protects, SHALL be banded `COL_HINT_CELL`, and keep
its own digit, piece or ring. The row or column a sentence names SHALL be
striped.

#### Scenario: A cell a hint says to shade is drawn empty

- **WHEN** a displayed step concludes that an undecided cell must be shaded
- **THEN** the cell is banded `COL_HINT` and holds no piece

#### Scenario: Premises and corners are outlined

- **WHEN** a hint cites undecided matching numbers, a shaded or circled
  square, or a corner deduction protects a corner
- **THEN** each is banded `COL_HINT_CELL`, what it holds untouched

#### Scenario: The line a pair shares is striped

- **WHEN** a hint for an adjacent equal pair is displayed
- **THEN** the row or column the pair shares is striped

## REMOVED Requirements

### Requirement: Hint: The forced cell, the number premises and the corner have their own colors

**Reason**: A premise's color is the engine's, one per reference of the
words; the game draws every premise in its outline slot.

**Migration**: Requirement "Hint: The forced cell is banded as a ring, and
every premise as an outline".

### Requirement: Hint: A decided premise in a Singles hint takes the color of its state

**Reason**: As above: a decided premise is an outline, and its own piece or
ring is what says its state.

**Migration**: Requirement "Hint: The forced cell is banded as a ring, and
every premise as an outline".
