## ADDED Requirements

### Requirement: Ascent's hint places a run with one route in one step

When the hint's plan follows a run of missing numbers to its end, and that run
has exactly one route between its placed ends, either through the empty squares
at all or through every empty square no other run can reach, the hint SHALL
place the whole run in one step. The step SHALL say why in one sentence, draw the
route as the game's path line in the hint's color, ring every square on it and
stripe the squares no other run reaches when those are what make the route
unique. The number of routes SHALL be counted, not inferred. A player placing the
run's numbers one at a time SHALL stay on the step, which shrinks to what is
left. Every sentence SHALL name a run by the placed numbers at its ends.

#### Scenario: A run with one route

- **WHEN** the plan follows a run to its end and only one route through the
  squares no other run reaches exists
- **THEN** one step places every number of the run, and following it a number at
  a time keeps it on track

#### Scenario: A run with two routes

- **WHEN** the plan follows a run to its end and more than one route exists
- **THEN** the run is placed a number at a time, each with its own reason
