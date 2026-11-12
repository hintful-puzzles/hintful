## ADDED Requirements

### Requirement: Controls: A stroke a new way from a number with room adds its line

A drag that begins on a number with fewer lines than it takes, and sets off
along none of them, SHALL replace nothing: it draws the number's missing
line, and the number's other lines stay.

#### Scenario: A stroke from the 3 toward the 2 keeps the line to the 4

- **WHEN** on `4x3zde:1f2_3b4` the line from the 3 along the bottom row to
  the 4 is drawn, and a drag from the 3 runs up one square
- **THEN** the edge up is drawn and the line to the 4 stays
