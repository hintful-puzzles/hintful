## MODIFIED Requirements

### Requirement: Ascent's hint places a run with one route in one step

When a hint step would place a number, and that number's run of missing numbers
has exactly one route between its placed ends, either through the empty squares
at all or through every empty square no other run can reach, or exactly one of
its routes leaves a neighboring run at least one route of its own, the hint SHALL
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

#### Scenario: Only one route leaves a neighbor room

- **WHEN** a run has several routes and all but one leave a neighboring run no
  route between its own ends
- **THEN** one step places the run along that route, naming the neighboring run

## ADDED Requirements

### Requirement: Ascent's hint names only numbers the player can see

Every hint sentence SHALL name only numbers placed on the board or placed by
its own step. A run SHALL be named by its placed ends, a rival's failure by the
placed end it cannot touch, and a step count by the side of its run it rules
out.

#### Scenario: A close rival is named

- **WHEN** a fill step names the one run that comes close to its square
- **THEN** the sentence names that run by its placed ends and the placed number
  the square does not touch, and names no missing number but the one placed
