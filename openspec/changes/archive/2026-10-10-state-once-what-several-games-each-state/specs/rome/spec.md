## MODIFIED Requirements

### Requirement: Rome's generator keeps every board soluble at its tier

The generator SHALL accept a board only when the solver finds it soluble at the
target difficulty and not soluble at the difficulty below.

#### Scenario: Every preset produces a soluble board

- **WHEN** a new game is generated for any preset or legal size and difficulty
- **THEN** a board is produced that is solvable by pure deduction at exactly that
  difficulty

### Requirement: Rome mistake-checking covers arrows and marks that break no rule

Mistake-checking SHALL report, separately from the rule violations, any arrow
the player has placed that contradicts the puzzle's unique solution even though
it breaks no rule. The unique solution SHALL be re-derived from the fixed clues
alone, and when the board is not deducible from those clues no contradiction
SHALL be reported.

#### Scenario: A legal-looking arrow that contradicts the solution is flagged

- **WHEN** an arrow is placed that breaks no rule but differs from the unique
  solution's arrow for that square
- **THEN** it is reported as a mistake and Check & Save is hard-blocked
