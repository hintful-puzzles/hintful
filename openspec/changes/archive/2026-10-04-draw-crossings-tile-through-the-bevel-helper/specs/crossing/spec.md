## MODIFIED Requirements

### Requirement: Crossing input, marking, mistakes and completion

Crossing SHALL be played by selecting an open cell and entering a digit, with a
separate pencil-mark mode for candidate notes. A left click SHALL select a cell
for digit entry and a right click for pencil marking; the arrow keys SHALL move a
keyboard cursor and Enter SHALL toggle between digit and pencil entry; a digit key
SHALL place a digit or toggle a note, and Backspace, Space or `0` SHALL clear.
Walls SHALL not be editable, and a move that changes nothing SHALL produce no
history entry.

Crossing SHALL flag a completed run that matches no clue number with a live error
highlight, independently of `findMistakes`. `findMistakes` SHALL re-solve to the
unique solution and flag every placed digit that contradicts it and every empty
cell whose pencil notes have crossed out its solution digit, returning nothing
when the board is not yet uniquely determined. The game SHALL be reported complete
when every run matches exactly one clue number and each clue number is used once,
and SHALL flash on that completion. Rendering SHALL draw a wall as a pressed-in
tile and a placed digit as a raised one, both through the engine's
`drawRaisedTile`, with the digit in one ink on a neutral face; and SHALL draw
pencil marks, the run-error highlights, and a number-list panel below the grid
colored by how many times each clue is placed.

#### Scenario: Entering the wrong digit is caught by Check & Save

- **WHEN** the player places a digit that contradicts the unique solution and
  invokes Check & Save
- **THEN** the cell is flagged as a mistake and the save is refused

#### Scenario: A no-op entry makes no move

- **WHEN** the player enters into a cell the digit it already holds, or edits a
  wall cell
- **THEN** no move is made and the history is unchanged

#### Scenario: Placing every clue exactly once wins

- **WHEN** a move fills the grid so every run matches exactly one clue number and
  each clue number is used once
- **THEN** the game is reported solved and flashes
