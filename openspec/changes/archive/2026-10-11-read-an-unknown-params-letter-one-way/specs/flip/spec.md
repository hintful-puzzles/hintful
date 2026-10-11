## MODIFIED Requirements

### Requirement: Flip's params encoding

The params encoding SHALL be the width and height, followed in the full form
by `c` for Crosses or `r` for Random. Decoding SHALL accept these shorter forms:
`"5"` is 5×5, `"5x4"` names both dimensions, and the trailing letter is
optional, a string without one decoding as Crosses.

#### Scenario: The lenient forms decode

- **WHEN** `"5"`, `"5x4"` and `"5x5r"` are decoded
- **THEN** they give 5×5 Crosses, 5×4 Crosses and 5×5 Random
