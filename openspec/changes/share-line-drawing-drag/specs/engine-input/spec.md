# engine-input Specification Delta — share-line-drawing-drag

## ADDED Requirements

### Requirement: A line drawn through squares is the engine's drag

The engine SHALL provide the drag that draws a line along the edges between the squares it passes: a rook move a square at a time, cut back where it returns to a square it passed, stopped by a crossed edge, erasing while it runs along lines until its first new edge, with the keyboard's Enter, arrows and Enter. A game whose player draws lines this way SHALL use it and declare only how many lines a square takes and whether a loop may close.

#### Scenario: A drag back over its own way takes the line back

- **WHEN** a drag passes three squares and returns to the second
- **THEN** releasing it draws only the edge between the first two
