## MODIFIED Requirements

### Requirement: Rules: Pearl reports completion and mistakes

The game SHALL report the board solved exactly while its lines are an answer
of `pearl.description.yaml`: one closed loop through every pearl, with every
clue's meaning holding. It SHALL show always-on error marks where the board
breaks a rule (`Game.rules`), reading every side not yet decided as none
once a loop closes. A move that leaves a line with no reciprocal line in the
neighboring square SHALL be refused.

#### Scenario: A loop that misses a pearl is not solved

- **WHEN** the lines form one closed loop that leaves a pearl's square empty
- **THEN** the board is not reported solved, and that pearl carries an error
  mark

#### Scenario: Lines a square cannot hold

- **WHEN** a square holds three lines, or one line with its other sides
  crossed
- **THEN** its lines are drawn in the error color

#### Scenario: A loop closed with a line apart

- **WHEN** a loop round four squares is closed and one line stands elsewhere
- **THEN** the loop's lines and the lone line are all drawn in the error
  color
