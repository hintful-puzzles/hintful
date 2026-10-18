## ADDED Requirements

### Requirement: The midend can draw a displayed step's marks one reference at a time

The midend SHALL send a displayed step's words as spans, each with the index of
the reference it is, and SHALL take a focus on one of them. While focused, it
SHALL draw the step with its words narrowed to that reference. The focus SHALL
belong to the step it was set on and end when another step is displayed.

#### Scenario: A focused reference is drawn alone

- **WHEN** a step's words name a ring and an outline and the frontend focuses
  the outline's reference
- **THEN** the step the renderer is given names the outline alone, and its
  explanation is unchanged

#### Scenario: The focus ends with its step

- **WHEN** a reference is focused and the player's move completes the step
- **THEN** the next step is drawn with every mark, and the spans sent say no
  reference is focused
