## ADDED Requirements

### Requirement: A board may be cells alone, its neighbors a relation it deals

A description SHALL be able to state its board as a count of cells with no geometry, in place of a grid, with each cell's neighbors a relation the board deals; the compiler SHALL refuse the grid's geometry on it, the compiled module's `Dealt` SHALL carry the relation, and the soundness checker SHALL check each technique over every relation on its cells, each pair in it or not.

#### Scenario: A Map region and the regions it borders

- **WHEN** Map's hint or solver reads which regions a region borders
- **THEN** it reads the `borders` relation the map deals, and the compiled ladder runs on the regions as the space's cells

### Requirement: Map runs its compiled ladder

Map's solver, generator, hint and answer check SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung; its Unreasonable tier SHALL be the engine's answer search over the compiled marks.

#### Scenario: A Tricky board's hint

- **WHEN** a Tricky Map board's hint weighs a region
- **THEN** the step is a firing of the compiled `weigh`, and the board was graded at Tricky by the compiled ladder
