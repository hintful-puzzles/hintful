## ADDED Requirements

### Requirement: The Subsets completion flash fills a cell's slots together

The completion flash SHALL sweep the cells diagonally, a cell's position being
its place in the grid. Every slot of a lit cell SHALL be filled with the flash
color and keep its letter or cross, so that a cell lights as one piece,
whether the player filled it or the puzzle gave it.

#### Scenario: The flash is on a cell

- **WHEN** a solved board is drawn while the flash is on a cell
- **THEN** every slot of that cell is the flash color, with its letter or cross
- **AND** once the flash has left the cell each slot is on its own surface
  again, plain or lifted

## REMOVED Requirements

### Requirement: The completion flash lifts every slot

**Reason**: A lit slot is filled with the flash color, which no slot rests on,
so a cell the puzzle gave lights as any other does and nothing is lifted.

**Migration**: None. Nothing a player holds refers to the flash.
