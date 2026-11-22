## MODIFIED Requirements

### Requirement: Rules: A full run that reads as no clue number is flagged live

Crossing SHALL frame in the error color, as soon as its digits make it
certain and with no mistake check asked for (`Game.rules`), a run that can no
longer read any listed number: one with a digit that every number of its
length disagrees with, full or not. A listed number written into two runs, or
with no run left that could read it, SHALL be drawn in the error color in the
number list and shown in conflict in the Numbers panel.

#### Scenario: A run filled with an unlisted number is framed at once

- **WHEN** the last empty cell of a run is filled so that the run reads as a
  number the list does not hold
- **THEN** the run carries the error highlight without Check & Save being
  invoked

#### Scenario: A run is framed before it is full

- **WHEN** a digit is written into a run that no listed number of the run's
  length has in that square
- **THEN** the run is framed, with its other squares still empty

#### Scenario: A number written twice is red in the list

- **WHEN** one listed number is written into two runs
- **THEN** that number is drawn in the error color in the list under the board
