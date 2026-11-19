## RENAMED Requirements

- FROM: `### Requirement: Controls: Crossing's reference searches, filters and picks a number up`
- TO: `### Requirement: Controls: Crossing's reference searches, filters and takes a number as the list does`

## MODIFIED Requirements

### Requirement: Controls: Crossing's reference searches, filters and takes a number as the list does

Crossing's reference SHALL ask for a search box, with a "Fits" filter for
outstanding numbers and "Placed" for placed ones and those in conflict.
Selecting a number SHALL do what a click on it in the list under the board
does: write it into a run through the selected square that takes it, and
otherwise pick it up.

#### Scenario: Picking a number up from the reference

- **WHEN** no square is selected and the player selects 54384 in the
  reference
- **THEN** 54384 is held, the board previews it in every run that can take
  it, and a click on such a run writes it in

#### Scenario: Writing a number in from the reference

- **WHEN** a square is selected for digit entry and the player selects, in
  the reference, a number that fits a run through it
- **THEN** the number is written into that run as one move
