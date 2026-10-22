# engine-helpers Specification Delta — share-square-edge-geometry

## ADDED Requirements

### Requirement: The engine numbers the edges of a square grid once

The engine SHALL provide, in `src/engine/square-edges.ts`, a geometry of a `w × h` board's edges: each edge one number, the two squares it joins, a square's edges in one fixed order, the edge between two squares, the square across an edge, and the edge a press is aimed at. A game whose player marks the edges between squares SHALL take these from it and SHALL NOT write its own, except where a declined game's `design.md` says why.

#### Scenario: Two squares side by side share one edge

- **WHEN** the edge between two squares that share a side is asked for
- **THEN** it is the same number whichever square is asked first, and the square across it from either is the other
