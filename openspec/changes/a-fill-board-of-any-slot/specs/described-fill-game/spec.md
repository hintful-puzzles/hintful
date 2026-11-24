## ADDED Requirements

### Requirement: A fill board's answer lives in slots of a sort

A described fill game SHALL state the sort of slot its answer lives in (cells, edges or vertices), and the board, the deal, the codec, the drawing and the input SHALL read the answer through that sort, so that a game whose answer is on edges or is a partition of the cells is described without a second engine.

#### Scenario: A game whose answer is on edges

- **WHEN** a description states an answer on edges
- **THEN** it is dealt, drawn, played and hinted by the fill engine, as a cell game is
