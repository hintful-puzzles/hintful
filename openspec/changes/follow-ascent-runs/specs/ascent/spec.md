## ADDED Requirements

### Requirement: Ascent's hint follows a run and names the close rival

After a hint step places a number in a run of missing numbers, the plan SHALL
ask the same techniques about that run alone, none harder than the technique
that placed the first number, and when that fills the run SHALL present the
placements as one journey, each leg with its own sentence. The plan's length
cap SHALL NOT split such a journey. A step placing a number because only its run
can reach the square SHALL, when exactly one other run comes within two steps of
the square or none does, and straight reach rules out every other number, say
which rival fails and why and the step counts that rule out the rest of its own
run, outlining the ends it names; otherwise it SHALL stripe its run's reach.

#### Scenario: A forced run arrives as one hint

- **WHEN** a step places a run's first number and the same techniques then fill
  the rest of the run
- **THEN** the rest follows as legs of the same journey, and none uses a harder
  technique than the first

#### Scenario: The one close rival is named

- **WHEN** a square only one run can reach has exactly one other run within two
  steps of it
- **THEN** the step names that run and why it falls short, with the step counts
  that single out the number
