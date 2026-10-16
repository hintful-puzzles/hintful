## ADDED Requirements

### Requirement: A permutation puzzle's staged plan is the engine's

A game whose hint places pieces in a fixed order, keeping the placed ones, by
moves that permute cells SHALL plan through one engine planner. The game SHALL
supply only its moves as cell permutations, with any turn they give a piece,
and its goal order. The planner SHALL own the library of sequences that leave
placed cells alone, the per-stage tables, the remainders and the rank that
falls on every hinted move.

#### Scenario: Twiddle plans through the engine

- **WHEN** Twiddle's hint plans from any board
- **THEN** the plan is the engine planner's, and Twiddle's own code holds only
  its moves and its narration
