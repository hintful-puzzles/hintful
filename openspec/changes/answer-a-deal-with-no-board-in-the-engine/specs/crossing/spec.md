## MODIFIED Requirements

### Requirement: Crossing rejects board sizes it cannot generate

Parameter validation SHALL reject, when validating for generation, any board
whose area is larger than the generable maximum, giving a reason. A board two,
three or four squares on its shorter side SHALL be held to a smaller maximum
of its own, since its long runs give out sooner. Validation SHALL NOT
apply a ceiling when a description is already supplied, so an existing puzzle
of any size remains playable.

#### Scenario: An ungenerable size is refused with a reason

- **WHEN** parameters larger than the generable maximum are validated for
  generation
- **THEN** validation fails with a message naming the maximum

#### Scenario: A thin board is refused where none is dealt

- **WHEN** a 2×41, a 61×3 and a 4×46 board are validated for generation at
  either difficulty
- **THEN** each is refused with a message naming its shorter side and that
  side's maximum area, and a 2×40 board is admitted

#### Scenario: An existing large description still loads

- **WHEN** parameters larger than the generable maximum accompany a supplied
  description
- **THEN** validation succeeds
