## ADDED Requirements

### Requirement: Solver: Mathrax's ladder is its description

Mathrax's solver SHALL run the ladder of `mathrax.description.yaml`: its
three clue readings and the Latin library's it places, each at the tier the
description gives it, checked sound against the description's rules, a Latin
square whose corner clues each hold on both diagonal pairs. The search above
them stays the engine's.

#### Scenario: A cell with nothing left at its corners

- **WHEN** no value open in a cell is allowed by every clue at its corners
- **THEN** the clue reading proves the board inconsistent, at every tier
