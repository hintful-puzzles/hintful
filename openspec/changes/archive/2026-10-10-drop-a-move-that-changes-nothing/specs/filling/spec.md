## MODIFIED Requirements

### Requirement: Filling fill moves and selection

A digit key `0`–`9`, Backspace standing for `0`, SHALL set every selected
non-clue cell to that value, or the cursor's cell when nothing is selected and
the cursor is shown, as a single move. A value above `max(w,h)` SHALL be
rejected, the limit on a 2×2 board being `3` in place of `max(w,h)`.

#### Scenario: Filling a selection sets every selected cell

- **WHEN** two non-clue cells are selected and the digit `3` is pressed
- **THEN** the emitted move sets both cells to `3`
- **AND** after executing it the selection is cleared

#### Scenario: A digit too large for the board is rejected

- **WHEN** a cell is selected on a 3×3 board and the digit `4` is pressed
- **THEN** no move is emitted
