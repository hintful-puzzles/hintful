## MODIFIED Requirements

### Requirement: Salad selects a square and enters a symbol or a marker

Salad SHALL be played by selecting a cell and entering a symbol, an empty
marker, or a not-empty marker, with pencil marks available for tentative notes.
The arrow keys SHALL move a keyboard cursor.

#### Scenario: Entering a symbol places it in the selected cell

- **WHEN** a cell is selected in ink mode and a valid symbol key is pressed
- **THEN** that symbol is placed in the cell and the cell is no longer empty

## REMOVED Requirements

### Requirement: Salad's hint plan is recomputable from any position

**Reason**: `engine-hints` holds both halves for every hinting game: "A displayed hint
step never references already-resolved state" (no step asks for a move the
board already shows, a marker included) and "Only a searching hint is excused
the walk's promise" with "The hint walk SHALL cover every preset a game
offers" (a hint asked from any reached position does not stall). The
requirement says nothing of Salad's own: its marker steps are a `step` leg of
the walk and are held by the same cross-game walks as the steps the walk
builds.
