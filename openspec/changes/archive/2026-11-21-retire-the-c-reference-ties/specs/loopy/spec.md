## MODIFIED Requirements

### Requirement: Generation: The blocked-pair deduction regrades no board

The conclusions the blocked-pair deduction reaches SHALL already be reachable by the tier's
existing rungs, so that no board changes the tier it is graded at and no
generated description changes. A later strengthening that is not
conclusion-preserving SHALL be measured against a corpus graded both ways
before it is written, because a board labeled at a tier a player no longer
needs is a dishonest difficulty.

#### Scenario: Teaching the solver the pattern regrades no board

- **WHEN** the boards each preset deals are generated and graded with the
  deduction taught
- **THEN** no hint-walk snapshot moves, and each board is still dealt at its
  tier rather than becoming solvable one tier lower
