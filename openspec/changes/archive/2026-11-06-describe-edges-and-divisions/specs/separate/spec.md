## RENAMED Requirements

- FROM: `### Requirement: Solver: The ladder's three techniques disconnect, wall and merge`
- TO: `### Requirement: Solver: The ladder's three techniques wall and join`
- FROM: `### Requirement: Hint: Separate runs its solver as a declared ladder that its hint shares`
- TO: `### Requirement: Hint: Separate's solver is the ladder its description states, which its hint shares`

## MODIFIED Requirements

### Requirement: Solver: The ladder's three techniques wall and join

A region SHALL be the squares the edges known to have no wall join.
`sharedLetter` SHALL wall every edge between two regions side by side that
hold a common letter. `walledApart` SHALL wall every edge between two regions
side by side with a wall between them already. `onlyWay` SHALL join a region
short of its size to the one square beside it that no wall keeps from it,
marking the edges between them "no wall", and SHALL report the position
contradictory where no such square is left.

#### Scenario: Two neighbors with the same letter are walled apart

- **WHEN** two adjacent lone squares hold the same letter
- **THEN** `sharedLetter` walls the edge between them

### Requirement: Hint: Separate's solver is the ladder its description states, which its hint shares

Separate's solver SHALL run the ladder `separate.description.yaml` states,
compiled, in its order, to a fixpoint: three Easy techniques,
`sharedLetter`, `walledApart` and `onlyWay`, with Unreasonable the engine's
search over them. A board the ladder decides whole SHALL be judged by the
answer check its rules compile to.

#### Scenario: The hint and the generator run one ladder

- **WHEN** the hint asks for the next firing on a player's board
- **THEN** it comes from the same three techniques, in the same order, that
  the generator's solve runs
