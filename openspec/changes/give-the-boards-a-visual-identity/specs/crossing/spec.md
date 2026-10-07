## ADDED Requirements

### Requirement: Crossing draws flat squares on a quiet surface

`redraw` SHALL draw the board without a bevel: nothing on it is a thing the
player moves. An empty square SHALL be the collection's cell surface, a square
holding a digit SHALL be the collection's lifted surface with the digit in ink,
so "placed" is told by the square under the digit, and a wall SHALL be one
flat, strong fill that is told from both surfaces in both schemes. The line
between squares and the frame round the grid SHALL be the collection's surface
grid line.

The selected square's wash SHALL replace the surface of an empty square and of
a square holding a digit alike, and a run's direction wash SHALL do the same.
The keyboard cursor on a wall SHALL be corner brackets in a color that stands
off the wall in both schemes. The completion flash SHALL sweep a bright beat
and a dim beat across the squares holding digits. A clue that is used up, or
fits nowhere in the selection, SHALL be drawn in the collection's color for a
clue that is used up.

#### Scenario: Nothing on the board is beveled

- **WHEN** a board holding walls and digits is drawn
- **THEN** each wall is one flat fill and each square holding a digit is one
  flat fill of the lifted surface
- **AND** no filled polygon is drawn

#### Scenario: Placed is told by the square under the digit

- **WHEN** a digit is entered into an empty square
- **THEN** the square changes from the cell surface to the lifted surface

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
and SHALL flash on that completion. Rendering SHALL draw a wall as a flat,
strong fill and a placed digit in one ink on a flat, lifted surface, neither
with a bevel; and SHALL draw
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
