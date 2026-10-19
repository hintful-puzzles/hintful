## ADDED Requirements

### Requirement: The midend can draw a displayed step without one reference's marks

The midend SHALL send a displayed step's words as spans, each with the index of
the reference it is, and SHALL take one of them to hide. While one is hidden,
it SHALL draw the step with that reference naming nothing and every other
reference as it was. The hiding SHALL belong to the step it was set on and end
when another step is displayed.

#### Scenario: A hidden reference is drawn without its marks

- **WHEN** a step's words name a ring and an outline and the frontend hides
  the ring's reference
- **THEN** the step the renderer is given names the outline and no ring, and
  its explanation is unchanged

#### Scenario: The hiding ends with its step

- **WHEN** a reference is hidden and the player's move completes the step
- **THEN** the next step is drawn with every mark
