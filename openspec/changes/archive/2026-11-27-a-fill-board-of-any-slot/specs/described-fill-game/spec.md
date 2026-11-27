## ADDED Requirements

### Requirement: A fill board's answer lives in slots of a sort

A described fill game SHALL state the sort its answer lives in (the cells or the edges), and the board, the deal, the codec, the drawing, the input and the hint SHALL read the answer through that sort, so that a game whose answer is on the edges, or is a partition of the cells stated as walls on the edges, is described without a second engine.

#### Scenario: A game whose answer is on edges

- **WHEN** a description states an answer on edges
- **THEN** it is dealt, drawn, played and hinted by the fill engine, as a cell game is
