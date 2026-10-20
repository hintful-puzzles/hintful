## ADDED Requirements

### Requirement: A permutation puzzle's staged plan is the engine's

A game whose hint places pieces in reading order, keeping the placed ones, by
moves that permute cells the same way on any board SHALL plan through one
engine planner. The game SHALL supply only its moves, with any turn they give
a piece, its board and its finished board. The planner SHALL own the library
of sequences that leave placed cells alone, the per-stage tables, the
remainders and the rank that falls on every hinted move.

#### Scenario: Twiddle plans through the engine

- **WHEN** Twiddle's hint plans from any board
- **THEN** the plan is the engine planner's, and Twiddle's own code holds only
  its moves and its narration

#### Scenario: Pieces that turn where they stand

- **WHEN** a move turns a piece it leaves in place, as Twiddle's odd block
  turns its center with orientation on
- **THEN** the library still holds three-piece cycles, twists and parity
  products that leave the placed cells alone, and a hint on 4×4 or 5×5 with
  a block of 3 leads on to the solved board
