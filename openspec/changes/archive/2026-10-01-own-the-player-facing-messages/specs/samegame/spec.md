## MODIFIED Requirements

### Requirement: Same Game supports two-click selection, keyboard input, and a live score

`interpretMove` SHALL implement the two-click select-then-remove gesture using a
selection held in `SamegameUi` (not in the game state): clicking a removable tile
(part of a same-color group of size ≥ 2) SHALL flood-select the connected region
and return a UI update; clicking again on that selection (left button or
`CURSOR_SELECT`) SHALL emit the `remove` move; right-clicking or `CURSOR_SELECT2`
on the selection SHALL clear it (UI update); clicking an empty or lone tile SHALL
select nothing. A keyboard cursor SHALL move with the cursor keys and act at the
cursor on select. `changedState` SHALL clear the selection on every real
transition. `statusbarText` SHALL show `"Score: N"`, extended to `"...  Selected:
K (P)"` while a region of `K` tiles worth `P = max(0, K − scoresub)²` points is
selected, the engine's completion words followed by `"Score: N"` when complete
(`"COMPLETED! Score: N"`), and `"Cannot move! Score: N"` when impossible.

#### Scenario: First click selects, second click removes

- **WHEN** a removable tile is clicked
- **THEN** `interpretMove` returns a UI update, the connected same-color region
  is selected in the Ui, and `statusbarText` reports the selected count and its
  potential points
- **WHEN** a selected tile is then clicked again
- **THEN** `interpretMove` returns a `remove` move carrying the selected indices

#### Scenario: A lone tile cannot be selected

- **WHEN** a tile with no same-color orthogonal neighbor is clicked
- **THEN** no selection is made and no `remove` move is produced

#### Scenario: The selection clears across a move

- **WHEN** a `remove` move is applied
- **THEN** `changedState` leaves the Ui with no active selection
