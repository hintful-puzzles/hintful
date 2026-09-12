## ADDED Requirements

### Requirement: Loopy grades boards with a four-tier deductive solver

Loopy SHALL provide a solver with four difficulty tiers — Easy, Normal, Tricky,
Hard — implemented as deduction rungs run to a fixpoint. The solver SHALL NOT
backtrack or guess at any tier; Tricky SHALL NOT be a separate rung but SHALL
unlock additional inferences within the dline rung.

The dline machinery SHALL index a pair of edges adjacent around a common dot
consistently whether that pair is reached from the dot or from the face, and
this consistency SHALL be verified for every grid type, because a mismatch
weakens the solver silently rather than failing.

#### Scenario: The solver grades a board at the intended difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** it is solvable at that difficulty and not at the tier below

#### Scenario: The dline index is consistent from both directions

- **WHEN** a dline is addressed via its dot and via its face, for any face and
  corner of any grid type
- **THEN** both address the same pair of edges

## REMOVED Requirements

### Requirement: Loopy ports the graded solver faithfully

**Reason**: It required two upstream solver quirks to be reproduced rather than corrected so that the generated puzzles stayed identical to upstream's C, a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement; its heading also asserts faithfulness, which a `MODIFIED` block cannot rename.

**Migration**: Replaced by "Loopy grades boards with a four-tier deductive solver", which keeps the tiers, the no-guessing rule, the dline consistency rule and both scenarios without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.
