## MODIFIED Requirements

### Requirement: A Mosaic press toggles a cell and a drag repeats it

A pointer press SHALL toggle the cell it lands on, and a drag on from it SHALL
be the engine's sweep over the cells holding the mark the pressed cell held: a
drag from an unmarked cell lays a mark and a drag from a marked cell clears
marks. Once the board is complete, the game SHALL accept only cursor movement.

#### Scenario: A drag from a marked cell clears marks

- **WHEN** the player presses a marked cell with the primary button and drags
  across a marked cell and an unmarked cell
- **THEN** both marked cells become blank and the unmarked cell is left as it
  was

#### Scenario: A finished board takes no click

- **WHEN** the board is complete and the player clicks a cell
- **THEN** no move is made
- **AND** an arrow key still moves the cursor

## REMOVED Requirements

### Requirement: Mosaic names no hue of its own for either mark

**Reason**: `engine-colors`, "Shaded or not is the pair's first member alone", holds all of
it: Mosaic's hint sentences, control words and legend take `SHADED_NAME` and
`UNSHADED_NAME` (`src/games/mosaic/hint-text.ts`, `index.ts`), and its help
page writes the placeholder.
