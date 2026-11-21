## ADDED Requirements

### Requirement: Look: Group draws where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for, each element that repeats in its row or column. For each product
the board breaks (`Game.rules`), where `(ab)c` and `a(bc)` are both filled and
differ, it SHALL annotate the `(ab)c` square with `(ab)c` above its element
and the `a(bc)` square with `a(bc)` below it, one failure to a square's side.

#### Scenario: A failed product is annotated on both sides

- **WHEN** the player fills `ab`, `bc`, `(ab)c` and `a(bc)` so the last two
  differ
- **THEN** the `(ab)c` square reads `(ab)c` and the `a(bc)` square reads
  `a(bc)`, each in the elements' letters
