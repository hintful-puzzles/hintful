## MODIFIED Requirements

### Requirement: Mosaic marks cells via toggle and straight-line paint moves

A `MosaicMove` SHALL be one of: toggle a cell (one step, or two steps for
the right-button/select2 cycle unmarked→marked→blank), paint a straight
run of cells with a captured target state, or solve. `executeMove` SHALL be
pure and throw on an out-of-bounds target. A toggle SHALL strip any
`SOLVED`/`ERROR` overlay then cycle the cell's mark; a paint SHALL set only
still-unmarked cells along the run. After each move the game SHALL reflag
every affected clue — `SOLVED` when exactly satisfied with no unknowns,
`ERROR` when overcommitted (more marks than the clue, or too few possible)
— and recount `notCompletedClues`. A pointer press SHALL toggle the
cell it lands on, and a drag on from it SHALL be the engine's: every further
cell the pointer passes that held what the pressed cell held takes the same
toggle, in any direction, so a drag from an unmarked cell lays a mark and a
drag from a marked cell clears marks, as one step of Undo. The game SHALL
make no `paint` move of its own; it still replays one from a saved game.
Margin clicks are ignored; after completion only cursor movement is accepted. A keyboard
cursor with select/select2 SHALL mirror the click behaviors.

#### Scenario: Toggling cycles a cell

- **WHEN** a cell is toggled three times (single steps)
- **THEN** it passes marked → blank → unmarked

#### Scenario: Painting fills only unmarked cells

- **WHEN** a paint move covers a run containing a marked cell and unmarked
  cells, painting blank
- **THEN** the unmarked cells become blank and the already-marked cell is
  unchanged

#### Scenario: A satisfied clue grays out and a contradicted clue reddens

- **WHEN** a clue's neighborhood is fully determined with exactly the clue's
  count marked
- **THEN** the clue carries the `SOLVED` flag (drawn gray)
- **AND** when more cells are marked around a clue than its value, it carries
  the `ERROR` flag (drawn red)

#### Scenario: Completing every clue solves the game

- **WHEN** the last clue becomes satisfied
- **THEN** `notCompletedClues` is 0, `status` returns `"solved"`, the status
  bar reads `COMPLETED!`, and a 0.5s flash plays
