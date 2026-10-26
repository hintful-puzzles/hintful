## MODIFIED Requirements

### Requirement: Description: Flood refuses a board with more colors to join than moves

`hasNoSolution` SHALL hold where the moves made, plus the number of colors
with a square outside the corner's region, exceed the move limit: each such
color costs a fill, the corner's own included where a square of it lies apart.
The count is a floor on the fills needed, so a board that passes it SHALL
load though no fills finish it in time. The answer SHALL be a bare yes, which
leaves the hint to Flood on a position played past it.

#### Scenario: Three stripes and one move

- **WHEN** the game ID `3x3c3m0:012012012,1` is opened, which has two colors
  outside the corner's column
- **THEN** it is refused with `DESC_NO_SOLUTION`, and with a limit of 2 it
  loads

#### Scenario: The corner's color lies apart

- **WHEN** `3x1c3m0:010,1` is opened, where one fill joins the middle square
  and a second is needed for the far one
- **THEN** it is refused, and `3x1c3m0:010,2` loads

#### Scenario: A board the count lets through

- **WHEN** the checkerboard `3x3c3m0:010101010,2` is opened, which takes four
  fills and has two colors outside the corner
- **THEN** it loads

#### Scenario: A fill that wastes a move

- **WHEN** on `3x1c3m0:012,2` the player fills with color 2, leaving two
  colors to join and one move
- **THEN** `hasNoSolution` holds and Solve refuses, and the hint still gives
  the next fill: `Fill with violet: it joins the ringed square to your
  region.`
