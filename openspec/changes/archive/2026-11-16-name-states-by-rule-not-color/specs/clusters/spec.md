## MODIFIED Requirements

### Requirement: Hint: A count step names both tiles it reads

A count step SHALL ring the cell it fills and outline the two tiles it reads, named by piece and dot, or by order where those agree, and SHALL say where the first tile's piece must or may only be among the squares both touch.

#### Scenario: A dot's last color is among the shared squares

- **WHEN** a dotted disc that needs one more disc shares squares with a dotted block that leaves at least one of them a disc
- **THEN** the step says "The outlined dotted disc's last disc must also touch the outlined dotted block, so this square must hold a block." of the dot's other empty neighbor
