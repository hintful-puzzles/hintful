## ADDED Requirements

### Requirement: A search for whether a position can still finish is the engine's

A game whose hint proves a position lost by searching every line from it
SHALL do so through one engine helper, which owns the memo of positions
proved lost, the budget in positions and the request's allowance. The game
SHALL supply only its moves, their order, a position's key and its cheap
lost-at-a-glance cut.

#### Scenario: Two games prove loss through the helper

- **WHEN** Pegs or Same Game proves a position lost
- **THEN** the proof is the engine helper's, and no game keeps a memo of
  lost positions of its own
