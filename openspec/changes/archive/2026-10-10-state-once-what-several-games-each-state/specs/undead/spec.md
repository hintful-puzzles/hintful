## MODIFIED Requirements

### Requirement: Undead's Mark-all fills the cells that have no notes

A mark-all action (`M`/`m`) SHALL fill every undecided cell that carries no
notes with all three candidate notes.

#### Scenario: Mark-all fills candidate notes

- **WHEN** the player invokes mark-all on a board with some empty cells, one of
  them already narrowed to two notes
- **THEN** every undecided cell without notes gains all three candidate notes
- **AND** the narrowed cell and already-placed cells are unchanged

### Requirement: Undead's findMistakes compares the board with its unique solution

The game SHALL implement `findMistakes`: re-solving the board to its unique
solution and returning every placed cell that contradicts it, plus every empty
cell whose non-empty pencil notes have crossed out its solution monster. The
solution SHALL be derived from the description clues only.

#### Scenario: Check & Save flags a wrong placement

- **WHEN** the player places a monster that contradicts the unique solution and
  invokes Check & Save
- **THEN** `findMistakes` reports that cell
- **AND** the save is blocked
- **AND** an empty cell whose notes have crossed out its solution monster is also
  reported, while a cell with merely extra notes is not
