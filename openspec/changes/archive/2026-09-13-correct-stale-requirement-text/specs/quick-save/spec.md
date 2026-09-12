## MODIFIED Requirements

### Requirement: A single quick-save slot per puzzle

The app SHALL provide one dedicated quick-save slot per `puzzleId`,
persisted in IndexedDB as a distinct save type, separate from the named
save library and from autosave. Saving to the slot SHALL overwrite the
previous quick-save for that puzzle. The slot SHALL be readable back into
the puzzle via the same save codec the library uses, so it works for
every game without per-game code. The presence of a slot for
a puzzle SHALL be observable reactively so a quick-load control can
enable/disable itself.

#### Scenario: Quick-save then quick-load round-trips

- **WHEN** the player quick-saves a board and later quick-loads
- **THEN** the puzzle is restored to the quick-saved state
- **AND** a second quick-save overwrites the slot rather than adding a
  second record

#### Scenario: Quick-load disabled with no slot

- **WHEN** no quick-save exists for the current puzzle
- **THEN** the quick-load control is disabled, and it becomes enabled as
  soon as a quick-save is made
