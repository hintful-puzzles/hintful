## MODIFIED Requirements

### Requirement: Unequal accepts digit, pencil, clue-spent, and solve moves

`interpretMove` SHALL select a cell by mouse or keyboard cursor. With a cell
highlighted, a digit `1..order` (entered as a digit, or a letter for 11 and
above) SHALL place that number, or toggle the pencil mark in pencil mode, and
backspace, space, or below order 10 the `0` key, SHALL clear it. Immutable
(given) cells SHALL reject entry.

#### Scenario: Entry into an immutable cell is rejected

- **WHEN** `interpretMove` would enter a digit into a given cell
- **THEN** it returns `null` (no move)
