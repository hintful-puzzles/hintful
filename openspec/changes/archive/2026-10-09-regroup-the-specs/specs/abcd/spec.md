## MODIFIED Requirements

### Requirement: The generator's retry cap is sized to what the bound admits

The generator's retry cap SHALL be sized to what the bound on generable boards
admits, so that exhausting it continues to signal a defect rather than an
ordinary player request.

#### Scenario: Exhausting the cap on an admitted board is an error

- **WHEN** the generator spends its whole retry cap on a configuration that
  validation admits for generation
- **THEN** it throws `RetryLimitExceeded` and deals no fallback board, and the player is shown the engine's sentence that no board was found
