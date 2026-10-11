## REMOVED Requirements

### Requirement: Pattern draws its picture as shaded pieces and crosses on a quiet surface

**Reason**: A cell marked `Empty` is no longer plain surface with a cross: it
is the collection's clear square, a surface of its own (owner, 2026-10-11).
The requirement said it takes no fill, and its scenario that all three states
share one surface color.

**Migration**: "Pattern draws a full cell as a piece and an empty one as the
clear square".

## ADDED Requirements

### Requirement: Pattern draws a full cell as a piece and an empty one as the clear square

`redraw` SHALL draw a `Full` cell as the collection's shaded piece, inset on
the plain cell surface, a cell marked `Empty` as the collection's clear
square with its faint cross, and an `Unknown` cell as plain surface holding
nothing. A hint's line hatch SHALL be drawn over a cell's surface, the clear
square's included.

#### Scenario: The three states are a piece, a clear square and nothing

- **WHEN** a board holding a `Full` cell, an `Empty` cell and an `Unknown` cell
  is drawn
- **THEN** the `Full` cell holds the shaded piece on the plain surface, the
  `Empty` cell is filled with the clear square's color and holds a cross in
  the square's faint color about its middle, and the `Unknown` cell is plain
  surface and holds nothing
