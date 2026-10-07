## ADDED Requirements

### Requirement: Pegs draws its pegs as pieces on a quiet board

`redraw` SHALL draw the board as pieces on a quiet surface, with no bevel:
the board is not a thing the player moves. Every playable cell SHALL be the
plain cell surface, with the surface's grid line between two cells and round
the board's outline, whatever its shape. A peg SHALL be the collection's disc
piece, inset on its cell, in a color that none of the marks drawn on the board
uses. An empty hole SHALL be a ring on the cell's surface and SHALL NOT be
told by a fill of its own, so no state is a step of gray.

The keyboard cursor SHALL be drawn at the corners of its cell, beside the peg
or the hole, and SHALL NOT recolor either. A peg picked up from the keyboard
SHALL keep its own color inside a ring in the held color. A hint's rings,
outline, stripes and arrows SHALL be drawn as before, beside the peg. The
completion flash SHALL lift every cell to the lifted surface on its lit beats.

The game SHALL declare no palette swap for the dark scheme, and its hint
sentences and help page SHALL name no hue.

#### Scenario: A peg and a hole on one surface

- **WHEN** a board holding pegs and one empty hole is drawn
- **THEN** every playable cell is the same cell surface
- **AND** each peg is a disc in the peg's color and the hole is an unfilled ring

#### Scenario: The cursor is beside the peg

- **WHEN** the keyboard cursor is on a peg
- **THEN** the peg is drawn in the peg's color
- **AND** the cursor's mark is at the corners of the cell

#### Scenario: A held peg wears a ring

- **WHEN** a peg is picked up from the keyboard
- **THEN** it is drawn in its own color inside a ring in the held color
- **AND** the cursor's corner mark is not drawn on that cell

## REMOVED Requirements

### Requirement: Pegs derives its palette via the shared mkhighlight helper

**Reason**: The board has no bevel, so the palette holds no highlight or
lowlight to derive. Its surfaces come from the collection's shared surface
roles, and the shift of a near-white host background is the engine's, made
once for every game before `colors()` is called.

**Migration**: None. No save, game ID or control depends on the palette.
