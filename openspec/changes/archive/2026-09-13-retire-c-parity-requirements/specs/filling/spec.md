## MODIFIED Requirements

### Requirement: Filling generates uniquely solvable boards

`newDesc` SHALL build a board by partitioning the grid into regions whose sizes
equal their cell values (capped at `min(max(max(w,h),3), 9)`), then reduce the
clue set — removing whole regions and then individual clues — keeping a removal
only while the solver still solves the board, so the published clues uniquely
determine the solution.

#### Scenario: Every generated board is solvable

- **WHEN** a board is generated for any preset
- **THEN** the solver fills every cell
- **AND** each resulting region's size equals its number

### Requirement: Filling provides on-screen key labels

Filling SHALL implement `requestKeys()` returning the fixed digit keypad `1..9`
(labeled by the digit character) followed by a clear key (button code `8`,
labeled `"Clear"`), fixed to digits 1–9 regardless of board size as upstream's
`game_request_keys` is.

#### Scenario: The keypad is digits 1–9 plus clear

- **WHEN** the key labels are requested for any Filling board
- **THEN** the result is the buttons `1,2,…,9` followed by a clear key
