## MODIFIED Requirements

### Requirement: Towers accepts digit, pencil, clue-strike, and solve moves

`interpretMove` SHALL select a cell by mouse (with 3D-aware hit-testing so a
click on a tower protruding from a neighboring cell selects that neighbor) or
keyboard cursor, distinguishing a real-entry highlight (left button / select)
from a pencil-mark highlight (right button / select2). With a cell highlighted,
a digit `1..w` SHALL enter that tower (or toggle the pencil mark in pencil
mode), and backspace/space/0 SHALL clear it; entering a value a cell already
holds SHALL be a no-op. A click or shift/ctrl-cursor onto an outside clue SHALL
toggle that clue's struck-through ("done") state. Immutable (given) cells SHALL
reject entry. `executeMove` SHALL apply the move purely, returning a new state,
and the board SHALL be reported solved exactly while the filled grid violates no
clue or Latin constraint.

#### Scenario: Entering the last correct tower completes the board

- **WHEN** the player enters the final tower that completes a correct grid
- **THEN** `status` reports the state `executeMove` returns as solved

#### Scenario: Entry into an immutable cell is rejected

- **WHEN** `interpretMove` would enter a digit into a given cell
- **THEN** it returns `null` (no move)

#### Scenario: Clue strike toggles

- **WHEN** the player clicks an outside clue
- **THEN** `executeMove` toggles that clue's done flag
