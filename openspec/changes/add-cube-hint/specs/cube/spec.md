## ADDED Requirements

### Requirement: Hint: Cube has a hint that says what each roll collects

Cube SHALL have a hint on every board its generator deals within the hint's
reach, and SHALL say plainly where a board is beyond it. Each step SHALL offer
a roll, mark where it goes, and say what it does toward collecting the blue
squares.

#### Scenario: A hint on a dealt board

- **WHEN** a player presses Hint on a freshly dealt Cube board of the default
  size
- **THEN** a step names a roll, marks the square it rolls to, and says what it
  collects or sets up

#### Scenario: A hint asked again after every roll still finishes

- **WHEN** a player on any preset takes only the first roll of each hint and
  asks again, from the opening or from a position they wandered into
- **THEN** the rolls finish the board, since every hinted roll lowers a
  number the hint measures

#### Scenario: Paint that must go down is said to

- **WHEN** no painted square can be picked up without first putting paint
  down
- **THEN** the step says so, and rings the square the paint goes on
