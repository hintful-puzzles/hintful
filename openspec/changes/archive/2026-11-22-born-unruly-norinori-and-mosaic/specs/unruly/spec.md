## MODIFIED Requirements

### Requirement: Generation: Unruly winnows the clues of a full valid grid

`newDesc` SHALL build its answer a square at a time, a random piece on a
random empty square and then every square the whole ladder decides, and then
hide the givens one at a time in a random order, keeping a given only where
the board would not finish at its tier without it.

#### Scenario: A Tricky board is not a Normal one

- **WHEN** `newDesc` deals a board at Tricky
- **THEN** the deductive solver capped at Normal does not finish it from its
  clues

#### Scenario: No given can be spared

- **WHEN** any one given of a dealt board is taken away
- **THEN** the board no longer finishes at its tier

### Requirement: Hint: A firing that forces several cells is one journey

The plan SHALL hold one step per firing. The cells that a single firing forces
(a whole line completing to one kind, a near-complete row's forced remainder)
SHALL be one step that rings them all and makes them in one move.

#### Scenario: One firing reads as one journey

- **WHEN** a single completed-count or near-complete firing forces several
  cells
- **THEN** one step rings every one of them, and playing it fills them all

### Requirement: Hint: A cited premise is outlined apart from the move

The cited premise or pivotal cells the deduction reasons over SHALL be
outlined `COL_HINT_CELL`, and the forced move ringed `COL_HINT`: the like pair
in `threes`, the completed quota in `quota` and `lastGap`, the full reference
line in `unique`, and in `lastOne` the window the last piece must fall in. The
cell SHALL keep its own appearance inside the outline: a piece stays visible,
and an empty cell of the window stays empty.

#### Scenario: A reserved window is outlined and stays empty

- **WHEN** a `lastOne` hint is displayed
- **THEN** the cells of its window are outlined `COL_HINT_CELL`
- **AND** its empty cells are drawn empty inside the outline

## REMOVED Requirements

### Requirement: Rules: A placement on a clue or off the board is rejected

**Reason**: Unruly is born from its description: a move is an engine `Edit`,
which only the game's own input and hint write, and neither names a given or a
square off the board.

**Migration**: The controls requirement "Unruly marks cells via three-state
cycling moves" still holds a given inert under every button.
