## RENAMED Requirements

- FROM: `### Requirement: Solver: Boats solves with a four-tier deductive solver`
- TO: `### Requirement: Solver: Boats' solver is the ladder its description states`

## MODIFIED Requirements

### Requirement: Solver: Boats' solver is the ladder its description states

The solver SHALL run the ladder `boats.description.yaml` states, compiled,
in its order, to a fixpoint, with its tiers Easy, Normal, Tricky and Hard,
each adding to the ones below, and SHALL report the highest tier a board
needed. A board the ladder fills SHALL be judged by the answer check its
rules compile to. No technique SHALL guess or backtrack: a Hard trial
supposes the rest of a line one value and reads the rules once, so every
board dealt is solvable by deduction at its tier.

#### Scenario: The solver reports the required difficulty

- **WHEN** a soluble board is solved
- **THEN** the returned tier equals the hardest technique tier the deduction
  needed, and the completed grid is the unique solution
