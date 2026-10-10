## MODIFIED Requirements

### Requirement: Crossing is played by selecting a cell and entering a digit

Crossing SHALL be played by selecting an open cell and entering a digit, with a
separate pencil-mark mode for candidate notes. A press on a cell SHALL be the
engine's note-taking cell's.

#### Scenario: A right click is the way into pencil marks

- **WHEN** an empty open cell is right-clicked while digit entry is the mode
- **THEN** pencil mode is on and the cell is selected for a note

## REMOVED Requirements

### Requirement: The arrow keys move a cursor and Enter switches the entry mode

**Reason**: Both halves are shared. Enter is `engine-notes`, "The select key on a showing highlight toggles pencil mode" (Crossing calls `toggleNoteTakingMode` like the rest), and the arrow keys moving the cursor are `engine-input`, "One arrow press reveals the cursor and moves it". What an arrow does that is Crossing's own, setting the fill direction, is in Crossing's "The fill direction is remembered and set by three gestures".
