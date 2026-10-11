## REMOVED Requirements

### Requirement: Mark-all fills a note-less cell with its region's candidates

**Reason**: The press stopped at the fill, where the hint's own opening clean
went on to strike what the placed numbers rule out.

**Migration**: "Seismic's Mark-all fills, then strikes what a placed number
rules out".

## ADDED Requirements

### Requirement: Seismic's Mark-all fills, then strikes what a placed number rules out

While any empty cell has no notes, Mark-all SHALL fill every such cell with
the numbers from 1 to its area's size and change no other. Otherwise it SHALL
strike each note a placed number of the same value rules out: one in the same
area, or one near enough under the board's ruleset. It SHALL never strike a
cell's last note, and SHALL make no move when nothing is left to strike.

#### Scenario: Mark-all leaves a narrowed cell alone

- **WHEN** the player has narrowed one empty cell's notes and runs mark-all
- **THEN** every note-less empty cell holds the numbers from 1 to its area's
  size, and the narrowed cell's notes are as the player left them

#### Scenario: A second press on a filled board

- **WHEN** every empty cell has notes and the player runs mark-all
- **THEN** each note struck is a number placed in the cell's area or within
  that number of cells along its row or column
- **AND** a third press makes no move
