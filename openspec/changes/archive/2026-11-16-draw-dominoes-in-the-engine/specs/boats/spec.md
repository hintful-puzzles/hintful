## ADDED Requirements

### Requirement: Look: A boat is one hull with round ends

`redraw` SHALL draw a boat's segments as the engine's piece over several
cells, with half-circle ends and no divider, so a boat reads as one hull and a
boat of one as a disc. The fleet display SHALL draw its boats the same way.

#### Scenario: A boat of three on the board

- **WHEN** three squares in a row hold a finished boat
- **THEN** they are drawn as one hull, rounded at its two ends only, with no
  line across it
