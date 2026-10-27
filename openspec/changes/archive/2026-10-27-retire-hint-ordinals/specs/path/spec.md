## MODIFIED Requirements

### Requirement: Hint: A step rings the edges it decides and outlines what it reads

A step SHALL ring the edges it decides, drawn as the line or cross it asks for, and outline what it reads: the square of a forced step. A lookahead step SHALL show only the forced edges its break needs, with no number on them, outline where it breaks, and name a loop before a square short of edges. No step SHALL ask for a cross on an edge the ladder counts as closed.

#### Scenario: A forced step names its square

- **WHEN** a square with one line has one open edge left
- **THEN** the step says "The outlined square has only one edge left for its second line, so this edge must be a line." and outlines that square
