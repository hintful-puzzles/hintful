## MODIFIED Requirements

### Requirement: Undead paints a flagged count and a flagged clue red

`redraw` SHALL paint a flagged count block and a flagged sighting clue in the
error color. A flagged cell is not recolored: upstream computes that flag and never draws it, and neither does Undead.

#### Scenario: Over-placing a monster type reddens it live

- **WHEN** the player places more zombies than the zombie total
- **THEN** the zombie count renders in the error color
