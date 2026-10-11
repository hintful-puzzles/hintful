## MODIFIED Requirements

### Requirement: Undead's Mark-all fills the cells that have no notes

Mark-all SHALL fill every undecided cell that carries no notes with all three
candidate notes, and SHALL make no move once none is left: a monster placed in
one cell rules nothing out of another, so there is no note to strike.

#### Scenario: Mark-all fills candidate notes

- **WHEN** the player invokes mark-all on a board with some empty cells, one of
  them already narrowed to two notes
- **THEN** every undecided cell without notes gains all three candidate notes
- **AND** the narrowed cell and already-placed cells are unchanged
