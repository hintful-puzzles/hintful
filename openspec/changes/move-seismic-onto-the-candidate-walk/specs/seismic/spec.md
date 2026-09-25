## MODIFIED Requirements

### Requirement: Seismic explains the next deduction

`hint(state)` SHALL refuse through `commonHintRefusal` when the board is solved or
`findMistakes` reports a mistake, and otherwise return the forced steps from the
player's own board as an ordered plan, each step narrating why its move is forced
from premises the sentence itself states.

The plan SHALL be walked by the shared candidate walk (`runCandidatePlan`), with
Seismic's keep-apart rule as the walk's `reach`: an `n` rules `n` out of its own
area and of the cells `placeNumber` strikes. It SHALL offer the player the
"Hints pencil in" choice and start on the implicit reading, because an Easy
board falls entirely to singles the board shows.

The plan SHALL deduce from the player's pencil notes, and from what a note-less
cell's area and the numbers within reach leave it, rather than from the givens
alone. That is sound only because `findMistakes` flags every empty cell whose
notes have crossed out its answer, so wherever the hint runs every cell's notes
still hold that answer. Under the populate reading it SHALL fill notes with the
additive `pencilAll` before a deduction first needs them; under either reading it
SHALL strike what the numbers already placed rule out in one setup step before
any deduction reads the notes.

Its deductions are: an empty area of one cell can only hold a 1; a cell with one
candidate left can only hold that number; a number with one cell left in its area
must go there, unless that cell's candidates are already down to the number,
which is the previous deduction; and a number is struck from every cell outside
an area that clashes, under the mode's keep-apart rule, with every cell the area
still has for that number. The last SHALL be taken only when no other deduction
is available. A placement SHALL be followed by a continuation step striking
exactly the notes the placed number rules out, as `placeNumber` itself would.

The last deduction is the solver's trial rung in the form a player can see: it
SHALL strike exactly the candidates the trial rung rejects wherever it is the next
step, and every cell ruled out by one area and one number SHALL be one step. It is
a Check, so it SHALL be narrated directly; it SHALL never be needed on an Easy
board, whose certification uses the singles alone.

The generator SHALL NOT call the hint, so no generated board changes.

#### Scenario: An area starved of a number rules it out of every cell that clashes with all its homes

- **WHEN** every cell an area still notes for 3 lies within 3 cells, along a row
  or column, of a cell outside the area that also notes 3, and a hint is requested
  at that point in Seismic mode
- **THEN** the step strikes 3 from every such cell at once, rings those cells,
  hatches the area, and says the area can put its 3 only within that reach of them

#### Scenario: A hint resumes from the player's own narrowed notes

- **WHEN** the player has narrowed some cells' notes without crossing out an
  answer and asks for a hint
- **THEN** the plan does not fill notes again, and following it finishes the board

#### Scenario: Asking for a hint leaves the board untouched

- **WHEN** a hint is requested on a freshly dealt board
- **THEN** the state, including the region partition every state of the game
  shares, is unchanged

#### Scenario: The naked-single phrasing is never used on a multi-candidate cell

- **WHEN** any Latin-family hint emits a placement step whose narration says "ruled
  out in this cell"
- **THEN** the cell's working notes are genuinely a single candidate (a true naked
  single) — a hidden single uses its own narration instead

#### Scenario: A note-less cell reads as what the rule leaves it

- **WHEN** under the implicit reading the plan writes a note-less cell's notes, or
  places a number in one as the only number left
- **THEN** the notes written, or the one number, are exactly what `placeNumber`
  leaves that cell after every number on the board is placed
