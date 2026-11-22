## MODIFIED Requirements

### Requirement: Rules: Mistake-checking reports the rule violations the board shows

Mistake-checking SHALL report the rule violations the board already shows as
the player works, read from its rules (`Game.rules`): an arrow pointing off
the grid, an arrow duplicated inside an outlined region, and each square of a
loop. A square whose arrows lead into a loop without being on it SHALL NOT be
reported for the loop.

#### Scenario: A duplicate arrow in a region is flagged as a mistake

- **WHEN** two squares in the same outlined region hold the same arrow direction
- **THEN** `findMistakes` flags both squares and Check & Save is hard-blocked

#### Scenario: A loop is flagged, and the square leading into it is not

- **WHEN** four squares' arrows go round in a loop, and a fifth square points
  into it
- **THEN** `findMistakes` flags the four squares of the loop, and not the fifth
