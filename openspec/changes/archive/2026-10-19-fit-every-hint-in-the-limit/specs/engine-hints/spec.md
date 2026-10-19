## MODIFIED Requirements

### Requirement: A refresh that shrinks a hint step SHALL rewrite its words

When a stored step's marks shrink, because some of what it strikes is already
gone, the step's words SHALL be narrowed to the marks that remain and re-rendered,
so the sentence never names a note the step no longer strikes.

#### Scenario: One of two struck notes is already gone

- **WHEN** a stored step reads "…so 1 and 2 must go" and the 1 has been struck
  by the time it is shown
- **THEN** the refreshed step reads "…so the 2 must go" and rings only the 2
