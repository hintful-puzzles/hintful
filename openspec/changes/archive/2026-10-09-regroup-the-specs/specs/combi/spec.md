## MODIFIED Requirements

### Requirement: Combi refuses an invalid (r, n) at construction

The implementation SHALL enforce the preconditions `0 <= r <= n` and `n >= 1`
by throwing on construction.

#### Scenario: precondition violations throw

- **WHEN** the implementation is constructed with `r < 0`, `r > n` or `n < 1`
- **THEN** construction throws
