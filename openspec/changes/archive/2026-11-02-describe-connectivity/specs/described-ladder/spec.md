## ADDED Requirements

### Requirement: Singles runs its compiled ladder

Singles' solver, generator, hint and answer check SHALL run the techniques its description states, compiled, and SHALL keep no hand-written rung. The generator SHALL lay its covered squares with the same ladder, run after each covering. The sneaky circles SHALL stay the generator's own, outside the description, since the rules do not force them.

#### Scenario: A hint step

- **WHEN** Singles' hint makes a square clear because covering it would cut the clear squares in two
- **THEN** the step is a firing of the compiled `split` technique, bound by the square

### Requirement: A technique may read whether cells are one group

A description SHALL be able to read `connected(S)`, whether a set of cells is one group side by side, and `cuts(S)`, the members without which the rest are not, in `S`'s order; the compiled code SHALL compute `cuts` by one search of the set, and the soundness checker SHALL read both by their definition, with no unknown of its own.

#### Scenario: A set with a bridge

- **WHEN** a description reads `cuts(S)` of a set whose two halves meet only through one cell
- **THEN** that cell is a member of it, and no cell whose removal leaves the rest joined is
