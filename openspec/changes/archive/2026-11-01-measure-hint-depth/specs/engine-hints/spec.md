## ADDED Requirements

### Requirement: A reference declares a fact the board does not show

A reference whose words claim something about every placement of some element
SHALL be declared derived, as one fact or as one fact for each unit it names.
A step's depth SHALL be the number of facts its words name this way. A claim
the board shows, such as a clue's value or a note the player wrote, SHALL NOT
be declared.

#### Scenario: A step's depth is read off its words

- **WHEN** Rectangles' hint speaks a fit, reach, overlap or line step
- **THEN** its depth is 0, 1, 1 or 2, and a starve step's is one for each clue
  it would starve and each square it would strand

#### Scenario: A journey's later leg is not measured

- **WHEN** a step's sentence has the `again` relation
- **THEN** the depth report sets it aside, since it rests on its first leg's
  reasoning

#### Scenario: A sentence that leaves its fact unsaid reads shallow

- **WHEN** Rectangles' line step names the square it would miss without saying
  that only it reaches that square
- **THEN** the depth report lists the step as no deeper than an Easy rung
