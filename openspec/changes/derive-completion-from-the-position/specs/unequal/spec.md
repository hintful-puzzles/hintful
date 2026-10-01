## MODIFIED Requirements

### Requirement: Unequal accepts digit, pencil, clue-spent, and solve moves

`interpretMove` SHALL select a cell by mouse (left button = real-entry highlight,
right button = pencil-mark highlight) or keyboard cursor. With a cell
highlighted, a digit `1..order` (entered as a digit, or a letter for `11`+ at
large orders) SHALL place that number (or toggle the pencil mark in pencil mode),
and backspace/space/0 SHALL clear it; entering a value a cell already holds SHALL
be a no-op. A click on a greater-than sign or adjacency bar in the gap between two
cells, or a shift/ctrl-cursor toward a neighboring clue, SHALL toggle that clue's
struck-through ("spent") state. Immutable (given) cells SHALL reject entry. The
`M`/`m` key SHALL fill every empty cell with all candidate pencil marks.
`executeMove` SHALL apply the move purely, returning a new state, and the board
SHALL be reported solved exactly while the filled grid satisfies every
row/column and clue constraint.

#### Scenario: Entering the last correct number completes the board

- **WHEN** the player enters the final number that completes a correct grid
- **THEN** `status` reports the state `executeMove` returns as solved

#### Scenario: Entry into an immutable cell is rejected

- **WHEN** `interpretMove` would enter a digit into a given cell
- **THEN** it returns `null` (no move)

#### Scenario: Clicking a clue toggles its spent state

- **WHEN** the player clicks a greater-than sign or adjacency bar
- **THEN** `executeMove` toggles that clue's spent flag
