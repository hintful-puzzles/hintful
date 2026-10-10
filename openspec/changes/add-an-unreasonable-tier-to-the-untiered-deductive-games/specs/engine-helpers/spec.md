## MODIFIED Requirements

### Requirement: The engine provides a shared loop-finding helper

The engine SHALL provide `findLoops(nvertices, neighbors)` in
`src/engine/findloop.ts`. It takes a neighbor callback `(vertex: number) => Iterable<number>` over
an undirected graph and returns `{ anyLoop, isLoopEdge(u, v), isBridge(u, v)
}`. An edge SHALL be a loop edge exactly when
it is not a bridge: removing it would not disconnect its component. `isBridge`
SHALL answer the vertex counts either side of a bridge, `null` for a loop
edge. Two edges between the same pair of vertices, which the callback reports
as that neighbor twice, SHALL be a loop of the two, and the walk SHALL end on
such a graph.

#### Scenario: A cycle's edges are loop edges

- **WHEN** `findLoops` runs over a graph containing a cycle with a tail
- **THEN** `anyLoop` is true, every cycle edge reports `isLoopEdge` true,
  and the tail edge reports `isLoopEdge` false

#### Scenario: A forest has no loops

- **WHEN** `findLoops` runs over a multi-component tree graph
- **THEN** `anyLoop` is false and every edge is a bridge with correct
  vertex counts on each side

#### Scenario: Two edges between one pair

- **WHEN** `findLoops` runs over a path one of whose edges is reported twice,
  at its start, in its middle or at its end
- **THEN** it ends, `anyLoop` is true, that edge reports `isLoopEdge` true
  and the others are bridges
