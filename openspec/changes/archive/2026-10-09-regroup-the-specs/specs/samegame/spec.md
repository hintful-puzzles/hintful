## MODIFIED Requirements

### Requirement: A first click in Same Game selects the group

`interpretMove` SHALL implement the two-click select-then-remove gesture using a
selection that is no move: selecting adds no step to Undo. Clicking a removable tile
(part of a same-color group of size ≥ 2) SHALL flood-select the connected region
and return a UI update. Clicking an empty or lone tile SHALL select nothing.
`changedState` SHALL clear the selection on every real transition.

#### Scenario: A lone tile cannot be selected

- **WHEN** a tile with no same-color orthogonal neighbor is clicked
- **THEN** no selection is made and no `remove` move is produced

#### Scenario: The selection clears across a move

- **WHEN** a `remove` move is applied
- **THEN** `changedState` leaves the Ui with no active selection

### Requirement: Same Game's keyboard cursor acts where it stands

A keyboard cursor SHALL move with the cursor keys, wrapping at the board's edges, and a select key SHALL act
on the tile at the cursor as a click there does.

#### Scenario: Select at the cursor picks the group, then removes it

- **WHEN** the cursor stands on a removable tile and `CURSOR_SELECT` is pressed
- **THEN** the tile's connected same-color region is selected
- **WHEN** `CURSOR_SELECT` is pressed again
- **THEN** `interpretMove` returns the `remove` move for that region

## REMOVED Requirements

### Requirement: Same Game does not turn its board

**Reason**: declared: `notApplicable.transposeParams` in
`src/games/samegame/index.ts` gives the same decision with the same reason
("Squares fall down and emptied columns close up to the left, so a board turned
on its side would be a different puzzle"), the engine reads it to keep the game
out of the drafts, and the help page shows it. `engine-params`, "A game may
turn its params, says why not, or is a draft", requires that declaration and
names this very reason, and its "A deal turns the chosen params when the turned
board fits better" is why a tall board then stays tall. The prose copy says
nothing the declaration does not.
