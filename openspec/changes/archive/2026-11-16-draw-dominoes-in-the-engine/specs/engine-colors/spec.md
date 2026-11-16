## MODIFIED Requirements

### Requirement: A piece is drawn inset on its cell

The engine SHALL provide a drawing helper that paints a piece as a shape inset
on its cell, so that the grid shows between neighboring pieces and a mark
drawn at the cell's edge lands beside the piece. Two cells that are parts of
one piece over several cells are the exception: that piece covers the line
between them.

#### Scenario: Two neighboring pieces of one kind

- **WHEN** two adjacent cells hold pieces of one color that are not parts of
  one piece
- **THEN** the grid shows between the two pieces

## ADDED Requirements

### Requirement: A piece over several cells is one tile

The engine SHALL provide a drawing helper for one cell's part of a piece that
spans cells, a domino or a boat: inset as a piece is, reaching the cell's
edge on each joined side, rounded only where neither side is joined, with a
divider across a joined side where the game asks. Each cell SHALL draw its
own part, so a tile cache repaints one cell without its neighbor.

#### Scenario: A domino's two halves meet as one tile

- **WHEN** two adjacent cells each draw their part, joined toward each other
- **THEN** the two parts meet at the shared edge with no gap and no grid line
  between them
- **AND** only the four outer corners are rounded
