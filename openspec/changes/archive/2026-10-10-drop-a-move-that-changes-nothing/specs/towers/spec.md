## MODIFIED Requirements

### Requirement: Towers accepts digit, pencil, clue-strike, and solve moves

With a cell highlighted, a digit `1..w` SHALL enter that tower, or toggle that
pencil mark in pencil mode, and Backspace, Space (`CURSOR_SELECT2`) or `0`
SHALL clear the cell. Immutable (given) cells SHALL reject entry.

#### Scenario: Entry into an immutable cell is rejected

- **WHEN** `interpretMove` would enter a digit into a given cell
- **THEN** it returns `null` (no move)
