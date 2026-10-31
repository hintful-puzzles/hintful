## MODIFIED Requirements

### Requirement: Params: Hiding the identity leaves every tier but Easy

Group SHALL declare that hiding the identity leaves every tier but Easy (the
field's `only`), because an identity-hidden board has two blank rows and
columns that only a deduction above Easy can tell apart. Hiding it changes
only what is dealt, so it SHALL be a setting and not a rule modifier.

#### Scenario: An identity-hidden Easy deal is refused

- **WHEN** parameters about to deal a board request an identity-hidden Easy
  puzzle
- **THEN** the engine refuses them with a reason
