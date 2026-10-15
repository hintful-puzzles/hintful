## ADDED Requirements

### Requirement: Marks a placement brings are no step's, and end the plan

With the `auto-cross` preference on, a hint step SHALL be judged by the
player's move alone, never by the marks it brings. A plan SHALL end with its
first step whose move brings marks, since the steps after it were planned
without them, and the next hint SHALL be planned from the board they leave.

#### Scenario: A hinted placement

- **WHEN** the preference is on and the player makes the placement a step
  asks for
- **THEN** the step is completed, the marks are brought, and the next hint
  is planned from the board with them
