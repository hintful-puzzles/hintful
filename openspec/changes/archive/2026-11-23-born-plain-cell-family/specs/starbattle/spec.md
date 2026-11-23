## MODIFIED Requirements

### Requirement: Controls: The star is the left button and the cross the right

Star Battle's buttons, keys and drag SHALL be those the fill engine derives
from its description (`described-fill-game`): the left button SHALL put a
star on a blank cell and cross it out on its second click, and the right
button SHALL cross it out first; `S` and `X` SHALL place a star and a cross;
a drag SHALL repeat the pressed cell's change on the cells it passes that
held what that cell held. A hand-written Star Battle's save is not read
(the owner's decision, 2026-11-22).

#### Scenario: Two left clicks

- **WHEN** a blank cell is clicked twice with the left button
- **THEN** it holds a star after the first click and a cross after the
  second

### Requirement: Params: A grid too small for its stars is refused

Star Battle SHALL refuse a grid narrower than 4 with one star to a row, 8
with two and 12 with three, because no arrangement of stars exists there:
two rows next to each other hold twice the stars with no two touching. The
refusal SHALL name the ruleset and the least size for it. It SHALL refuse a
grid over 26, and no size for the time its deal takes or the tier asked of
it.

#### Scenario: Two stars on a 7x7

- **WHEN** a 7x7 grid is asked for with two stars
- **THEN** it is refused with "Two stars: the grid size must be at least 8."

#### Scenario: A large grid is dealt

- **WHEN** a 20x20 grid is asked for with one star
- **THEN** it is not refused

### Requirement: Look: A star is drawn as a star, and a region's border by the cells on each side

A star SHALL be drawn as a five-pointed star in the collection's color for a
placed piece, growing as it is placed, and a cross as the collection's
ruled-out cross. Two stars that touch SHALL take a diamond in the error
color where they meet, as two touching pieces do in every game born from
its description. A region's border SHALL be a heavy line, and a hint's ring
and outline SHALL sit inside the cell's surface, never on that line.

#### Scenario: Two stars at a corner

- **WHEN** two stars are placed in cells that share a corner
- **THEN** each is drawn as a star, and a diamond in the error color sits on
  the corner they share

### Requirement: Look: A star or cross is red where the board breaks a rule

Each star or cross SHALL be drawn in the error color where the board breaks
a rule (`Game.rules`) other than two stars touching: every star of a row,
column or region holding too many, and every cross of a row, column or
region its crosses leave no room for its stars.

#### Scenario: Two stars touch

- **WHEN** two stars touch at a corner
- **THEN** neither is drawn in the error color, and the diamond where they
  meet is

#### Scenario: Two stars in a row

- **WHEN** a row of a one-star board holds two stars apart
- **THEN** both are drawn in the error color

#### Scenario: A row crossed out

- **WHEN** every square of a row holds a cross
- **THEN** each cross is drawn in the error color
